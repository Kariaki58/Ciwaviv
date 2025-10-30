import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Customer } from "../../../../models/customer";


// GET - Fetch customers (with optional email filter)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    await connectToDatabase();

    const filter: any = {};
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      customers: customers.map(customer => ({
        _id: customer._id,
        email: customer.email,
        createdAt: customer.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new newsletter subscriber
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