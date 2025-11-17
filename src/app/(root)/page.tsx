"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/products/product-card';

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

// Category data that can be converted to API later
const categories = [
  {
    id: '1',
    name: 'Gym Wears',
    slug: 'gym-wears',
    image: '/fithub_1.jpg',
    description: 'Performance-focused apparel for your workouts',
    productCount: 24
  },
  {
    id: '2',
    name: 'Fithub Clothes',
    slug: 'fithub-clothes',
    image: '/fithub_12.jpg',
    description: 'Signature collection for everyday athletes',
    productCount: 18
  },
  {
    id: '3',
    name: 'Dumbbells',
    slug: 'dumbbells',
    image: '/gemini_5.png',
    description: 'Premium weights for strength training',
    productCount: 12
  },
  {
    id: '4',
    name: 'Training Gear',
    slug: 'training-gear',
    image: '/gemini_7.png',
    description: 'Essential equipment for complete workouts',
    productCount: 15
  },
  {
    id: '5',
    name: 'Accessories',
    slug: 'accessories',
    image: '/gemini_8.png',
    description: 'Complete your fitness journey',
    productCount: 8
  }
];

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/featured`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function getBestSellers(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/best-sellers`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch best sellers');
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
}

export default async function Home() {
  const [featuredProducts, bestSellers] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers()
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] w-full">
        <div className="hidden md:block">
          <Image
            src="/fithub_8.jpg"
            alt="Athlete in motion"
            fill
            className="object-cover"
            priority
            data-ai-hint="athlete motion desktop"
          />
        </div>
        {/* mobile banner */}
        <div className="block md:hidden">
          <Image
            src="/fithub_8.jpg"
            alt="Athlete in motion"
            fill
            className="object-cover"
            priority
            data-ai-hint="athlete motion mobile"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full text-center text-white pb-20 px-4">
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Shop By Category
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Explore our curated collections designed for every aspect of your fitness journey
          </p>
          
          <div className="relative">
            <div className="flex overflow-x-auto pb-6 hide-scrollbar gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="flex-shrink-0 w-80 group"
                >
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-headline font-bold mb-2">
                        {category.name}
                      </h3>
                      {/* <p className="text-sm text-gray-200 mb-3">
                        {category.description}
                      </p> */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm bg-primary px-3 py-1 rounded-full">
                          {category.productCount} products
                        </span>
                        <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Featured Collection
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover our latest arrivals, combining cutting-edge tech with bold, modern designs.
          </p>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            Our Best Sellers
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Trusted by athletes. Loved by all. These are the styles that are flying off the shelves.
          </p>
          
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No best sellers available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/shop">
                Shop All Products <ShoppingBag className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Persuasive Section 1 */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/fithub_1.jpg"
                alt="Man wearing Fithub sportswear"
                fill
                className="object-cover"
                data-ai-hint="male athlete"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="font-headline text-primary font-semibold">BUILT FOR PERFORMANCE</p>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mt-2 mb-6">
                Unleash Your Potential
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every piece in our collection is crafted with precision, using advanced materials that offer superior breathability, flexibility, and durability. Stop settling for less. Elevate your performance and conquer your goals with Fithub.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop?category=men">Shop Men's</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Persuasive Section 2 */}
      <section className="bg-card">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left md:order-2">
              <p className="font-headline text-primary font-semibold">DESIGNED FOR STYLE</p>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mt-2 mb-6">
                Look as Good as You Feel
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We believe high-performance gear should never compromise on style. Our modern, energetic aesthetic ensures you look sharp, whether you're hitting a new personal best or navigating your day.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop?category=women">Shop Women's</Link>
              </Button>
            </div>
            <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg md:order-1">
              <Image
                src="/fithub_12.jpg"
                alt="Woman wearing Fithub sportswear"
                fill
                className="object-cover"
                data-ai-hint="female athlete"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fithub Styles Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-4">
            #FithubSTYLES
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how our community moves. Tag us on social media for a chance to be featured.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg group">
              <Image src="/gemini_5.png" alt="Athlete posing" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="athlete posing"/>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg group">
              <Image src="/gemini_11.png" alt="Athlete stretching" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="athlete stretching"/>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg group">
              <Image src="/gemini_7.png" alt="Athlete in urban environment" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="urban athlete"/>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg group">
              <Image src="/gemini_8.png" alt="Athlete in nature" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="nature athlete"/>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}