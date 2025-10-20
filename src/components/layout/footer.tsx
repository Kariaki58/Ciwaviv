import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Newsletter */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Sign up for our newsletter to get the latest news, drops, and deals.
            </p>
            <form className="flex gap-2 max-w-sm">
              <Input type="email" placeholder="Enter your email" className="flex-grow" />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Subscribe</Button>
            </form>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-headline font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/shop?category=men" className="text-muted-foreground hover:text-primary">Men's</Link></li>
              <li><Link href="/shop?category=women" className="text-muted-foreground hover:text-primary">Women's</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Ciwaviv. All Rights Reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook />
              <span className="sr-only">Facebook</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
