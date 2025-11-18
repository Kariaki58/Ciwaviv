import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Customer } from "../../../../models/customer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "../../../../models/user";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build filter for newsletter subscribers
    const filter: any = {};
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    // Fetch newsletter subscribers
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const formattedCustomers = customers.map((customer) => ({
      id: customer._id.toString(),
      email: customer.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching customers: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Customer deletion error:", error);
    return NextResponse.json(
      { error: "Error deleting customer: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 }
      );
    }

    // Create new subscriber
    const customer = new Customer({ email });
    await customer.save();

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      customer: {
        _id: customer._id,
        email: customer.email,
        createdAt: customer.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}