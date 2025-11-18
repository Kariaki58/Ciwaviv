"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  CloudUpload,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  FoldersIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  Package,
  PackageSearch,
  SearchIcon,
  Settings2,
  SettingsIcon,
  Users,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Ciwaviv Admin",
    email: "admin@ciwaviv.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admindashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Category",
      url: "/admindashboard/category",
      icon: FoldersIcon,
    },
    {
      title: "Customer",
      url: "/admindashboard/customers",
      icon: Users,
    },
    {
      title: "Upload",
      url: "/admindashboard/product-upload",
      icon: CloudUpload,
    },
    {
      title: "Products",
      url: "/admindashboard/products",
      icon: PackageSearch,
    },
    {
      title: "Orders",
      url: "/admindashboard/orders",
      icon: Package,
    },
    {
      title: "Settings",
      url: "/admindashboard/settings",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Ciwaviv.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
