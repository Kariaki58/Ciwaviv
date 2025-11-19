// REMOVE "use client" — this must be a SERVER COMPONENT

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/products/product-card';
import { ArrowRight, ShoppingBag } from 'lucide-react';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------
    SERVER-SAFE FETCH FUNCTIONS
--------------------------------*/
async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // stable ISR
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("FETCH ERROR →", url, err);
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  const data = await fetchJSON<{ categories: Category[] }>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/categories`
  );
  return data?.categories ?? [];
}

async function getFeaturedProducts(): Promise<Product[]> {
  const data = await fetchJSON<{ products: Product[] }>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/featured`
  );
  return data?.products ?? [];
}

async function getBestSellers(): Promise<Product[]> {
  const data = await fetchJSON<{ products: Product[] }>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/best-sellers`
  );
  return data?.products ?? [];
}

/* ------------------------------
     MAIN SERVER COMPONENT PAGE
--------------------------------*/
export default async function Home() {
  const [categories, featuredProducts, bestSellers] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getBestSellers()
  ]);

  const activeCategories = categories
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.categoryImage || getFallbackImage(c.slug),
    }));

  function getFallbackImage(slug: string): string {
    const fallback = {
      'gym-wears': '/fithub_1.jpg',
      'fithub-clothes': '/fithub_12.jpg',
      'dumbbells': '/gemini_5.png',
      'training-gear': '/gemini_7.png',
      'accessories': '/gemini_8.png',
      'men': '/fithub_1.jpg',
      'women': '/fithub_12.jpg',
      'equipment': '/gemini_5.png'
    };
    return fallback[slug] || '/fithub_1.jpg';
  }

  return (
    <div className="flex flex-col">

      {/* -----------------------
          HERO SECTION 
      ------------------------*/}
      <section className="relative h-[70vh] md:h-[90vh] w-full">
        <Image
          src="/banner.jpg"
          alt="Athlete in motion"
          fill
          className="object-cover"
          priority
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* TEXT + BUTTON */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-cyan-100 px-4">
          <div className="bg-white/1 backdrop-blur-[2px] p-4 rounded-xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Gear Up in Style
            </h1>

            <p className="text-lg md:text-2xl font-bold text-cyan-100 max-w-2xl mb-8 drop-shadow-md">
              Shop premium sportswear and active gear designed for comfort, performance, and style.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg"
            >
              <Link href="/shop">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>



      {/* -----------------------
          CATEGORIES
      ------------------------*/}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Shop By Category</h2>

          {activeCategories.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-6 hide-scrollbar">
              {activeCategories.map((cat) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex-shrink-0 w-80 group">
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-all">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <p className="text-sm text-gray-200 mb-3">{cat.description}</p>
                      <span className="text-sm bg-primary px-3 py-1 text-black rounded-full">Shop Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No categories available.</p>
          )}
        </div>
      </section>

      {/* -----------------------
          FEATURED PRODUCTS
      ------------------------*/}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Featured Collection</h2>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No featured products.</p>
          )}
        </div>
      </section>

      {/* -----------------------
          BEST SELLERS
      ------------------------*/}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Best Sellers</h2>

          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No best sellers.</p>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/shop">Shop All Products <ShoppingBag className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
