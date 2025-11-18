// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "../../../../../config/database";
import { Order } from "../../../../../models/Order";
import { User } from "../../../../../models/user";
import { authOptions } from "@/lib/auth";

// Simple shipping providers for Nigeria
const SHIPPING_PROVIDERS = [
  { id: "gig", name: "GIG Logistics" },
  { id: "dhl", name: "DHL Nigeria" },
  { id: "fedex", name: "FedEx Nigeria" },
  { id: "ups", name: "UPS Nigeria" },
  { id: "courier", name: "Local Courier" },
  { id: "pickup", name: "Customer Pickup" },
  { id: "other", name: "Other Provider" }
];

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
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.firstName": { $regex: search, $options: "i" } },
        { "customer.lastName": { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Fetch orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      shippingProvider: order.shippingProvider,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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
      },
    });
  } catch (error: any) {
    console.error("Orders fetch error:", error);
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

    await connectToDatabase();

    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      status,
      shippingProvider,
      estimatedDelivery,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find existing order
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Auto-update payment status for certain order statuses
      if (status === 'cancelled' || status === 'refunded') {
        updateData.paymentStatus = 'refunded';
      } else if (status === 'delivered' && existingOrder.paymentStatus === 'paid') {
        updateData.paymentStatus = 'paid';
      }

      // Require shipping provider when shipping
      if (status === 'shipped' && !shippingProvider) {
        return NextResponse.json({ error: "Shipping provider is required when shipping order" }, { status: 400 });
      }
    }

    // Required field for processing status
    if (status === 'processing' && !estimatedDelivery) {
      return NextResponse.json({ error: "Estimated delivery date is required when processing order" }, { status: 400 });
    }

    // Update fields
    if (shippingProvider) {
      const provider = SHIPPING_PROVIDERS.find(p => p.id === shippingProvider);
      if (provider) {
        updateData.shippingProvider = provider.name;
      }
    }
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (notes !== undefined) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        customer: updatedOrder.customer,
        items: updatedOrder.items,
        subtotal: updatedOrder.subtotal,
        shippingFee: updatedOrder.shippingFee,
        taxAmount: updatedOrder.taxAmount,
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        paymentMethod: updatedOrder.paymentMethod,
        shippingAddress: updatedOrder.shippingAddress,
        shippingProvider: updatedOrder.shippingProvider,
        estimatedDelivery: updatedOrder.estimatedDelivery,
        notes: updatedOrder.notes,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
      },
      message: "Order updated successfully",
    });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Error updating order: " + error.message },
      { status: 500 }
    );
  }
}

// Get shipping providers
export async function POST(req: NextRequest) {
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

    return NextResponse.json({
      success: true,
      providers: SHIPPING_PROVIDERS,
    });
  } catch (error: any) {
    console.error("Providers fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching providers: " + error.message },
      { status: 500 }
    );
  }
}