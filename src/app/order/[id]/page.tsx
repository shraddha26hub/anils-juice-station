"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  order_type: string;
  status: string;
  total_amount: number;
  table_id: number | null;
  created_at: string;
};

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
};

const statusSteps = ["pending", "preparing", "ready", "served"];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        phone,
        order_type,
        status,
        total_amount,
        table_id,
        created_at
      `)
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error(orderError);
      setError("Could not find your order.");
      setLoading(false);
      return;
    }

    setOrder(orderData);

    const { data: itemData, error: itemError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        quantity,
        price
      `)
      .eq("order_id", orderId);

    if (itemError) {
      console.error(itemError);
      setItems([]);
    } else if (itemData && itemData.length > 0) {
      const productIds = itemData.map((item) => item.product_id);

      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      if (productError) {
        console.error(productError);
      }

      const combinedItems = itemData.map((item) => {
        const product = products?.find(
          (product) => product.id === item.product_id
        );

        return {
          ...item,
          product_name: product?.name || "Product",
        };
      });

      setItems(combinedItems);
    }

    setLoading(false);
  };

  useEffect(() => {
  if (!orderId || Number.isNaN(orderId)) {
    return;
  }

  let channel: ReturnType<typeof supabase.channel> | null = null;
  let mounted = true;

  async function setupRealtime() {
    // Load the order initially
    await fetchOrder();

    if (!mounted) {
      return;
    }

    // Listen for changes to this specific order
    channel = supabase
      .channel(`customer-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log(
            "CUSTOMER ORDER REALTIME UPDATE:",
            payload
          );

          if (payload.new) {
            setOrder(payload.new as Order);
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "CUSTOMER ORDER REALTIME STATUS:",
          status
        );
      });
  }

  setupRealtime();

  return () => {
    mounted = false;

    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🥤</div>
          <p className="text-gray-400">Loading your order...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>

          <h1 className="text-2xl font-bold mb-2">
            Order Not Found
          </h1>

          <p className="text-gray-400 mb-6">
            We couldn't find this order.
          </p>

          <Link
            href="/menu"
            className="inline-block bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold"
          >
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = order.status?.toLowerCase();

  const currentStep = statusSteps.indexOf(currentStatus);

  const isCancelled = currentStatus === "cancelled";

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🥤</div>

          <h1 className="text-3xl md:text-4xl font-bold">
            Your Order
          </h1>

          <p className="text-gray-400 mt-2">
            Order #{order.id}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-[#111111] border border-[#242424] rounded-3xl p-6 md:p-8 mb-6">

          {isCancelled ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">❌</div>

              <h2 className="text-2xl font-bold text-red-400">
                Order Cancelled
              </h2>

              <p className="text-gray-400 mt-2">
                Unfortunately, this order has been cancelled.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-400 text-sm mb-2">
                  Current Status
                </p>

                <h2 className="text-3xl font-bold text-orange-400 capitalize">
                  {currentStatus}
                </h2>
              </div>

              {/* Progress */}
              <div className="relative">

                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-700" />

                <div
                  className="absolute top-5 left-0 h-1 bg-orange-500 transition-all duration-500"
                  style={{
                    width:
                      currentStep <= 0
                        ? "0%"
                        : `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                  }}
                />

                <div className="relative flex justify-between">

                  {statusSteps.map((status, index) => {
                    const completed = index <= currentStep;

                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-black z-10 transition-all ${
                            completed
                              ? "bg-orange-500 text-white"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {completed ? "✓" : index + 1}
                        </div>

                        <p
                          className={`mt-3 text-xs sm:text-sm capitalize ${
                            completed
                              ? "text-white font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Live update message */}
              <div className="mt-10 text-center">
                <p className="text-xs text-gray-500">
                  🔄 Order status updates automatically
                </p>
              </div>
            </>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-[#111111] border border-[#242424] rounded-3xl p-6 mb-6">

          <h2 className="text-xl font-bold mb-5">
            Order Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-500 text-sm">
                Customer
              </p>

              <p className="font-semibold mt-1">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Phone
              </p>

              <p className="font-semibold mt-1">
                {order.phone}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Order Type
              </p>

              <p className="font-semibold mt-1 capitalize">
                {order.order_type?.replace("_", " ")}
              </p>
            </div>

            {order.table_id && (
              <div>
                <p className="text-gray-500 text-sm">
                  Table
                </p>

                <p className="font-semibold mt-1">
                  Table {order.table_id}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Ordered Items */}
        <div className="bg-[#111111] border border-[#242424] rounded-3xl p-6 mb-6">

          <h2 className="text-xl font-bold mb-5">
            Your Items
          </h2>

          <div className="space-y-4">

            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-[#242424] pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold">
                    {item.product_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.quantity} × Rs.{" "}
                    {Number(item.price).toFixed(2)}
                  </p>
                </div>

                <p className="font-semibold">
                  Rs.{" "}
                  {(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

          </div>

          {/* Total */}
          <div className="border-t border-[#242424] mt-6 pt-5 flex justify-between">
            <span className="text-lg font-bold">
              Total
            </span>

            <span className="text-xl font-bold text-orange-400">
              Rs. {Number(order.total_amount).toFixed(2)}
            </span>
          </div>

        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">

          <Link
            href="/menu"
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-semibold transition"
          >
            Order More
          </Link>

          <Link
            href="/"
            className="flex-1 text-center border border-[#333] hover:bg-[#111] py-3 rounded-xl font-semibold transition"
          >
            Back Home
          </Link>

        </div>

      </div>
    </main>
  );
}