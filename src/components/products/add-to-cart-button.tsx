
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0].src,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Size</Label>
        <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <div key={size}>
              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
              <Label
                htmlFor={`size-${size}`}
                className={`flex items-center justify-center rounded-md border-2 p-3 px-4 text-sm font-medium uppercase hover:bg-accent cursor-pointer transition-all duration-200 ${
                  selectedSize === size ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border'
                }`}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">Color</Label>
        <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-3">
          {product.colors.map((color) => (
            <div key={color}>
              <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
              <Label
                htmlFor={`color-${color}`}
                className={cn(
                  "h-10 w-10 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center",
                  selectedColor === color ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border'
                )}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                <span className="sr-only">{color}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <Button onClick={handleAddToCart} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        <ShoppingBag className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
