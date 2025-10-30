import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <CardHeader className="p-0">
          <div
            className="
              relative w-full overflow-hidden 
              h-52 sm:h-56 md:h-60 lg:h-72 xl:h-80
            "
          >
            <Image
              src={product.images[0].src}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              data-ai-hint={product.images[0].aiHint}
            />
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {product.category}
          </p>

          <h3
            className="
              mt-1 font-headline font-semibold 
              text-base sm:text-lg leading-tight 
              line-clamp-2
            "
          >
            {product.name}
          </h3>

          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <p className="text-base sm:text-xl font-bold text-foreground">
              {formatPrice(product.price)}
            </p>

            <Button
              variant="ghost"
              size="icon"
              className="
                h-7 w-7 sm:h-8 sm:w-8
                opacity-0 group-hover:opacity-100 transition-opacity
              "
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
