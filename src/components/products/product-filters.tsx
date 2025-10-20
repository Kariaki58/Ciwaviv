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

interface ProductFiltersProps {
  onFilterChange: (filters: { category: string; price: string; sort: string }) => void;
  filters: { category: string; price: string; sort: string };
}

export default function ProductFilters({ onFilterChange, filters }: ProductFiltersProps) {
  return (
    <aside className="lg:w-64 lg:pr-8">
      <Accordion type="multiple" defaultValue={['category', 'price', 'sort']} className="w-full">
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-semibold">Price</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.price}
              onValueChange={(value) => onFilterChange({ ...filters, price: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="under-50">Under $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="over-100">Over $100</SelectItem>
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
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
