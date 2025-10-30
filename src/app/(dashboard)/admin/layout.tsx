import { Inter, Poppins } from 'next/font/google';
import '../../globals.css'

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
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode  }) {
    return (
        <html lang="en" suppressHydrationWarning>
              <body className={cn(
                "font-body antialiased bg-gray-800",
                fontBody.variable,
                fontHeadline.variable
            )}>
                <div className="flex min-h-screen">
                  <Sidebar />
                  
                  {/* Main content area with proper margin */}
                  <main className="flex-1 lg:ml-64 ml-20 transition-all duration-300">
                    <div className="p-6">
                      {children}
                    </div>
                  </main>
                </div>
            </body>
        </html>
    )
}