import type { Metadata } from 'next';
import "./globals.css";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL('https://Fithub.com'),
  title: {
    default: 'Fithub - Energize Your Movement | High-Performance Sportswear from Nigeria',
    template: '%s | Fithub Nigeria',
  },
  description: 'Discover high-performance sportswear and activewear from Fithub, a Nigerian brand dedicated to quality and style. Shop the latest collections for men and women and energize your movement.',
  openGraph: {
    title: 'Fithub - Energize Your Movement | High-Performance Sportswear from Nigeria',
    description: 'High-performance sportswear and activewear to energize your movement. Proudly Nigerian.',
    type: 'website',
    locale: 'en_NG',
    url: 'https://Fithub.com',
    siteName: 'Fithub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fithub - Premium Nigerian Sportswear',
    description: 'Engineered for movement, designed for style. Discover Fithub.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-serif antialiased")}>
        {children}
      </body>
    </html>
  );
}
