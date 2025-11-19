"use client";

import Link from "next/link";
import Logo from "@/components/logo";

interface MobileNavProps {
  navLinks: { href: string; label: string }[];
  setIsOpen: (open: boolean) => void;
}

export default function MobileNav({ navLinks, setIsOpen }: MobileNavProps) {
  return (
    <div className="p-4">
      <Logo />

      <nav className="flex flex-col gap-6 mt-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium text-foreground transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
