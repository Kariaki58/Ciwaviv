import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Order } from "../../../../models/Order";
import { Product } from "../../../../models/product";
import { sendAdminOrderEmail, sendCustomerPaymentEmail } from "@/lib/email/sendEmail";


export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find order by reference
    const order = await Order.findOne({ paystackReference: reference });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (paystackData.data.status === 'success') {
      // Payment successful
      order.paymentStatus = 'paid';
      order.status = 'pending';
      
      // Update product inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { inventory: -item.quantity, sold: item.quantity } }
        );
      }

      await order.save();

      await sendAdminOrderEmail(order)
      await sendCustomerPaymentEmail(order)


      return NextResponse.json({
        success: true,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          customer: order.customer
        },
        message: "Payment successful! Your order has been confirmed."
      });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      return NextResponse.json({
        success: false,
        error: "Payment failed. Please try again.",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    }

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Error verifying payment: " + error.message },
      { status: 500 }
    );
  }
}