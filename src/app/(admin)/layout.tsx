import { Inter, Poppins } from 'next/font/google';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import '../globals.css'
import SessionContext from '@/components/ReactSessioncontext';


export default function DashboardLayout({ children }: { children: React.ReactNode  }) {
    return (
        <div>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                </div>
              </header>
              <SessionContext>
                {children}
              </SessionContext>
            </SidebarInset>
          </SidebarProvider>
        </div>
    )
}