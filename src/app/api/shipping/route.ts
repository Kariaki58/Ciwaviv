import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "../../../../config/database";
import { User } from "../../../../models/user";
import { Shipping } from "../../../../models/shipping";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const shippingPrices = await Shipping.find({ type: 'specific' });
    const flatFeeSetting = await Shipping.findOne({ type: 'flat' });
    
    return NextResponse.json({ 
      success: true, 
      prices: shippingPrices,
      flatFee: flatFeeSetting?.price || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Clear existing specific prices
    await Shipping.deleteMany({ type: 'specific' });

    // Save new specific prices
    if (body.prices && body.prices.length > 0) {
      const specificPrices = body.prices.map((price: any) => ({
        ...price,
        type: 'specific'
      }));
      await Shipping.insertMany(specificPrices);
    }

    // Save flat fee
    await Shipping.findOneAndUpdate(
      { type: 'flat' },
      { 
        type: 'flat',
        price: body.flatFee || 0,
        country: 'ALL',
        state: 'ALL', 
        city: 'ALL'
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Shipping settings saved successfully" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}