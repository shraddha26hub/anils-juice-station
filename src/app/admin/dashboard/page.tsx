"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminProfile = {
  id: number;
  user_id: string;
  branch_id: number | null;
  role: "admin" | "super_admin";
};

type Branch = {
  id: number;
  name: string;
};

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  status: string;
  total_amount: number;
  order_type: "delivery" | "pickup" | "dine_in";
  address: string | null;
  notes: string | null;
  branch_id: number;
  table_id: number | null;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD ADMIN + ORDERS
  // ==========================================

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        // --------------------------------------
        // CHECK AUTHENTICATION
        // --------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          router.push("/admin/login");
          return;
        }

        // --------------------------------------
        // GET ADMIN PROFILE
        // --------------------------------------

        const {
          data: adminData,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("id, user_id, branch_id, role")
          .eq("user_id", user.id)
          .single();

        if (adminError) {
          console.error("ADMIN PROFILE ERROR:", adminError);
          throw new Error(
            "You are not registered as an admin."
          );
        }

        setAdmin(adminData);

        // --------------------------------------
        // GET BRANCH
        // --------------------------------------

        if (
          adminData.branch_id !== null &&
          adminData.role !== "super_admin"
        ) {
          const {
            data: branchData,
            error: branchError,
          } = await supabase
            .from("branches")
            .select("id, name")
            .eq("id", adminData.branch_id)
            .single();

          if (branchError) {
            console.error(
              "BRANCH ERROR:",
              branchError
            );
          } else {
            setBranch(branchData);
          }
        }

        // --------------------------------------
        // GET ORDERS
        // --------------------------------------

        const {
          data: orderData,
          error: orderError,
        } = await supabase
          .from("orders")
          .select(`
            id,
            customer_name,
            phone,
            status,
            total_amount,
            order_type,
            address,
            notes,
            branch_id,
            table_id,
            created_at
          `)
          .order("created_at", {
            ascending: false,
          });

        if (orderError) {
          console.error(
            "ORDERS ERROR:",
            orderError
          );

          throw new Error(
            orderError.message ||
              "Failed to load orders."
          );
        }

        setOrders(orderData || []);
      } catch (error) {
        console.error(
          "DASHBOARD ERROR:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Something went wrong."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/admin/login");
  }

  // ==========================================
  // ORDER COUNTS
  // ==========================================

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  ).length;

  const readyOrders = orders.filter(
    (order) => order.status === "ready"
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="text-5xl">
            🍹
          </div>

          <p className="mt-4 font-semibold text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            Dashboard Error
          </h1>

          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/login")
            }
            className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Go to Admin Login
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen bg-orange-50">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Anil&apos;s Juice Station
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-gray-900">
                {branch?.name ||
                  (admin?.role === "super_admin"
                    ? "All Branches"
                    : "Branch")}
              </p>

              <p className="text-xs text-gray-500">
                {admin?.role === "super_admin"
                  ? "Super Admin"
                  : "Branch Admin"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* BRANCH TITLE */}

        <div>
          <p className="text-sm font-semibold text-gray-500">
            Welcome back
          </p>

          <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
            {branch?.name ||
              (admin?.role === "super_admin"
                ? "All Branches"
                : "Your Branch")}
          </h2>
        </div>

        {/* ====================================
            STAT CARDS
        ==================================== */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* PENDING */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-4xl font-extrabold text-orange-500">
              {pendingOrders}
            </p>
          </div>

          {/* CONFIRMED */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Confirmed
            </p>

            <p className="mt-2 text-4xl font-extrabold text-blue-500">
              {confirmedOrders}
            </p>
          </div>

          {/* PREPARING */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Preparing
            </p>

            <p className="mt-2 text-4xl font-extrabold text-purple-500">
              {preparingOrders}
            </p>
          </div>

          {/* READY */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-gray-500">
              Ready
            </p>

            <p className="mt-2 text-4xl font-extrabold text-green-500">
              {readyOrders}
            </p>
          </div>

        </div>

        {/* ====================================
            ORDERS
        ==================================== */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders from your branch
              </p>
            </div>

            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              {orders.length} orders
            </span>

          </div>

          {orders.length === 0 ? (

            <div className="mt-6 rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="text-6xl">
                📦
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-gray-900">
                No orders yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                New orders will appear here.
              </p>
            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* ORDER INFO */}

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-extrabold text-gray-900">
                          Order #{order.id}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            order.status ===
                            "pending"
                              ? "bg-orange-100 text-orange-700"
                              : order.status ===
                                "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : order.status ===
                                "preparing"
                              ? "bg-purple-100 text-purple-700"
                              : order.status ===
                                "ready"
                              ? "bg-green-100 text-green-700"
                              : order.status ===
                                "completed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status}
                        </span>

                      </div>

                      <p className="mt-2 font-bold text-gray-800">
                        {order.customer_name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.phone}
                      </p>

                    </div>

                    {/* ORDER DETAILS */}

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">

                      <div>
                        <p className="text-gray-400">
                          Type
                        </p>

                        <p className="font-bold text-gray-800">
                          {order.order_type ===
                          "dine_in"
                            ? "Dine-in"
                            : order.order_type ===
                              "pickup"
                            ? "Pickup"
                            : "Delivery"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">
                          Amount
                        </p>

                        <p className="font-bold text-orange-600">
                          Rs.{" "}
                          {order.total_amount}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">
                          Date
                        </p>

                        <p className="font-bold text-gray-800">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">
                          Time
                        </p>

                        <p className="font-bold text-gray-800">
                          {new Date(
                            order.created_at
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}