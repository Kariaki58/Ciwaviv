import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../config/database";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000'); // Default high value for Nigeria
    const sort = searchParams.get('sort') || 'featured';
    const search = searchParams.get('search') || '';



    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };
    
    // Category filter
    if (category && category !== 'all') {
      // Find category by name to get its ID
      const categoryDoc = await Category.findOne({ 
        slug: { $regex: new RegExp(`^${category}$`, 'i') } 
      });

      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    // Price range filter
    if (minPrice > 0 || maxPrice < 1000000) {
      filter.price = {
        ...(minPrice > 0 && { $gte: minPrice }),
        ...(maxPrice < 1000000 && { $lte: maxPrice })
      };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortOptions: any = {};
    switch (sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { sold: -1, rating: -1 };
        break;
      default: // 'featured' and default
        sortOptions = { featured: -1, createdAt: -1 };
        break;
    }

    // Get products with population
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get price range for filters
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    // Get categories for filters
    const categories = await Category.find({ isActive: true })
      .select('name _id')
      .sort({ name: 1 })
      .lean();

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?.name || 'Uncategorized',
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
      slug: product.slug
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
        limit
      },
      filters: {
        categories: categories.map(cat => ({
          id: cat._id,
          name: cat.name,
          value: cat.name.toLowerCase()
        })),
        priceRange: priceRange.length > 0 ? {
          min: Math.floor(priceRange[0].minPrice / 1000) * 1000, // Round down to nearest 1000
          max: Math.ceil(priceRange[0].maxPrice / 1000) * 1000   // Round up to nearest 1000
        } : { min: 0, max: 100000 }
      }
    });

  } catch (error: any) {
    console.error("Shop products fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching products: " + error.message },
      { status: 500 }
    );
  }
}