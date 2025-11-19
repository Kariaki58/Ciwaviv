"use client";
import { useState } from 'react';

import Link from 'next/link';
import Logo from '@/components/logo';
import CartIcon from '@/components/cart/cart-icon';
import MobileNav from './mobile-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/admindashboard', label: 'admin' }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">

        {/* Desktop Logo */}
        <div className="mr-8 hidden md:flex">
          <Logo />
        </div>

        {/* Mobile Logo */}
        <div className="flex items-center md:hidden">
          <Logo />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:gap-6 ml-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end ml-auto gap-2">
          <CartIcon />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="backdrop-blur-lg bg-background"
            >
              <MobileNav navLinks={navLinks} setIsOpen={setIsOpen} />
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
