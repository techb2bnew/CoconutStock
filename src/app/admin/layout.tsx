'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // add useRouter
import { Bell, Building, FileText, LayoutDashboard, Search, ShoppingCart, Tags, Truck, Users, UsersRound, LogOut } from "lucide-react";


import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { supabase } from "@/lib/supabaseClient"; 
import type { ReactNode } from "react";

const navItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Customers', href: '/admin/customers', icon: Users },
   { title: 'Drivers', href: '/admin/drivers', icon: Users },
   { title: 'Orders', href: '/admin/orders', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // router for redirect

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('coconut_auth'); 
    document.cookie = 'auth-token=; path=/; max-age=0'; 
    router.push('/login'); 
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary">
              <rect width="256" height="256" fill="none" />
              <path d="M44.4,188.4A64.1,64.1,0,0,1,32,128,64,64,0,0,1,120.7,81.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M211.6,67.6A64.1,64.1,0,0,1,224,128,64,64,0,0,1,135.3,174.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <line x1="128" y1="32" x2="128" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            </svg>
            <h1 className="text-xl font-semibold">Seda Admin</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href} className="block">
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>

          {/* UserNav + Logout Button */}
          <div className="flex items-center gap-4">
            <UserNav />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
