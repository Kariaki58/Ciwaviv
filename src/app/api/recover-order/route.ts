import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Order } from "../../../../models/Order";
import { Otp } from "../../../../models/Otp";
import { sendLostOrderOtpEmail } from "@/lib/email/sendEmail";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST → Request OTP
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find recent orders by email
    const orders = await Order.find({ "customer.email": email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders found with this email address" },
        { status: 404 }
      );
    }

    // Generate and store OTP (valid for 10 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove old OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    await Otp.create({ email: email.toLowerCase(), otp, expiresAt });

    const customerName =
      orders[0].customer.firstName || orders[0].customer.name || "Customer";

    // Send email with OTP
    await sendLostOrderOtpEmail(email, customerName, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      orderCount: orders.length,
    });
  } catch (error: any) {
    console.error("Recover order error:", error);
    return NextResponse.json(
      { error: "Error processing request: " + error.message },
      { status: 500 }
    );
  }
}

// PUT → Verify OTP
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP valid — fetch user's orders
    const orders = await Order.find({ "customer.email": email.toLowerCase() })
      .select("orderNumber createdAt status totalAmount items")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Clean up OTP
    await Otp.deleteOne({ email: email.toLowerCase() });

    const formattedOrders = orders.map((order) => ({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      message: `Found ${formattedOrders.length} order(s)`,
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Error verifying OTP: " + error.message },
      { status: 500 }
    );
  }
}
