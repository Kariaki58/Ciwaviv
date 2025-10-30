import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Category } from "../../../../models/category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "../../../../models/user";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({ isActive: true }).select('name _id');
    
    return NextResponse.json({ 
      success: true, 
      categories 
    });
    
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ 
      error: "Error fetching categories" 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    
    const { name, slug } = await req.json();

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    await connectToDatabase();

    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } }, 
        { slug: categorySlug }
      ] 
    });

    if (existingCategory) {
      return NextResponse.json({ 
        error: "Category already exists",
        category: existingCategory 
      }, { status: 400 });
    }

    const category = new Category({
      name,
      slug: categorySlug,
      isActive: true
    });

    await category.save();

    return NextResponse.json({ 
      success: true, 
      _id: category._id,
      name: category.name,
      slug: category.slug
    });
    
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json({ 
      error: "Error creating category: " + error.message 
    }, { status: 500 });
  }
}