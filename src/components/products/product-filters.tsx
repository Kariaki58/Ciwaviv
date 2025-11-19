'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useEffect, useState } from 'react';

interface ProductFiltersProps {
  onFilterChange: (filters: { category: string; price: string; sort: string }) => void;
  filters: { category: string; price: string; sort: string };
  availableCategories?: Array<{ _id: string; name: string; slug: string; isActive: boolean }>;
}

export default function ProductFilters({ onFilterChange, filters, availableCategories = [] }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; value: string }>>([]);

  useEffect(() => {
    // Transform categories from API to filter format
    const transformedCategories = availableCategories
      .filter(cat => cat.isActive)
      .map(cat => ({
        id: cat._id,
        name: cat.name,
        value: cat.slug // Use slug for filtering
      }));
    
    setCategories(transformedCategories);
  }, [availableCategories]);

  return (
    <aside className="lg:w-64 lg:pr-8">
      <Accordion type="multiple" defaultValue={['category', 'sort']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg font-semibold">Category</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.category}
              onValueChange={(value) => onFilterChange({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.value}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sort">
          <AccordionTrigger className="text-lg font-semibold">Sort By</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.sort}
              onValueChange={(value) => onFilterChange({ ...filters, sort: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}