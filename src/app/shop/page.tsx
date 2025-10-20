import { products } from '@/lib/products';
import ProductGrid from '@/components/products/product-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Explore the full collection of Ciwaviv high-performance sportswear and activewear. Find your perfect fit and style.',
};


export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">All Products</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse our entire collection of performance-driven activewear.
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
