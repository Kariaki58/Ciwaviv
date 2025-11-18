import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '../../../../config/database';
import { Category } from '../../../../models/category';
import { authOptions } from '@/lib/auth';

// GET all categories
export async function GET() {
  try {
    await connectToDatabase();
    
    const categories = await Category.find({}).sort({ createdAt: -1 });
    
    console.log('Fetched categories:', categories);
    return NextResponse.json({ 
      success: true,

      categories: categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        categoryImage: cat.categoryImage,
        isActive: cat.isActive,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { name, slug, description, categoryImage, isActive } = body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug,
      description,
      categoryImage,
      isActive: isActive !== undefined ? isActive : true
    });

    await category.save();

    return NextResponse.json({ 
      message: 'Category created successfully',
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        categoryImage: category.categoryImage,
        isActive: category.isActive,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}