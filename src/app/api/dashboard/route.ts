import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "../../../../config/database";
import { Order } from "../../../../models/Order";
import { Customer } from "../../../../models/customer";
import { Product } from "../../../../models/product";
import { User } from "../../../../models/user";


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

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'week';

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate date ranges
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    
    switch (range) {
      case 'today':
        previousStartDate.setDate(startDate.getDate() - 1);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        previousStartDate.setDate(startDate.getDate() - 7);
        previousEndDate.setDate(startDate.getDate() - 1);
        break;
      case 'month':
        previousStartDate.setMonth(startDate.getMonth() - 1);
        previousEndDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Current period stats
    const currentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: now },
      status: { $ne: 'cancelled' }
    });

    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const currentOrderCount = currentOrders.length;

    // Previous period stats
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      status: { $ne: 'cancelled' }
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousOrderCount = previousOrders.length;

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0;

    const orderGrowth = previousOrderCount > 0
      ? Math.round(((currentOrderCount - previousOrderCount) / previousOrderCount) * 100)
      : currentOrderCount > 0 ? 100 : 0;

    // Get other stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status createdAt')
      .lean();

    // Top products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .select('name price sold')
      .lean();

    return NextResponse.json({
      success: true,
      totalRevenue: currentRevenue,
      totalOrders: currentOrderCount,
      totalProducts,
      totalCustomers,
      revenueGrowth,
      orderGrowth,
      recentOrders,
      topProducts
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}