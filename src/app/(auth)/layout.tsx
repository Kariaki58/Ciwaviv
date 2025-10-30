import { Inter, Poppins } from 'next/font/google';
import '../globals.css'
import { cn } from '@/lib/utils';


const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});


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
        {children}
      </body>
    </html>
  );
}
