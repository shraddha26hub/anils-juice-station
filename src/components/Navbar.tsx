"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CustomerOrder = {
  id: number;
  status: string;
};

const statusStyles: Record<
  string,
  {
    dot: string;
    text: string;
    bg: string;
  }
> = {
  pending: {
    dot: "bg-yellow-400",
    text: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  preparing: {
    dot: "bg-orange-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  ready: {
    dot: "bg-green-400",
    text: "text-green-400",
    bg: "bg-green-400/10",
  },
  served: {
    dot: "bg-gray-400",
    text: "text-gray-300",
    bg: "bg-gray-400/10",
  },
  cancelled: {
    dot: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10",
  },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  /*
   * Load customer order IDs from localStorage
   */
  const loadOrders = async () => {
    if (typeof window === "undefined") return;

    try {
      const storedOrders = JSON.parse(
        localStorage.getItem("anils-orders") || "[]"
      );

      if (!Array.isArray(storedOrders) || storedOrders.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = storedOrders
        .map(Number)
        .filter(
          (id) => Number.isInteger(id) && id > 0
        );

      if (orderIds.length === 0) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, status")
        .in("id", orderIds)
        .order("id", {
          ascending: false,
        });

      if (error) {
        console.error(
          "NAVBAR ORDER ERROR:",
          error
        );
        return;
      }

      setOrders(data ?? []);
    } catch (error) {
      console.error(
        "LOAD CUSTOMER ORDERS ERROR:",
        error
      );
    }
  };

  /*
   * Load orders when navbar starts
   * and keep status updated
   */
  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Format status for display
   */
  function formatStatus(status: string) {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  return (
    <>
      {/* NAVBAR */}

      <nav className="relative z-50 w-full border-b border-[#1f1f1f] bg-black">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-4 sm:h-24 sm:px-6">

          {/* BRAND */}

          <Link
            href="/"
            className="text-lg font-bold italic tracking-tight text-white transition hover:text-[#FF6F00] sm:text-2xl md:text-3xl"
            style={{
              fontFamily: "cursive",
            }}
          >
            Anil&apos;s Juice Station
          </Link>

          {/* RIGHT SIDE */}

          <div className="absolute right-4 flex items-center gap-2 sm:right-6 sm:gap-4">

            {/* ORDER NOW */}

            <Link
              href="/checkout"
              className="rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-4 py-2 text-xs font-bold text-black shadow-[0_0_18px_rgba(255,111,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,111,0,0.4)] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Order Now
            </Link>

            {/* HAMBURGER */}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-[#333] bg-[#111] transition hover:border-[#FF6F00] hover:shadow-[0_0_15px_rgba(255,111,0,0.25)] sm:h-11 sm:w-11"
            >
              <span className="h-0.5 w-5 bg-white" />
              <span className="h-0.5 w-5 bg-white" />
              <span className="h-0.5 w-5 bg-white" />
            </button>

          </div>

        </div>

      </nav>

      {/* BACKDROP */}

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-[3px]"
        />
      )}

      {/* SIDE MENU */}

      <div
        className={`fixed right-0 top-0 z-[999] h-full w-[300px] border-l border-[#252525] bg-[#090909] shadow-2xl transition-transform duration-500 ease-in-out sm:w-[340px] ${
          menuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        {/* MENU HEADER */}

        <div className="flex h-20 items-center justify-between border-b border-[#252525] px-6 sm:h-24 sm:px-7">

          <span
            className="text-2xl font-bold italic text-white"
            style={{
              fontFamily: "cursive",
            }}
          >
            Menu
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#333] bg-[#111] text-2xl text-white transition hover:border-[#FF6F00] hover:text-[#FF6F00]"
          >
            ×
          </button>

        </div>

        {/* MENU CONTENT */}

        <div className="flex h-[calc(100%-5rem)] flex-col overflow-y-auto px-6 py-7 sm:h-[calc(100%-6rem)]">

          {/* MENU LINKS */}

          <div className="flex flex-col">

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#222] py-4 text-lg font-semibold text-white transition hover:pl-2 hover:text-[#FF6F00]"
            >
              Home
            </Link>

            <Link
              href="/menu"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#222] py-4 text-lg font-semibold text-white transition hover:pl-2 hover:text-[#FF6F00]"
            >
              Menu
            </Link>

            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#222] py-4 text-lg font-semibold text-white transition hover:pl-2 hover:text-[#FF6F00]"
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#222] py-4 text-lg font-semibold text-white transition hover:pl-2 hover:text-[#FF6F00]"
            >
              Contact
            </Link>

          </div>

          {/* MY ORDERS */}

          {orders.length > 0 && (
            <div className="mt-7">

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  My Orders
                </h2>

                <span className="rounded-full bg-[#222] px-2.5 py-1 text-[10px] font-bold text-gray-400">
                  {orders.length}
                </span>

              </div>

              <div className="space-y-2">

                {orders.map((order) => {

                  const currentStatus =
                    order.status?.toLowerCase() ||
                    "pending";

                  const style =
                    statusStyles[currentStatus] ??
                    statusStyles.pending;

                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className={`block rounded-xl border border-[#252525] p-3 transition hover:border-[#FF6F00] ${style.bg}`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        {/* ORDER NUMBER */}

                        <div className="flex items-center gap-2">

                          <span
                            className={`h-2.5 w-2.5 rounded-full ${style.dot} ${
                              currentStatus ===
                              "preparing"
                                ? "animate-pulse"
                                : ""
                            }`}
                          />

                          <span className="font-bold text-white">
                            Order #{order.id}
                          </span>

                        </div>

                        {/* STATUS */}

                        <span
                          className={`text-xs font-bold ${style.text}`}
                        >
                          {formatStatus(
                            currentStatus
                          )}
                        </span>

                      </div>

                      <p className="mt-2 text-[11px] text-gray-500">
                        Tap to view order
                      </p>

                    </Link>
                  );
                })}

              </div>

            </div>
          )}

          {/* NO ORDERS */}

          {orders.length === 0 && (
            <div className="mt-7 rounded-2xl border border-dashed border-[#292929] bg-[#0d0d0d] p-5 text-center">

              <div className="text-3xl">
                🥤
              </div>

              <p className="mt-2 text-sm font-semibold text-gray-400">
                No active orders
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Your orders will appear here.
              </p>

            </div>
          )}

          {/* ORDER BUTTON */}

          <Link
            href="/checkout"
            onClick={() => setMenuOpen(false)}
            className="mt-7 rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-3 text-center font-bold text-black shadow-[0_0_20px_rgba(255,111,0,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,111,0,0.4)]"
          >
            Order Now →
          </Link>

          {/* DECORATIVE ACCENT */}

          <div className="mt-auto pt-10">

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#00FF7F]">

              <span className="h-2 w-2 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />

              Fresh Every Day

            </div>

          </div>

        </div>

      </div>
    </>
  );
}