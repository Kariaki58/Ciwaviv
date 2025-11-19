import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Order } from "../../../../models/Order";
import { Product } from "../../../../models/product";

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface CheckoutRequest {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  items: CheckoutItem[];
  totalAmount: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body: CheckoutRequest = await req.json();
    
    const { customer, shippingAddress, items, totalAmount, shippingFee } = body;

    // Validate required fields
    if (!customer?.email || !customer?.firstName || !customer?.lastName || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer information is incomplete" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state) {
      return NextResponse.json(
        { error: "Shipping address is incomplete" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Check product availability and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById((item.productId).split('-')[0]);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productName} not found` },
          { status: 400 }
        );
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for ${item.productName}. Only ${product.inventory} available.` },
          { status: 400 }
        );
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: (item.productId).split('-')[0],
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        subtotal: itemSubtotal
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = new Order({
      customer,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee: shippingFee, // Free shipping for Nigeria
      taxAmount: 0, // No tax for now
      totalAmount,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'paystack'
    });

    await order.save();

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customer.email,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        reference: order.orderNumber,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`,
        metadata: {
          orderId: order._id.toString(),
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${customer.firstName} ${customer.lastName}`
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: customer.phone
            }
          ]
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      // Delete the order if Paystack initialization fails
      await Order.findByIdAndDelete(order._id);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Update order with Paystack reference
    order.paystackReference = paystackData.data.reference;
    await order.save();

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference: paystackData.data.reference,
      orderId: order._id
    });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Error processing checkout: " + error.message },
      { status: 500 }
    );
  }
}