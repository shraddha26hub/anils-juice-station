"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "🏠",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: "📦",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: "🍹",
  },
  {
    name: "Tables",
    href: "/admin/tables",
    icon: "🪑",
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: "📊",
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("LOGOUT ERROR:", error);
      setLoggingOut(false);
      return;
    }

    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}

          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-sm">
              🍹
            </div>

            <div className="hidden sm:block">
              <p className="text-lg font-extrabold leading-tight text-gray-900">
                Anil&apos;s Juice Station
              </p>

              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Admin Panel
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-600 lg:hidden"
            aria-label="Toggle admin menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* MOBILE NAVIGATION */}

        {menuOpen && (
          <div className="border-t border-orange-100 py-4 lg:hidden">

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition ${
                      active
                        ? "bg-orange-500 text-white"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <span className="text-xl">
                      {item.icon}
                    </span>

                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-left font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "🚪 Logout"}
            </button>

          </div>
        )}
      </div>
    </header>
  );
}