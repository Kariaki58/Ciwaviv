import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../../config/database";
import { Product } from "../../../../../models/product";
import { Category } from "../../../../../models/category";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get featured products
    let featuredProducts = await Product.find({
      isActive: true,
      featured: true,
    })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(4)
      .lean();

    // If we don't have 4 featured products, fill with other active products
    if (featuredProducts.length < 4) {
      const remainingCount = 4 - featuredProducts.length;
      const excludedIds = featuredProducts.map((product) => product._id);

      const additionalProducts = await Product.find({
        isActive: true,
        _id: { $nin: excludedIds },
        featured: false, // Get non-featured to fill
      })
        .sort({ createdAt: -1 })
        .limit(remainingCount)
        .lean();

      featuredProducts = [...featuredProducts, ...additionalProducts];
    }

    // 🟢 Manual populate categories
    const categoryIds = featuredProducts.map((p) => p.category).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } })
      .select("name _id")
      .lean();

    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat.name])
    );

    // Format the response
    const formattedProducts = featuredProducts.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: categoryMap.get(product.category?.toString()) || "Uncategorized",
      inventory: product.inventory,
      slug: product.slug,
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
    console.error("Featured products fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching featured products: " + error.message },
      { status: 500 }
    );
  }
}
