import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "../../../../models/user";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";
import { Types } from "mongoose";
import { extractPublicId } from "@/lib/cloudinary/cloud-fun";
import { DeleteFile } from "@/lib/cloudinary/cloud-fun";



export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // 🧩 Build filter object
    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category._id;
    }

    // 🟢 Fetch products without populate
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 🟢 Manual populate categories
    const categoryIds = products.map((p) => p.category).filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } })
      .select("name _id")
      .lean();

    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat.name])
    );

    // 🧮 Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // 🧾 Format response
    const formattedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: categoryMap.get(product.category?.toString()) || "Uncategorized",
      inventory: product.inventory,
      sizes: product.sizes || [],
      colors: product.colors || [],
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
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching products: " + error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "You are not authorized" }, { status: 403 });
    }

    const body = await req.json();
    
    const {
      name,
      description,
      price,
      category,
      inventory,
      sizes,
      colors,
      featured,
      aiHint,
      images
    } = body;

    // Validation
    if (!name || !description || !price || !category || !inventory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    let categoryId;

    // Check if category is a valid ObjectId (existing category)
    if (Types.ObjectId.isValid(category)) {
      categoryId = category;
    } else {
      // It's a string, so we need to find or create the category
      const categorySlug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let existingCategory = await Category.findOne({ 
        $or: [
          { name: { $regex: new RegExp(`^${category}$`, 'i') } },
          { slug: categorySlug }
        ]
      });

      if (!existingCategory) {
        // Create new category
        existingCategory = new Category({
          name: category,
          slug: categorySlug,
          isActive: true
        });
        await existingCategory.save();
      }
      
      categoryId = existingCategory._id;
    }

    // Verify the category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Create product with images
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category: categoryId, // Use the ObjectId
      inventory: parseInt(inventory),
      sizes: sizes ? sizes.split(',').map((s: string) => s.trim()) : [],
      colors: colors ? colors.split(',').map((c: string) => c.trim()) : [],
      featured: Boolean(featured),
      images: images.map((url: string) => ({
        src: url,
        alt: name,
        aiHint: aiHint || ''
      })),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    });

    await product.save();

    return NextResponse.json({ 
      success: true, 
      product,
      message: "Product created successfully" 
    });

  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ 
      error: "Error creating product: " + error.message 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "customer") {
      return NextResponse.json({ error: "You are not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      category,
      inventory,
      sizes,
      colors,
      featured,
      aiHint,
      images,
      removedImages
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Find existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let categoryId = category;

    // Handle category if it's a string (new category)
    if (category && !Types.ObjectId.isValid(category)) {
      const categorySlug = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let existingCategory = await Category.findOne({ 
        $or: [
          { name: { $regex: new RegExp(`^${category}$`, 'i') } },
          { slug: categorySlug }
        ]
      });

      if (!existingCategory) {
        existingCategory = new Category({
          name: category,
          slug: categorySlug,
          isActive: true
        });
        await existingCategory.save();
      }
      
      categoryId = existingCategory._id;
    }

    // Delete removed images from Cloudinary
    if (removedImages && removedImages.length > 0) {
      for (const imageUrl of removedImages) {
        try {
          const publicId = extractPublicId(imageUrl);
          await DeleteFile(publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
          // Continue with update even if image deletion fails
        }
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        category: categoryId,
        inventory: parseInt(inventory),
        sizes: sizes ? sizes.split(',').map((s: string) => s.trim()) : [],
        colors: colors ? colors.split(',').map((c: string) => c.trim()) : [],
        featured: Boolean(featured),
        images: images.map((url: string, index: number) => ({
          src: url,
          alt: name,
          aiHint: aiHint || ''
        })),
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
      },
      { new: true }
    ).populate('category', 'name');

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: "Product updated successfully" 
    });

  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ 
      error: "Error updating product: " + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "customer") {
      return NextResponse.json({ error: "You are not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Find product to get image URLs
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          const publicId = extractPublicId(image.src);
          await DeleteFile(publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully" 
    });

  } catch (error: any) {
    console.error("Product deletion error:", error);
    return NextResponse.json({ 
      error: "Error deleting product: " + error.message 
    }, { status: 500 });
  }
}
