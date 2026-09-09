"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("id");

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm md:p-12">

          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <span className="text-5xl">✓</span>
          </div>

          {/* TITLE */}
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Thank You!
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-gray-600">
            Your order has been successfully placed. We have received your
            order and will start preparing it shortly.
          </p>

          {/* ORDER NUMBER */}
          {orderId && (
            <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-orange-50 p-5">
              <p className="text-sm font-semibold text-gray-500">
                Your Order Number
              </p>

              <p className="mt-2 text-3xl font-extrabold text-orange-600">
                #{orderId}
              </p>
            </div>
          )}

          {/* STATUS */}
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="font-bold text-green-700">
              🟢 Order Status: Pending
            </p>

            <p className="mt-2 text-sm text-green-700">
              Your order has been received. Please wait while our team
              confirms your order.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/menu"
              className="rounded-full bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Order More
            </Link>

            <Link
              href="/"
              className="rounded-full border border-gray-200 bg-white px-7 py-3 font-bold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              Back to Home
            </Link>
          </div>

          {/* NOTE */}
          <p className="mt-8 text-xs text-gray-400">
            Please keep your order number for reference.
          </p>

        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-orange-50">
          <p className="text-sm font-semibold text-gray-500">
            Loading order details...
          </p>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}