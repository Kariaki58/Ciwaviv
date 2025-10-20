
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <CardHeader className="p-0">
          <div className="relative h-80 w-full overflow-hidden">
            <Image
              src={product.images[0].src}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={product.images[0].aiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h3 className="mt-1 text-lg font-headline font-semibold truncate">{product.name}</h3>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xl font-bold text-foreground">₦{product.price.toFixed(2)}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5"/>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
