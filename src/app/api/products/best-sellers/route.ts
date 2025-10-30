import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../../config/database";
import { Category } from "../../../../../models/category";
import { Product } from "../../../../../models/product";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get best-selling products
    let bestSellers = await Product.find({
      isActive: true,
      sold: { $gt: 0 },
    })
      .sort({ sold: -1, createdAt: -1 })
      .limit(4)
      .lean();

    // If fewer than 4 best-sellers, fill up with newest active products
    if (bestSellers.length < 4) {
      const remainingCount = 4 - bestSellers.length;
      const excludedIds = bestSellers.map((product) => product._id);

      const additionalProducts = await Product.find({
        isActive: true,
        _id: { $nin: excludedIds },
      })
        .sort({ createdAt: -1 })
        .limit(remainingCount)
        .lean();

      bestSellers = [...bestSellers, ...additionalProducts];
    }

    // 🟢 Manual populate: fetch all categories used by these products
    const categoryIds = bestSellers.map((p) => p.category).filter(Boolean);
    const categories = await Category.find({
      _id: { $in: categoryIds },
    })
      .select("name _id")
      .lean();

    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat.name])
    );

    // Format response
    const formattedProducts = bestSellers.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      slug: product.slug,
      price: product.price,
      category: categoryMap.get(product.category?.toString()) || "Uncategorized",
      inventory: product.inventory,
      sizes: product.sizes || [],
      colors: product.colors || [],
      sold: product.sold || 0,
      featured: product.featured,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length,
    });
  } catch (error: any) {
    console.error("Best sellers fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching best sellers: " + error.message },
      { status: 500 }
    );
  }
}
