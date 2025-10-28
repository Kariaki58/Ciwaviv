'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import ProductFilters from './product-filters';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [filters, setFilters] = useState({
    category: 'all',
    price: 'all',
    sort: 'featured',
  });

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Filter by price
    if (filters.price !== 'all') {
      filtered = filtered.filter(p => {
        if (filters.price === 'under-50') return p.price < 50;
        if (filters.price === '50-100') return p.price >= 50 && p.price <= 100;
        if (filters.price === 'over-100') return p.price > 100;
        return true;
      });
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming products are already somewhat sorted by newness (or we can add a date property)
        filtered.reverse();
        break;
      default: // 'featured'
        // No change, use default order
        break;
    }

    return filtered;
  }, [products, filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <ProductFilters filters={filters} onFilterChange={setFilters} />
      <div className="flex-1">
        {filteredAndSortedProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-3 gap-2"
          >
            <AnimatePresence>
              {filteredAndSortedProducts.map((product) => (
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
