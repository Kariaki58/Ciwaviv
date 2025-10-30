import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Order } from "../../../../models/Order";
import { Product } from "../../../../models/product";
import mongoose from "mongoose";

// ---------- TypeScript Types ----------
interface PopulatedProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  images?: { src: string }[];
}

interface OrderItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId | PopulatedProduct | null;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  subtotal: number;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

interface OrderDocument {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paystackReference?: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- GET /api/checkout ----------
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find order (no populate)
    const order = (await Order.findOne({ orderNumber: orderId }).lean()) as
      | OrderDocument
      | null;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ---- Manual population ----
    const productIds = order.items
      .map((item) =>
        typeof item.product === "object"
          ? (item.product as mongoose.Types.ObjectId)
          : item.product
      )
      .filter((id): id is mongoose.Types.ObjectId => !!id);

    const products = await Product.find({
      _id: { $in: productIds },
    })
      .select("name slug images")
      .lean();

    const productMap = new Map<string, PopulatedProduct>();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    // Attach populated product data manually
    const itemsWithProducts = order.items.map((item) => {
      const product =
        typeof item.product === "object"
          ? productMap.get(item.product.toString())
          : null;

      return {
        id: item._id,
        product: product
          ? {
              id: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0]?.src || "",
            }
          : null,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        subtotal: item.subtotal,
      };
    });

    // ---- Final formatted response ----
    const formattedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: itemsWithProducts,
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
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error: any) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { error: "Error tracking order: " + error.message },
      { status: 500 }
    );
  }
}
