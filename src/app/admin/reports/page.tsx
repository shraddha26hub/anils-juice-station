"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  total_amount: number;
  status: string;
  order_type: string;
  created_at: string;
};

type Admin = {
  branch_id: number;
};

type Branch = {
  name: string;
};

type ReportPeriod =
  | "weekly"
  | "monthly"
  | "yearly";

export default function AdminReportsPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [branchName, setBranchName] =
    useState("");

  const [period, setPeriod] =
    useState<ReportPeriod>("weekly");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ========================================
   * LOAD REPORTS
   * ========================================
   */

  useEffect(() => {
    loadReports();
  }, [period]);

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      /*
       * 1. Get logged-in user
       */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You are not logged in."
        );
      }

      /*
       * 2. Find admin's branch
       */

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

      const typedAdmin =
        admin as Admin;

      /*
       * 3. Load branch name
       */

      const {
        data: branch,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("name")
        .eq(
          "id",
          typedAdmin.branch_id
        )
        .single();

      if (branchError || !branch) {
        throw new Error(
          "Unable to load your branch."
        );
      }

      setBranchName(
        (branch as Branch).name
      );

      /*
       * ========================================
       * 4. CALCULATE DATE RANGE
       * ========================================
       */

      const now = new Date();

      let startDate: Date;

      if (period === "weekly") {
        /*
         * Current week starts Monday
         */

        startDate = new Date(now);

        const day =
          startDate.getDay();

        const daysFromMonday =
          day === 0 ? 6 : day - 1;

        startDate.setDate(
          startDate.getDate() -
            daysFromMonday
        );

        startDate.setHours(
          0,
          0,
          0,
          0
        );
      } else if (
        period === "monthly"
      ) {
        /*
         * First day of current month
         */

        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        startDate.setHours(
          0,
          0,
          0,
          0
        );
      } else {
        /*
         * First day of current year
         */

        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );

        startDate.setHours(
          0,
          0,
          0,
          0
        );
      }

      /*
       * End date = now
       */

      const endDate =
        new Date();

      /*
       * ========================================
       * 5. LOAD ORDERS
       * ========================================
       *
       * Only:
       * - Current admin's branch
       * - Selected time period
       */

      const {
        data,
        error: orderError,
      } = await supabase
        .from("orders")
        .select(
          `
            id,
            total_amount,
            status,
            order_type,
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
        throw new Error(
          orderError.message
        );
      }

      setOrders(
        (data ?? []) as Order[]
      );
    } catch (error) {
      console.error(
        "REPORT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ========================================
   * PERIOD LABEL
   * ========================================
   */

  function getPeriodLabel() {
    if (period === "weekly") {
      return "This Week";
    }

    if (period === "monthly") {
      return "This Month";
    }

    return "This Year";
  }

  /*
   * ========================================
   * STATUS FILTERS
   * ========================================
   */

  const servedOrders =
    orders.filter(
      (order) =>
        order.status === "served"
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "pending"
    );

  const preparingOrders =
    orders.filter(
      (order) =>
        order.status === "preparing"
    );

  const readyOrders =
    orders.filter(
      (order) =>
        order.status === "ready"
    );

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status === "cancelled"
    );

  /*
   * ========================================
   * REVENUE
   * ========================================
   *
   * Only served orders count.
   */

  const totalRevenue =
    servedOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount
        ),
      0
    );

  /*
   * ========================================
   * AVERAGE SERVED ORDER
   * ========================================
   */

  const averageOrder =
    servedOrders.length > 0
      ? Math.round(
          totalRevenue /
            servedOrders.length
        )
      : 0;

  /*
   * ========================================
   * ORDER TYPES
   * ========================================
   */

  const dineInOrders =
    orders.filter(
      (order) =>
        order.order_type ===
        "dine_in"
    ).length;

  const pickupOrders =
    orders.filter(
      (order) =>
        order.order_type ===
        "pickup"
    ).length;

  const deliveryOrders =
    orders.filter(
      (order) =>
        order.order_type ===
        "delivery"
    ).length;

  /*
   * ========================================
   * LOADING
   * ========================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="font-semibold text-gray-500">
          Loading reports...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-10">

      <div className="mx-auto max-w-7xl">

        {/* ========================================
            BACK
        ======================================== */}

        <Link
          href="/admin"
          className="text-sm font-bold text-orange-500 hover:text-orange-600"
        >
          ← Back to Dashboard
        </Link>

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mt-4">

          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Reports
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
            Branch Reports
          </h1>

          <p className="mt-2 text-gray-600">
            Performance overview for{" "}
            <strong>
              {branchName}
            </strong>
            .
          </p>

        </div>

        {/* ========================================
            PERIOD SELECTOR
        ======================================== */}

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-500">
                Report Period
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                {getPeriodLabel()}
              </h2>

            </div>

            <div className="flex w-full rounded-2xl bg-gray-100 p-1 sm:w-auto">

              <PeriodButton
                active={
                  period ===
                  "weekly"
                }
                onClick={() =>
                  setPeriod(
                    "weekly"
                  )
                }
              >
                Weekly
              </PeriodButton>

              <PeriodButton
                active={
                  period ===
                  "monthly"
                }
                onClick={() =>
                  setPeriod(
                    "monthly"
                  )
                }
              >
                Monthly
              </PeriodButton>

              <PeriodButton
                active={
                  period ===
                  "yearly"
                }
                onClick={() =>
                  setPeriod(
                    "yearly"
                  )
                }
              >
                Yearly
              </PeriodButton>

            </div>

          </div>

        </section>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* ========================================
            SUMMARY
        ======================================== */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <ReportCard
            icon="💰"
            title={`${getPeriodLabel()} Revenue`}
            value={`Rs. ${totalRevenue.toLocaleString()}`}
          />

          <ReportCard
            icon="🍹"
            title="Served Orders"
            value={
              servedOrders.length
            }
          />

          <ReportCard
            icon="⏳"
            title="Pending"
            value={
              pendingOrders.length
            }
          />

          <ReportCard
            icon="📈"
            title="Average Served Order"
            value={`Rs. ${averageOrder.toLocaleString()}`}
          />

        </div>

        {/* ========================================
            STATUS SUMMARY
        ======================================== */}

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-2xl font-extrabold text-gray-900">
                Order Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders for{" "}
                {getPeriodLabel().toLowerCase()}.
              </p>

            </div>

            <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              {orders.length} total
              orders
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <ReportRow
              label="Served"
              value={
                servedOrders.length
              }
              total={orders.length}
            />

            <ReportRow
              label="Ready"
              value={
                readyOrders.length
              }
              total={orders.length}
            />

            <ReportRow
              label="Preparing"
              value={
                preparingOrders.length
              }
              total={orders.length}
            />

            <ReportRow
              label="Pending"
              value={
                pendingOrders.length
              }
              total={orders.length}
            />

            <ReportRow
              label="Cancelled"
              value={
                cancelledOrders.length
              }
              total={orders.length}
            />

          </div>

        </section>

        {/* ========================================
            REVENUE INFORMATION
        ======================================== */}

        <section className="mt-8 rounded-3xl bg-gray-900 p-7 text-white shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-400">
                Earned Revenue
              </p>

              <p className="mt-2 text-4xl font-extrabold">
                Rs.{" "}
                {totalRevenue.toLocaleString()}
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">

              <p className="text-sm text-gray-400">
                Revenue Rule
              </p>

              <p className="mt-1 font-bold text-white">
                Only SERVED orders
                are counted
              </p>

            </div>

          </div>

          <p className="mt-5 text-sm leading-6 text-gray-400">
            An order contributes
            to revenue only after
            staff marks it as
            served. Pending,
            preparing, ready,
            and cancelled orders
            do not contribute to
            revenue.
          </p>

        </section>

        {/* ========================================
            ORDER TYPES
        ======================================== */}

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-extrabold text-gray-900">
            Order Types
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Total orders by order
            type for{" "}
            {getPeriodLabel().toLowerCase()}.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">

            <OrderTypeCard
              icon="🪑"
              title="Dine In"
              count={
                dineInOrders
              }
            />

            <OrderTypeCard
              icon="🛍️"
              title="Pickup"
              count={
                pickupOrders
              }
            />

            <OrderTypeCard
              icon="🛵"
              title="Delivery"
              count={
                deliveryOrders
              }
            />

          </div>

        </section>

        {/* ========================================
            ORDERS
        ======================================== */}

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-2xl font-extrabold text-gray-900">
                Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders for{" "}
                {getPeriodLabel().toLowerCase()}.
              </p>

            </div>

            <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              {orders.length} orders
            </div>

          </div>

          {orders.length === 0 ? (

            /* ========================================
               NO ORDERS
            ======================================== */

            <div className="mt-8 rounded-2xl bg-gray-50 p-8 text-center">

              <p className="text-4xl">
                📦
              </p>

              <p className="mt-3 font-bold text-gray-700">
                No orders found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                There are no orders
                for this period.
              </p>

            </div>

          ) : (

            /* ========================================
               ORDER TABLE
            ======================================== */

            <div className="mt-6 overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="border-b border-gray-200 text-left">

                    <th className="px-4 py-4 text-sm font-bold text-gray-500">
                      Order
                    </th>

                    <th className="px-4 py-4 text-sm font-bold text-gray-500">
                      Type
                    </th>

                    <th className="px-4 py-4 text-sm font-bold text-gray-500">
                      Status
                    </th>

                    <th className="px-4 py-4 text-sm font-bold text-gray-500">
                      Amount
                    </th>

                    <th className="px-4 py-4 text-sm font-bold text-gray-500">
                      Date & Time
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {orders.map(
                    (order) => (

                      <tr
                        key={
                          order.id
                        }
                        className="border-b border-gray-100 last:border-0 hover:bg-orange-50/50"
                      >

                        {/* ORDER ID */}

                        <td className="px-4 py-4">

                          <span className="font-extrabold text-gray-900">
                            #{order.id}
                          </span>

                        </td>

                        {/* ORDER TYPE */}

                        <td className="px-4 py-4">

                          <OrderTypeBadge
                            type={
                              order.order_type
                            }
                          />

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <StatusBadge
                            status={
                              order.status
                            }
                          />

                        </td>

                        {/* AMOUNT */}

                        <td className="px-4 py-4">

                          <span className="font-extrabold text-gray-900">
                            Rs.{" "}
                            {Number(
                              order.total_amount
                            ).toLocaleString()}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-4 py-4">

                          <div className="text-sm">

                            <p className="font-bold text-gray-800">
                              {new Date(
                                order.created_at
                              ).toLocaleDateString(
                                "en-NP",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>

                            <p className="mt-1 text-gray-500">
                              {new Date(
                                order.created_at
                              ).toLocaleTimeString(
                                "en-NP",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

/*
 * ========================================
 * PERIOD BUTTON
 * ========================================
 */

function PeriodButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-5 py-3 text-sm font-bold transition sm:flex-none ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-gray-600 hover:bg-white hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

/*
 * ========================================
 * REPORT CARD
 * ========================================
 */

function ReportCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {value}
          </p>

        </div>

        <div className="text-4xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

/*
 * ========================================
 * REPORT ROW
 * ========================================
 */

function ReportRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div>

      <div className="flex justify-between text-sm font-bold">

        <span className="text-gray-700">
          {label}
        </span>

        <span className="text-gray-900">
          {value} ({percentage}%)
        </span>

      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">

        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/*
 * ========================================
 * ORDER TYPE CARD
 * ========================================
 */

function OrderTypeCard({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-6 text-center">

      <div className="text-4xl">
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-extrabold text-orange-600">
        {count}
      </p>

      <p className="text-sm text-gray-500">
        orders
      </p>

    </div>
  );
}

/*
 * ========================================
 * STATUS BADGE
 * ========================================
 */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    pending:
      "bg-yellow-100 text-yellow-700",

    preparing:
      "bg-blue-100 text-blue-700",

    ready:
      "bg-green-100 text-green-700",

    served:
      "bg-emerald-100 text-emerald-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  const labels: Record<
    string,
    string
  > = {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ??
        status}
    </span>
  );
}

/*
 * ========================================
 * ORDER TYPE BADGE
 * ========================================
 */

function OrderTypeBadge({
  type,
}: {
  type: string;
}) {
  const labels: Record<
    string,
    string
  > = {
    dine_in: "🪑 Dine In",
    pickup: "🛍️ Pickup",
    delivery: "🛵 Delivery",
  };

  return (
    <span className="font-bold text-gray-700">
      {labels[type] ??
        type}
    </span>
  );
}