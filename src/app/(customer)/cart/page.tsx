"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // ================================
  // EMPTY CART
  // ================================

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-7xl">🛒</div>

          <h1 className="mt-6 text-4xl font-extrabold text-white">
            Your Cart is Empty
          </h1>

          <p className="mt-4 text-[#BDBDBD]">
            Looks like you haven't added anything yet.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-block rounded-full bg-[#FF6F00] px-7 py-3 font-bold text-white transition hover:bg-[#FFD600] hover:text-black"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  // ================================
  // CART PAGE
  // ================================

  return (
    <main className="min-h-screen bg-black px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
            Fresh Picks
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your Cart
          </h1>

          <p className="mt-3 text-[#BDBDBD]">
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* CONTENT */}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ================================
              CART ITEMS
          ================================= */}

          <div className="space-y-4">

            {cart.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[#242424] bg-[#111111] p-4 transition hover:border-[#FF6F00]/50 sm:p-5"
              >
                <div className="flex gap-4">

                  {/* PRODUCT IMAGE */}

                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#1a1a1a] sm:h-28 sm:w-28">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        🍹
                      </div>
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="flex min-w-0 flex-1 flex-col justify-between">

                    <div>
                      <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                        {item.name}
                      </h2>

                      <p className="mt-1 font-semibold text-[#FFD600]">
                        Rs. {item.price}
                      </p>
                    </div>

                    {/* QUANTITY */}

                    <div className="mt-4 flex items-center justify-between gap-3">

                      <div className="flex items-center overflow-hidden rounded-full border border-[#333333] bg-black">

                        {/* DECREASE */}

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          className="flex h-9 w-9 items-center justify-center text-lg font-bold text-white transition hover:bg-[#FF6F00]"
                        >
                          −
                        </button>

                        {/* QUANTITY */}

                        <span className="min-w-10 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>

                        {/* INCREASE */}

                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image_url: item.image_url,
                            })
                          }
                          className="flex h-9 w-9 items-center justify-center text-lg font-bold text-white transition hover:bg-[#FF6F00]"
                        >
                          +
                        </button>

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="text-sm font-semibold text-[#BDBDBD] transition hover:text-red-500"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                </div>

                {/* ITEM TOTAL */}

                <div className="mt-4 flex items-center justify-between border-t border-[#242424] pt-4">

                  <span className="text-sm text-[#BDBDBD]">
                    {item.quantity} × Rs. {item.price}
                  </span>

                  <span className="font-bold text-white">
                    Rs.{" "}
                    {(item.price * item.quantity).toLocaleString()}
                  </span>

                </div>
              </div>
            ))}

            {/* CONTINUE SHOPPING */}

            <Link
              href="/menu"
              className="inline-flex items-center pt-2 text-sm font-bold text-[#BDBDBD] transition hover:text-[#FF6F00]"
            >
              ← Continue Shopping
            </Link>

          </div>

          {/* ================================
              ORDER SUMMARY
          ================================= */}

          <div className="h-fit lg:sticky lg:top-24">

            <div className="rounded-3xl border border-[#242424] bg-[#111111] p-6 shadow-[0_0_30px_rgba(255,111,0,0.08)]">

              {/* SUMMARY HEADER */}

              <div className="mb-6 flex items-center justify-between">

                <h2 className="text-xl font-extrabold text-white">
                  Order Summary
                </h2>

                <span className="rounded-full bg-[#FF6F00]/10 px-3 py-1 text-xs font-bold text-[#FF6F00]">
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"}
                </span>

              </div>

              {/* SUBTOTAL */}

              <div className="space-y-4 border-b border-[#242424] pb-5">

                <div className="flex items-center justify-between">

                  <span className="text-[#BDBDBD]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-white">
                    Rs.{" "}
                    {cartTotal.toLocaleString()}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-[#BDBDBD]">
                    Service
                  </span>

                  <span className="font-semibold text-[#00FF7F]">
                    Free
                  </span>

                </div>

              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between py-5">

                <span className="text-lg font-bold text-white">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-[#FFD600]">
                  Rs.{" "}
                  {cartTotal.toLocaleString()}
                </span>

              </div>

              {/* CHECKOUT */}

              <Link
                href="/checkout"
                className="block w-full rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-4 text-center font-extrabold text-black shadow-[0_0_20px_rgba(255,111,0,0.2)] transition hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,111,0,0.3)]"
              >
                Continue to Checkout →
              </Link>

              {/* INFORMATION */}

              <div className="mt-5 rounded-2xl border border-[#242424] bg-black p-4">

                <p className="text-sm font-semibold text-white">
                  🍹 Dine-in Ordering
                </p>

                <p className="mt-1 text-xs leading-5 text-[#BDBDBD]">
                  Select your table and provide
                  your details on the checkout
                  page.
                </p>

              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}