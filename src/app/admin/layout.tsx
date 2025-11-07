'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Truck, ShoppingCart,
  UsersRound, LogOut, Search
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { UserNav } from "@/components/user-nav";
import type { ReactNode } from "react";
import Image from "next/image";

const navItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'Drivers', href: '/admin/drivers', icon: Truck },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Staff', href: '/admin/staff', icon: UsersRound },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('coconut_auth');
    document.cookie = 'auth-token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col fixed left-0 top-0 h-full shadow-sm">
        {/* Logo Section */}
        <div className="flex items-center gap-4 mb-6 mt-4 p-5">
          {/* Image */}
          <div className="flex items-center justify-center rounded-full ring-4 ring-sky-100 overflow-hidden bg-white">
            <Image
              src="/assests/logos/coconut.png"
              alt="Brand"
              width={70}
              height={70}
              className="object-contain p-2"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="text-sky-500 font-semibold leading-tight">Coconut Admin</p>
            <p className="text-[12px] text-slate-500 leading-none">
              Multi-Location System
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.title} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-md cursor-pointer transition-colors ${isActive
                      ? 'bg-sky-400 text-white'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-sky-400'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        {/* <header className="flex h-14 items-center justify-between gap-4 border-b bg-white px-6">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-50 pl-8 border border-gray-200 shadow-none rounded-md max-w-sm"
              />
            </div>
          </form>
          <UserNav />
        </header> */}

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
