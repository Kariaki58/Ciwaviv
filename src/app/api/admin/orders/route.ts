import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../../config/database";
import { Order } from "../../../../../models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "../../../../../models/user";
import { sendCustomerPaymentConfirmed, sendOrderDeliveredEmail } from "@/lib/email/sendEmail";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Get orders with population
    const orders = await Order.find(filter)
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items.map(item => ({
        ...item,
        product: item.product ? {
          id: item.product._id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images?.[0]?.src || ''
        } : null
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paystackReference: order.paystackReference,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      shippingProvider: order.shippingProvider,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });

  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching orders: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, updates } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find and update order
    // Clean out empty fields before updating
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: cleanedUpdates },
      { new: true }
    ).populate('items.product', 'name slug images');


    

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (updates.status === 'Confirmed' || updates.status === "confirmed") {
      await sendCustomerPaymentConfirmed(order.customer.email, order.orderNumber, order.customer.firstName)
    }

    if (updates.status === 'delivered' || updates.status === "Delivered") {
      await sendOrderDeliveredEmail(order.orderNumber, order.customer.firstName, order.customer.email, order.shippingProvider, order.notes)
    }

    const formattedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items.map(item => ({
        ...item.toObject(),
        product: item.product ? {
          id: item.product._id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images?.[0]?.src || ''
        } : null
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paystackReference: order.paystackReference,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      shippingProvider: order.shippingProvider,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
      message: "Order updated successfully"
    });

  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "Error updating order: " + error.message },
      { status: 500 }
    );
  }
}