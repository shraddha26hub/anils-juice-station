"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Table2,
  BarChart3,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Tables",
    href: "/admin/tables",
    icon: Table2,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-orange-100 bg-white lg:block">
      <div className="flex h-full flex-col">

        {/* LOGO */}

        <div className="border-b border-gray-100 px-6 py-6">
          <Link
            href="/admin"
            className="text-xl font-extrabold text-orange-600"
          >
            Anil&apos;s Juice Station
          </Link>

          <p className="mt-1 text-xs font-semibold text-gray-400">
            Admin Panel
          </p>
        </div>

        {/* MENU */}

        <nav className="flex-1 space-y-2 px-4 py-6">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={20} />

                {item.name}
              </Link>
            );
          })}

        </nav>

        {/* LOGOUT */}

        <div className="border-t border-gray-100 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={20} />

            Logout
          </button>

        </div>

      </div>
    </aside>
  );
}