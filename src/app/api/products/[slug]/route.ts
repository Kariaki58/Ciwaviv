import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../../config/database";
import { Product } from "../../../../../models/product";
import { Category } from "../../../../../models/category";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();

    // ✅ Await params since Next.js 14+ may pass it as a Promise
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    // 🟢 Find product by slug (no populate)
    const product = await Product.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 🟢 Manual category populate
    let categoryName = "Uncategorized";
    if (product.category) {
      const category = await Category.findById(product.category)
        .select("name")
        .lean();
      if (category?.name) {
        categoryName = category.name;
      }
    }

    // 🧾 Format the response
    const formattedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: categoryName,
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
      slug: product.slug,
    };

    return NextResponse.json({
      success: true,
      product: formattedProduct,
    });
  } catch (error: any) {
    console.error("Product detail fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching product: " + error.message },
      { status: 500 }
    );
  }
}
