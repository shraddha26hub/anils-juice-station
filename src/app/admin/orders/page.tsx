"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ClipboardList,
  Clock3,
  ChefHat,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Utensils,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  customer_name: string;
  phone: string | null;
  order_type: "dine_in" | "pickup" | "delivery";
  status: string;
  total_amount: number;
  table_id: number | null;
  branch_id: number;
  created_at: string;
};

type Admin = {
  branch_id: number;
};

type Period = "today" | "weekly" | "monthly" | "yearly";

const statuses = [
  "all",
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

const periods: {
  value: Period;
  label: string;
}[] = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "weekly",
    label: "This Week",
  },
  {
    value: "monthly",
    label: "This Month",
  },
  {
    value: "yearly",
    label: "This Year",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [branchName, setBranchName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const [period, setPeriod] = useState<Period>("today");

  // --------------------------------------------------
  // GET START DATE
  // --------------------------------------------------

  function getStartDate(selectedPeriod: Period) {
    const now = new Date();

    const start = new Date(now);

    if (selectedPeriod === "today") {
      start.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "weekly") {
      const day = start.getDay();

      const daysFromMonday =
        day === 0 ? 6 : day - 1;

      start.setDate(
        start.getDate() - daysFromMonday
      );

      start.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "monthly") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "yearly") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }

    return start;
  }

  // --------------------------------------------------
  // PERIOD LABEL
  // --------------------------------------------------

  function getPeriodLabel() {
    switch (period) {
      case "today":
        return "Today";

      case "weekly":
        return "This Week";

      case "monthly":
        return "This Month";

      case "yearly":
        return "This Year";

      default:
        return "Today";
    }
  }

  // --------------------------------------------------
  // LOAD ORDERS
  // --------------------------------------------------

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      // --------------------------------------------
      // GET LOGGED-IN USER
      // --------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You are not logged in.");
      }

      // --------------------------------------------
      // GET ADMIN BRANCH
      // --------------------------------------------

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("branch_id")
        .eq("user_id", user.id)
        .single();

      if (adminError || !admin) {
        throw new Error(
          "You are not registered as an admin."
        );
      }

      const typedAdmin = admin as Admin;

      // --------------------------------------------
      // GET BRANCH NAME
      // --------------------------------------------

      const {
        data: branch,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("name")
        .eq("id", typedAdmin.branch_id)
        .single();

      if (branchError || !branch) {
        throw new Error(
          "Unable to load your branch."
        );
      }

      setBranchName(branch.name);

      // --------------------------------------------
      // GET DATE RANGE
      // --------------------------------------------

      const startDate = getStartDate(period);
      const endDate = new Date();

      // --------------------------------------------
      // GET ORDERS
      // --------------------------------------------

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from("orders")
        .select(
          `
            id,
            customer_name,
            phone,
            order_type,
            status,
            total_amount,
            table_id,
            branch_id,
            created_at
          `
        )
        .eq(
          "branch_id",
          typedAdmin.branch_id
        )
        .gte(
          "created_at",
          startDate.toISOString()
        )
        .lte(
          "created_at",
          endDate.toISOString()
        )
        .order("created_at", {
          ascending: false,
        });

      if (orderError) {
        throw new Error(orderError.message);
      }

      setOrders(
        (orderData ?? []) as Order[]
      );
    } catch (error) {
      console.error(
        "ORDERS LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // INITIAL LOAD + REALTIME
  // --------------------------------------------------

  useEffect(() => {
    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let mounted = true;

    async function setupRealtime() {
      try {
        // --------------------------------------------
        // 1. GET CURRENT USER
        // --------------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "REALTIME USER ERROR:",
            userError
          );

          return;
        }

        if (!user || !mounted) {
          return;
        }

        // --------------------------------------------
        // 2. GET ADMIN BRANCH
        // --------------------------------------------

        const {
          data: admin,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select("branch_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminError) {
          console.error(
            "REALTIME ADMIN QUERY ERROR:",
            adminError
          );

          return;
        }

        if (!admin) {
          console.error(
            "REALTIME ADMIN ERROR: No admin record found for current user."
          );

          return;
        }

        if (!mounted) {
          return;
        }

        // --------------------------------------------
        // 3. GET BRANCH ID
        // --------------------------------------------

        const branchId = Number(
          admin.branch_id
        );

        if (!branchId) {
          console.error(
            "REALTIME ADMIN ERROR: Invalid branch ID.",
            admin
          );

          return;
        }

        console.log(
          "REALTIME BRANCH ID:",
          branchId
        );

        // --------------------------------------------
        // 4. LOAD EXISTING ORDERS
        // --------------------------------------------

        await loadOrders();

        if (!mounted) {
          return;
        }

        // --------------------------------------------
        // 5. CREATE REALTIME CHANNEL
        // --------------------------------------------

        channel = supabase.channel(
          `admin-orders-${branchId}`
        );

        // --------------------------------------------
        // 6. ADD REALTIME LISTENER
        // --------------------------------------------

        channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `branch_id=eq.${branchId}`,
          },
          (payload) => {
            console.log(
              "REALTIME ORDER UPDATE:",
              payload.eventType,
              payload
            );

            if (!mounted) {
              return;
            }

            // Reload orders after:
            // INSERT
            // UPDATE
            // DELETE

            loadOrders();
          }
        );

        // --------------------------------------------
        // 7. SUBSCRIBE
        // --------------------------------------------

        channel.subscribe((status) => {
          console.log(
            "ORDERS REALTIME STATUS:",
            status
          );

          if (status === "SUBSCRIBED") {
            console.log(
              "✅ ORDERS REALTIME CONNECTED"
            );
          }

          if (status === "CHANNEL_ERROR") {
            console.error(
              "❌ ORDERS REALTIME CHANNEL ERROR"
            );
          }

          if (status === "TIMED_OUT") {
            console.error(
              "❌ ORDERS REALTIME TIMED OUT"
            );
          }

          if (status === "CLOSED") {
            console.log(
              "ℹ️ ORDERS REALTIME CHANNEL CLOSED"
            );
          }
        });
      } catch (error) {
        console.error(
          "REALTIME SETUP ERROR:",
          error
        );
      }
    }

    setupRealtime();

    // ----------------------------------------------
    // CLEANUP
    // ----------------------------------------------

    return () => {
      mounted = false;

      if (channel) {
        console.log(
          "Removing orders realtime channel..."
        );

        supabase.removeChannel(channel);

        channel = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // RELOAD WHEN PERIOD CHANGES
  // --------------------------------------------------

  useEffect(() => {
    loadOrders();
  }, [period]);

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  function statusStyle(status: string) {
    switch (status) {
      case "pending":
        return {
          badge:
            "border-[#FFD600]/20 bg-[#FFD600]/10 text-[#FFD600]",
          icon: <Clock3 size={14} />,
        };

      case "preparing":
        return {
          badge:
            "border-blue-500/20 bg-blue-500/10 text-blue-400",
          icon: <ChefHat size={14} />,
        };

      case "ready":
        return {
          badge:
            "border-purple-500/20 bg-purple-500/10 text-purple-400",
          icon: (
            <CheckCircle2 size={14} />
          ),
        };

      case "served":
        return {
          badge:
            "border-[#00FF7F]/20 bg-[#00FF7F]/10 text-[#00FF7F]",
          icon: (
            <CheckCircle2 size={14} />
          ),
        };

      case "cancelled":
        return {
          badge:
            "border-red-500/20 bg-red-500/10 text-red-400",
          icon: <XCircle size={14} />,
        };

      default:
        return {
          badge:
            "border-[#242424] bg-[#111] text-[#BDBDBD]",
          icon: <Clock3 size={14} />,
        };
    }
  }

  // --------------------------------------------------
  // FILTER BY STATUS
  // --------------------------------------------------

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status === filterStatus
        );

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const pendingCount =
    orders.filter(
      (order) =>
        order.status === "pending"
    ).length;

  const preparingCount =
    orders.filter(
      (order) =>
        order.status === "preparing"
    ).length;

  const readyCount =
    orders.filter(
      (order) =>
        order.status === "ready"
    ).length;

  const servedCount =
    orders.filter(
      (order) =>
        order.status === "served"
    ).length;

  const cancelledCount =
    orders.filter(
      (order) =>
        order.status === "cancelled"
    ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-5 border-b border-[#242424] pb-7 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
                Admin Panel
              </p>

            </div>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Orders
            </h1>

            {branchName && (
              <div className="mt-2 flex items-center gap-2 text-sm text-[#888]">

                <MapPin
                  size={15}
                  className="text-[#FF6F00]"
                />

                {branchName}

              </div>
            )}

          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-5 py-3 text-sm font-extrabold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,111,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh Orders"}

          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* PERIOD FILTER */}

        <div className="mt-7 rounded-2xl border border-[#242424] bg-[#111] p-4">

          <div className="mb-3">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#666]">
              Order Period
            </p>

            <p className="mt-1 text-sm text-[#888]">
              Showing orders for{" "}
              <span className="font-bold text-[#FF6F00]">
                {getPeriodLabel()}
              </span>
            </p>

          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">

            {periods.map((item) => {

              const active =
                period === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() =>
                    setPeriod(item.value)
                  }
                  className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                    active
                      ? "bg-gradient-to-r from-[#FF6F00] to-[#FFD600] text-black shadow-[0_0_20px_rgba(255,111,0,0.15)]"
                      : "border border-[#2a2a2a] bg-[#080808] text-[#888] hover:border-[#FF6F00] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

          {/* TOTAL */}

          <div className="rounded-2xl border border-[#242424] bg-[#111] p-5 transition hover:border-[#FF6F00]/50">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Total Orders
              </p>

              <div className="rounded-xl bg-[#FF6F00]/10 p-2 text-[#FF6F00]">
                <ClipboardList size={18} />
              </div>

            </div>

            <p className="mt-4 text-3xl font-extrabold">
              {orders.length}
            </p>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-[#FFD600]/10 bg-[#111] p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Pending
              </p>

              <Clock3
                size={19}
                className="text-[#FFD600]"
              />

            </div>

            <p className="mt-4 text-3xl font-extrabold text-[#FFD600]">
              {pendingCount}
            </p>

          </div>

          {/* PREPARING */}

          <div className="rounded-2xl border border-blue-500/10 bg-[#111] p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Preparing
              </p>

              <ChefHat
                size={19}
                className="text-blue-400"
              />

            </div>

            <p className="mt-4 text-3xl font-extrabold text-blue-400">
              {preparingCount}
            </p>

          </div>

          {/* READY */}

          <div className="rounded-2xl border border-purple-500/10 bg-[#111] p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Ready
              </p>

              <CheckCircle2
                size={19}
                className="text-purple-400"
              />

            </div>

            <p className="mt-4 text-3xl font-extrabold text-purple-400">
              {readyCount}
            </p>

          </div>

          {/* SERVED */}

          <div className="rounded-2xl border border-[#00FF7F]/10 bg-[#111] p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Served
              </p>

              <CheckCircle2
                size={19}
                className="text-[#00FF7F]"
              />

            </div>

            <p className="mt-4 text-3xl font-extrabold text-[#00FF7F]">
              {servedCount}
            </p>

          </div>

          {/* CANCELLED */}

          <div className="rounded-2xl border border-red-500/10 bg-[#111] p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-[#888]">
                Cancelled
              </p>

              <XCircle
                size={19}
                className="text-red-400"
              />

            </div>

            <p className="mt-4 text-3xl font-extrabold text-red-400">
              {cancelledCount}
            </p>

          </div>

        </div>

        {/* STATUS FILTERS */}

        <div className="mt-7 overflow-x-auto rounded-2xl border border-[#242424] bg-[#111] p-4">

          <div className="flex min-w-max gap-2">

            {statuses.map((status) => {

              const active =
                filterStatus === status;

              return (
                <button
                  key={status}
                  onClick={() =>
                    setFilterStatus(status)
                  }
                  className={`rounded-full px-5 py-2.5 text-sm font-bold capitalize transition ${
                    active
                      ? "bg-gradient-to-r from-[#FF6F00] to-[#FFD600] text-black"
                      : "border border-[#2a2a2a] bg-[#080808] text-[#888] hover:border-[#FF6F00] hover:text-white"
                  }`}
                >
                  {status === "all"
                    ? "All Orders"
                    : status}
                </button>
              );
            })}

          </div>

        </div>

        {/* TITLE */}

        <div className="mb-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
              Order Management
            </p>

            <h2 className="mt-1 text-2xl font-extrabold">

              {filterStatus === "all"
                ? `All Orders — ${getPeriodLabel()}`
                : `${filterStatus
                    .charAt(0)
                    .toUpperCase()}${filterStatus.slice(
                    1
                  )} Orders — ${getPeriodLabel()}`}

            </h2>

          </div>

          <span className="w-fit rounded-full border border-[#FF6F00]/20 bg-[#FF6F00]/10 px-4 py-2 text-sm font-bold text-[#FF6F00]">

            {filteredOrders.length}{" "}

            {filteredOrders.length === 1
              ? "order"
              : "orders"}

          </span>

        </div>

        {/* ORDERS */}

        {loading ? (

          <div className="rounded-3xl border border-[#242424] bg-[#111] p-14 text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-[#FF6F00]"
            />

            <p className="mt-4 font-semibold text-[#888]">
              Loading orders...
            </p>

          </div>

        ) : filteredOrders.length === 0 ? (

          <div className="rounded-3xl border border-[#242424] bg-[#111] p-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6F00]/10 text-[#FF6F00]">

              <ClipboardList size={30} />

            </div>

            <h3 className="mt-5 text-xl font-extrabold">
              No orders found
            </h3>

            <p className="mt-2 text-sm text-[#666]">

              There are no orders for{" "}

              <span className="font-bold text-[#FF6F00]">
                {getPeriodLabel().toLowerCase()}
              </span>{" "}

              matching this filter.

            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredOrders.map((order) => {

              const style =
                statusStyle(order.status);

              return (
                <div
                  key={order.id}
                  className="group rounded-3xl border border-[#242424] bg-[#111] p-5 transition hover:border-[#FF6F00]/50 sm:p-6"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* ORDER INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-extrabold">
                          Order #{order.id}
                        </h3>

                        <span
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${style.badge}`}
                        >

                          {style.icon}

                          {order.status}

                        </span>

                      </div>

                      <p className="mt-4 text-lg font-bold">
                        {order.customer_name}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#777]">

                        {/* PHONE */}

                        {order.phone && (
                          <span className="flex items-center gap-1.5">

                            <Phone
                              size={14}
                              className="text-[#FF6F00]"
                            />

                            {order.phone}

                          </span>
                        )}

                        {/* ORDER TYPE */}

                        <span className="flex items-center gap-1.5 capitalize">

                          <Utensils
                            size={14}
                            className="text-[#FFD600]"
                          />

                          {order.order_type.replace(
                            "_",
                            " "
                          )}

                        </span>

                        {/* TABLE */}

                        {order.table_id !== null && (
                          <span className="flex items-center gap-1.5">

                            <MapPin
                              size={14}
                              className="text-[#00FF7F]"
                            />

                            Table {order.table_id}

                          </span>
                        )}

                      </div>

                      {/* DATE */}

                      <p className="mt-3 text-xs text-[#555]">

                        {new Date(
                          order.created_at
                        ).toLocaleString(
                          "en-NP",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "medium",
                          }
                        )}

                      </p>

                    </div>

                    {/* TOTAL + DETAILS */}

                    <div className="flex flex-col gap-4 border-t border-[#242424] pt-5 sm:flex-row sm:items-center lg:border-t-0 lg:pt-0">

                      <div className="sm:text-right">

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#555]">
                          Total
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-[#FFD600]">

                          Rs.{" "}

                          {Number(
                            order.total_amount
                          ).toLocaleString()}

                        </p>

                      </div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-xl bg-[#1a1a1a] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-gradient-to-r hover:from-[#FF6F00] hover:to-[#FFD600] hover:text-black"
                      >
                        View Details →
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

        {/* CANCELLED COUNT */}

        {cancelledCount > 0 && (

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#555]">

            <XCircle size={14} />

            {cancelledCount} cancelled{" "}

            {cancelledCount === 1
              ? "order"
              : "orders"}

          </div>

        )}

      </div>
    </main>
  );
}