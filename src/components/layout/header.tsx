
import Link from 'next/link';
import Logo from '@/components/logo';
import CartIcon from '@/components/cart/cart-icon';
import MobileNav from './mobile-nav';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/admin', label: 'admin' }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 hidden md:flex">
          <Link href="/" aria-label="Back to homepage">
            <Logo />
          </Link>
        </div>
        
        <div className="flex items-center md:hidden">
            <MobileNav navLinks={navLinks} />
        </div>
        
        <div className="flex flex-1 items-center justify-between md:justify-start">
            <div className="md:hidden">
              <Link href="/" aria-label="Back to homepage">
                <Logo />
              </Link>
            </div>
            <nav className="hidden md:flex md:gap-6">
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
        </div>

        <div className="flex items-center justify-end gap-2">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
