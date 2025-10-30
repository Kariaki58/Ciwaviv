import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../../config/database";
import { Shipping } from "../../../../../models/shipping";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { country, state, city } = body;

    if (!country || !state || !city) {
      return NextResponse.json(
        { error: "Country, state, and city are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First, try to find specific shipping price for the exact city
    let shippingPrice = await Shipping.findOne({
      type: 'specific',
      country: { $regex: new RegExp(`^${country}$`, 'i') },
      state: { $regex: new RegExp(`^${state}$`, 'i') },
      city: { $regex: new RegExp(`^${city}$`, 'i') }
    });

    // If no city match, try state level
    if (!shippingPrice) {
      shippingPrice = await Shipping.findOne({
        type: 'specific',
        country: { $regex: new RegExp(`^${country}$`, 'i') },
        state: { $regex: new RegExp(`^${state}$`, 'i') },
        city: 'ALL' // Assuming you might have state-level pricing
      });
    }

    // If still no match, use flat fee
    if (!shippingPrice) {
      shippingPrice = await Shipping.findOne({ type: 'flat' });
    }

    return NextResponse.json({
      success: true,
      shippingFee: shippingPrice?.price || 0,
      priceType: shippingPrice?.type || 'flat'
    });

  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}