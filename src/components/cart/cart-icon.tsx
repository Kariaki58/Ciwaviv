'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';
import { useIsMounted } from '@/hooks/use-is-mounted';

export default function CartIcon() {
  const { itemCount } = useCart();
  const isMounted = useIsMounted();

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/cart">
        <ShoppingBag />
        <span className="sr-only">Open cart</span>
        {isMounted && itemCount > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {itemCount}
          </div>
        )}
      </Link>
    </Button>
  );
}
