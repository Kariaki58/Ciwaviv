"use client";

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();


  const socialMediaLinks = {
    facebook: 'https://facebook.com/fithubbyciwaviv',
    twitter: 'https://x.com/fithubbyciwaviv',
    instagram: 'https://instagram.com/fithubbyciwaviv',
    linkedin: 'https://www.linkedin.com/company/ciwavivltd'
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter",
        });
        setEmail('');
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-100 shadow-2xl shadow-slate-900/40 text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Newsletter */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Sign up for our newsletter to get the latest news, drops, and deals from our Nigerian brand.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-headline font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/shop?category=men" className="text-muted-foreground hover:text-primary">Men's</Link></li>
              <li><Link href="/shop?category=women" className="text-muted-foreground hover:text-primary">Women's</Link></li>
              <li><Link href="/shop?sort=newest" className="text-muted-foreground hover:text-primary">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/track-order" className="text-muted-foreground hover:text-primary">Track Order</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div>
          <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base mt-5">Follow Us</h4>
          <div className="flex space-x-3 sm:space-x-4">
            {/* Facebook */}
            <a
              href={socialMediaLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-[#265287] hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Facebook className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* Twitter/X */}
            <a
              href={socialMediaLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-[#265287] hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Twitter className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* Instagram */}
            <a
              href={socialMediaLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-[#265287] hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Instagram className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            {/* LinkedIn */}
            <a
              href={socialMediaLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-[#265287] hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Linkedin className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}