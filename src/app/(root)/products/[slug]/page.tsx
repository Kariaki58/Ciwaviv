import { notFound } from 'next/navigation';
import ProductImageCarousel from '@/components/products/product-image-carousel';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import RelatedProducts from '@/components/products/related-products';
import AddToCartButton from '@/components/products/add-to-cart-button';
import type { Metadata } from 'next';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: Array<{ src: string; alt: string }>;
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  inventory: number;
  sold?: number;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?category=${category}&limit=4`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch related products');
    }
    
    const data = await response.json();
    // Filter out the current product
    return data.products?.filter((product: Product) => product.id !== excludeId) || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.name} - Premium Sportswear | Fithub`;
  const description = `Shop the ${product.name} from Fithub. ${product.description} Available in multiple sizes and colors. High-performance activewear made in Nigeria.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images[0]?.src || '/placeholder-image.jpg',
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product.category, product.id);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <ProductImageCarousel images={product.images} />
          <div className="sticky top-24">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-headline font-bold my-3">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) 
                        ? 'text-primary fill-primary' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                {product.reviewCount} Review{product.reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-3xl font-bold mb-6">{formatPrice(product.price)}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Inventory Status */}
            <div className="mb-6">
              <p className={`text-sm ${
                product.inventory > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.inventory > 0 
                  ? `${product.inventory} in stock` 
                  : 'Out of stock'
                }
              </p>
            </div>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}