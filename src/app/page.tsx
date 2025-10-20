import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { products } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <Image
          src="https://picsum.photos/seed/hero/1800/1200"
          alt="Athlete in motion"
          fill
          className="object-cover"
          priority
          data-ai-hint="athlete motion"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight text-primary">
            Energize Your Movement
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200">
            Discover high-performance activewear designed to keep up with your every move.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <CardHeader className="p-0">
                  <div className="relative h-96 w-full">
                    <Image
                      src={product.images[0].src}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      data-ai-hint={product.images[0].aiHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-2xl mb-2">{product.name}</CardTitle>
                  <p className="text-muted-foreground mb-4">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
                    <Button asChild variant="outline">
                      <Link href={`/products/${product.slug}`}>View Product</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="ghost">
              <Link href="/shop">
                Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                Our Mission: Unstoppable Performance
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Ciwaviv, we're dedicated to creating innovative sportswear that fuels your passion and pushes your limits. We believe that the right gear can unlock your full potential, providing the comfort, durability, and style you need to conquer any challenge.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckIcon className="text-primary mr-3 mt-1" />
                  <span><strong>Cutting-Edge Fabrics:</strong> Breathable, moisture-wicking materials for peak comfort.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="text-primary mr-3 mt-1" />
                  <span><strong>Ergonomic Design:</strong> Engineered for a full range of motion without restriction.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="text-primary mr-3 mt-1" />
                  <span><strong>Sustainable Practices:</strong> Committed to a healthier planet for future generations of athletes.</span>
                </li>
              </ul>
            </div>
            <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-xl">
               <Image
                  src="https://picsum.photos/seed/mission/800/600"
                  alt="Athlete celebrating"
                  fill
                  className="object-cover"
                  data-ai-hint="athlete celebrating"
               />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            What Our Athletes Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Alex R.', quote: "The most comfortable and durable gear I've ever owned. Ciwaviv is a game-changer!" },
              { name: 'Jessie M.', quote: "From the gym to the streets, the style and performance are unmatched. I feel unstoppable." },
              { name: 'Sam K.', quote: "I love the brand's commitment to sustainability without compromising on quality. Highly recommend!" },
            ].map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <p className="font-bold text-right">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
