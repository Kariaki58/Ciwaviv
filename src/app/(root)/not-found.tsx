import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-15rem)] items-center justify-center text-center px-4">
      <div>
        <Frown className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-8 text-5xl font-headline font-bold tracking-tight sm:text-6xl">
          404 - Page Not Found
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/">Go back home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
