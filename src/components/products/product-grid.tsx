'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import ProductFilters from './product-filters';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../ui/pagination';

interface ProductGridProps {
  initialProducts: Product[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  initialFilters: {
    categories: Array<{ id: string; name: string; value: string }>;
    priceRange: { min: number; max: number };
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductGrid({ 
  initialProducts, 
  initialPagination, 
  initialFilters,
  searchParams 
}: ProductGridProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState({
    category: typeof searchParams.category === 'string' ? searchParams.category : 'all',
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'featured',
    minPrice: typeof searchParams.minPrice === 'string' ? searchParams.minPrice : '',
    maxPrice: typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : '',
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
  });
  const [loading, setLoading] = useState(false);

  // Update URL when filters change
  const updateURL = (newFilters: typeof filters, page: number = 1) => {
    const newParams = new URLSearchParams();
    
    if (newFilters.category !== 'all') newParams.set('category', newFilters.category);
    if (newFilters.sort !== 'featured') newParams.set('sort', newFilters.sort);
    if (newFilters.minPrice) newParams.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) newParams.set('maxPrice', newFilters.maxPrice);
    if (newFilters.search) newParams.set('search', newFilters.search);
    if (page > 1) newParams.set('page', page.toString());
    
    router.push(`/shop?${newParams.toString()}`, { scroll: false });
  };

  // Fetch products when filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        if (filters.category !== 'all') queryParams.set('category', filters.category);
        if (filters.sort !== 'featured') queryParams.set('sort', filters.sort);
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
        if (filters.search) queryParams.set('search', filters.search);
        queryParams.set('page', pagination.currentPage.toString());
        
        const response = await fetch(`/api/shop?${queryParams}`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateURL(updatedFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    updateURL(filters, page);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <ProductFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        availableFilters={initialFilters}
      />
      
      <div className="flex-1">
        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} of{' '}
            {pagination.totalProducts} products
          </p>
          
          {/* Sort Dropdown */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange({ sort: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-2"
            >
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center bg-card rounded-lg">
            <h3 className="text-2xl font-semibold">No products found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}