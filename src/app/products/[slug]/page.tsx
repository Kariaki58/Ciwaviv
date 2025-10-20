
import { getProductBySlug, products } from '@/lib/products';
import { notFound } from 'next/navigation';
import ProductImageCarousel from '@/components/products/product-image-carousel';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import RelatedProducts from '@/components/products/related-products';
import AddToCartButton from '@/components/products/add-to-cart-button';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.name} - Premium Sportswear | Ciwaviv`;
  const description = `Shop the ${product.name} from Ciwaviv. ${product.description} Available in multiple sizes and colors. High-performance activewear made in Nigeria.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images[0].src,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

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
                  <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-primary fill-primary' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-muted-foreground">125 Reviews</p>
            </div>
            <p className="text-3xl font-bold mb-6">₦{product.price.toFixed(2)}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
