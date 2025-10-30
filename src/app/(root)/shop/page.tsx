import ProductGrid from '@/components/products/product-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products - Fithub Nigeria',
  description:
    'Explore the full collection of Fithub high-performance sportswear and activewear. Find your perfect fit and style, designed in Nigeria for the world.',
};

async function getShopProducts(page: number = 1, filters: any = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...filters,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shop?${params}`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return {
      success: false,
      products: [],
      pagination: { currentPage: 1, totalPages: 1, totalProducts: 0 },
      filters: { categories: [], priceRange: { min: 0, max: 100000 } },
    };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // ✅ Await the promise
  const params = await searchParams;

  const page = params.page ? parseInt(params.page) : 1;
  const category = params.category || 'all';
  const sort = params.sort || 'featured';
  const minPrice = params.minPrice || '';
  const maxPrice = params.maxPrice || '';
  const search = params.search || '';

  const filters: Record<string, string> = {};
  if (category !== 'all') filters.category = category;
  if (sort !== 'featured') filters.sort = sort;
  if (minPrice) filters.minPrice = minPrice;
  if (maxPrice) filters.maxPrice = maxPrice;
  if (search) filters.search = search;

  const data = await getShopProducts(page, filters);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          All Products
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse our entire collection of performance-driven activewear, proudly
          designed in Nigeria.
        </p>
      </div>
      <ProductGrid
        initialProducts={data.products}
        initialPagination={data.pagination}
        initialFilters={data.filters}
        searchParams={params}
      />
    </div>
  );
}
