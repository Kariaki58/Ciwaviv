
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ciwaviv.com'),
  title: {
    default: 'Ciwaviv - Energize Your Movement | High-Performance Sportswear from Nigeria',
    template: '%s | Ciwaviv Nigeria',
  },
  description: 'Discover high-performance sportswear and activewear from Ciwaviv, a Nigerian brand dedicated to quality and style. Shop the latest collections for men and women and energize your movement.',
  openGraph: {
    title: 'Ciwaviv - Energize Your Movement | High-Performance Sportswear from Nigeria',
    description: 'High-performance sportswear and activewear to energize your movement. Proudly Nigerian.',
    type: 'website',
    locale: 'en_NG',
    url: 'https://ciwaviv.com',
    siteName: 'Ciwaviv',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciwaviv - Premium Nigerian Sportswear',
    description: 'Engineered for movement, designed for style. Discover Ciwaviv.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased",
        fontBody.variable,
        fontHeadline.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
