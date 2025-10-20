'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ProductImageCarouselProps {
  images: { src: string; alt: string; aiHint: string }[];
}

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    setCurrent(api.selectedScrollSnap());
  }, []);

  const onThumbClick = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="flex flex-col gap-4">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden">
                <CardContent className="relative aspect-square p-0">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    data-ai-hint={image.aiHint}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button key={index} onClick={() => onThumbClick(index)}>
            <div
              className={`relative aspect-square rounded-md overflow-hidden transition-opacity ${
                index === current ? 'opacity-100 ring-2 ring-primary' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="20vw"
                data-ai-hint={image.aiHint}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
