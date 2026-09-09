"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminInfo = {
  user_id: string;
  branch_id: number;
  role: string;
};

type Branch = {
  id: number;
  name: string;
};

type DashboardOrder = {
  id: number;
  customer_name: string;
  status: string;
  total_amount: number;
  order_type: "delivery" | "pickup" | "dine_in";
  created_at: string;
};

export default function AdminPage() {
  const [admin, setAdmin] =
    useState<AdminInfo | null>(null);

  const [branch, setBranch] =
    useState<Branch | null>(null);

  const [orders, setOrders] =
    useState<DashboardOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadAdmin() {
      setLoading(true);
      setError("");

      try {
        /*
         * ==========================================
         * 1. CHECK AUTH SESSION
         * ==========================================
         */

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "SESSION ERROR:",
            sessionError
          );

          if (mounted) {
            setError(
              "Unable to check your login session."
            );
          }

          return;
        }

        if (!session?.user) {
          if (mounted) {
            setError(
              "You are not logged in. Please login as an admin."
            );
          }

          return;
        }

        const user = session.user;

        console.log(
          "LOGGED IN USER ID:",
          user.id
        );

        /*
         * ==========================================
         * 2. FIND ADMIN
         * ==========================================
         */

        const {
          data: adminData,
          error: adminError,
        } = await supabase
          .from("admin_users")
          .select(
            "user_id, branch_id, role"
          )
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle();

        if (adminError) {
          console.error(
            "ADMIN ERROR:",
            adminError
          );

          throw new Error(
            "Unable to check admin access."
          );
        }

        if (!adminData) {
          throw new Error(
            "You are not registered as an admin."
          );
        }

        if (mounted) {
          setAdmin(
            adminData as AdminInfo
          );
        }

        /*
         * ==========================================
         * 3. LOAD BRANCH
         * ==========================================
         */

        const {
          data: branchData,
          error: branchError,
        } = await supabase
          .from("branches")
          .select("id, name")
          .eq(
            "id",
            adminData.branch_id
          )
          .single();

        if (branchError) {
          console.error(
            "BRANCH ERROR:",
            branchError
          );

          throw new Error(
            "Unable to load your branch."
          );
        }

        if (!branchData) {
          throw new Error(
            "Your branch could not be found."
          );
        }

        if (mounted) {
          setBranch(
            branchData as Branch
          );
        }

        /*
         * ==========================================
         * 4. LOAD DASHBOARD ORDERS
         * ==========================================
         */

        await loadDashboardData(
          adminData.branch_id
        );
      } catch (error) {
        console.error(
          "DASHBOARD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        if (
          error instanceof Error &&
          error.name ===
            "AuthSessionMissingError"
        ) {
          setError(
            "You are not logged in. Please login as an admin."
          );

          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadDashboardData(
      branchId: number
    ) {
      try {
        setOrdersLoading(true);

        /*
         * ==========================================
         * TODAY'S DATE RANGE
         * ==========================================
         *
         * Uses the browser's local timezone.
         */

        const now = new Date();

        const startOfDay =
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0
          );

        const endOfDay =
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            0,
            0
          );

        /*
         * ==========================================
         * FETCH TODAY'S ORDERS
         * ==========================================
         */

        const {
          data,
          error: ordersError,
        } = await supabase
          .from("orders")
          .select(
            `
              id,
              customer_name,
              status,
              total_amount,
              order_type,
              created_at
            `
          )
          .eq(
            "branch_id",
            branchId
          )
          .gte(
            "created_at",
            startOfDay.toISOString()
          )
          .lt(
            "created_at",
            endOfDay.toISOString()
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (ordersError) {
          console.error(
            "DASHBOARD ORDERS ERROR:",
            ordersError
          );

          throw new Error(
            "Unable to load dashboard orders."
          );
        }

        const todayOrders =
          (data || []) as DashboardOrder[];

        /*
         * ==========================================
         * CALCULATE STATISTICS
         * ==========================================
         */

        const totalOrders =
          todayOrders.length;

        const pending =
          todayOrders.filter(
            (order) =>
              order.status ===
                "pending" ||
              order.status ===
                "preparing"
          ).length;

        const completed =
          todayOrders.filter(
            (order) =>
              order.status ===
                "completed" ||
              order.status ===
                "served"
          ).length;

        /*
         * Cancelled orders are not included
         * in revenue.
         */

        const revenue =
          todayOrders
            .filter(
              (order) =>
                order.status !==
                "cancelled"
            )
            .reduce(
              (
                total,
                order
              ) =>
                total +
                Number(
                  order.total_amount
                ),
              0
            );

        if (!mounted) {
          return;
        }

        setStats({
          totalOrders,
          revenue,
          pending,
          completed,
        });

        /*
         * Only show the latest 5 orders
         * on the dashboard.
         */

        setOrders(
          todayOrders.slice(
            0,
            5
          )
        );
      } catch (error) {
        console.error(
          "DASHBOARD DATA ERROR:",
          error
        );
      } finally {
        if (mounted) {
          setOrdersLoading(false);
        }
      }
    }

    loadAdmin();

    /*
     * ==========================================
     * AUTH STATE LISTENER
     * ==========================================
     */

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {
          console.log(
            "AUTH EVENT:",
            event
          );

          if (
            event ===
              "SIGNED_IN" &&
            session
          ) {
            loadAdmin();
          }

          if (
            event ===
            "SIGNED_OUT"
          ) {
            if (mounted) {
              setAdmin(null);
              setBranch(null);
              setOrders([]);
              setStats({
                totalOrders: 0,
                revenue: 0,
                pending: 0,
                completed: 0,
              });

              setError(
                "You are not logged in. Please login as an admin."
              );
            }
          }
        }
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
   * ==========================================
   * REALTIME DASHBOARD UPDATES
   * ==========================================
   */

  useEffect(() => {
    if (!admin?.branch_id) {
      return;
    }

    const branchId =
      admin.branch_id;

    const channel =
      supabase
        .channel(
          `dashboard-orders-${branchId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `branch_id=eq.${branchId}`,
          },
          async (payload) => {
            console.log(
              "DASHBOARD REALTIME UPDATE:",
              payload
            );

            /*
             * Reload dashboard by
             * triggering a fresh query.
             */

            const now =
              new Date();

            const startOfDay =
              new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );

            const endOfDay =
              new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
              );

            const {
              data,
              error,
            } = await supabase
              .from("orders")
              .select(
                `
                  id,
                  customer_name,
                  status,
                  total_amount,
                  order_type,
                  created_at
                `
              )
              .eq(
                "branch_id",
                branchId
              )
              .gte(
                "created_at",
                startOfDay.toISOString()
              )
              .lt(
                "created_at",
                endOfDay.toISOString()
              )
              .order(
                "created_at",
                {
                  ascending: false,
                }
              );

            if (error) {
              console.error(
                "REALTIME DASHBOARD LOAD ERROR:",
                error
              );

              return;
            }

            const todayOrders =
              (data ||
                []) as DashboardOrder[];

            const totalOrders =
              todayOrders.length;

            const pending =
              todayOrders.filter(
                (order) =>
                  order.status ===
                    "pending" ||
                  order.status ===
                    "preparing"
              ).length;

            const completed =
              todayOrders.filter(
                (order) =>
                  order.status ===
                    "completed" ||
                  order.status ===
                    "served"
              ).length;

            const revenue =
              todayOrders
                .filter(
                  (order) =>
                    order.status !==
                    "cancelled"
                )
                .reduce(
                  (
                    total,
                    order
                  ) =>
                    total +
                    Number(
                      order.total_amount
                    ),
                  0
                );

            setStats({
              totalOrders,
              revenue,
              pending,
              completed,
            });

            setOrders(
              todayOrders.slice(
                0,
                5
              )
            );
          }
        )
        .subscribe(
          (status) => {
            console.log(
              "DASHBOARD REALTIME STATUS:",
              status
            );
          }
        );

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [admin?.branch_id]);

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">

          <div className="text-4xl">
            🥤
          </div>

          <p className="mt-4 font-semibold text-gray-500">
            Loading admin dashboard...
          </p>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Access Denied
          </h1>

          <p className="mt-3 text-red-500">
            {error}
          </p>

          <Link
            href="/admin/login"
            className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Admin Login
          </Link>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * DASHBOARD
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
              Admin Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
              Welcome Back 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Here&apos;s what&apos;s happening at your branch today.
            </p>

          </div>

          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Your Branch
            </p>

            <p className="mt-1 text-xl font-extrabold text-orange-600">
              {branch?.name}
            </p>

          </div>

        </div>

        {/* ================= STATS ================= */}

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="📦"
            title="Today&apos;s Orders"
            value={stats.totalOrders}
            description="Orders received today"
          />

          <StatCard
            icon="💰"
            title="Today&apos;s Revenue"
            value={`Rs. ${stats.revenue.toFixed(2)}`}
            description="Excluding cancelled orders"
          />

          <StatCard
            icon="⏳"
            title="Pending"
            value={stats.pending}
            description="Pending & preparing"
          />

          <StatCard
            icon="✅"
            title="Completed"
            value={stats.completed}
            description="Completed & served"
          />

        </section>

        {/* ================= MAIN CONTENT ================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* ================= RECENT ORDERS ================= */}

          <section className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-extrabold text-gray-900">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest orders from your branch today.
                </p>

              </div>

              <Link
                href="/admin/orders"
                className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-200"
              >
                View All
              </Link>

            </div>

            {ordersLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-gray-50 p-8 text-center">

                <div className="text-4xl">
                  📭
                </div>

                <p className="mt-3 font-bold text-gray-700">
                  No orders today
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  New orders will appear here.
                </p>

              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">

                <table className="w-full min-w-[650px]">

                  <thead>

                    <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">

                      <th className="pb-4">
                        Order
                      </th>

                      <th className="pb-4">
                        Customer
                      </th>

                      <th className="pb-4">
                        Type
                      </th>

                      <th className="pb-4">
                        Amount
                      </th>

                      <th className="pb-4">
                        Status
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
                          className="border-b border-gray-50 last:border-0"
                        >

                          <td className="py-4">

                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-extrabold text-orange-600 hover:text-orange-700"
                            >
                              #{order.id}
                            </Link>

                            <p className="mt-1 text-xs text-gray-400">
                              {formatTime(
                                order.created_at
                              )}
                            </p>

                          </td>

                          <td className="py-4">

                            <p className="font-bold text-gray-900">
                              {
                                order.customer_name
                              }
                            </p>

                          </td>

                          <td className="py-4">

                            <OrderTypeBadge
                              type={
                                order.order_type
                              }
                            />

                          </td>

                          <td className="py-4 font-bold text-gray-900">
                            Rs.{" "}
                            {Number(
                              order.total_amount
                            ).toFixed(
                              2
                            )}
                          </td>

                          <td className="py-4">

                            <StatusBadge
                              status={
                                order.status
                              }
                            />

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="rounded-3xl bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-extrabold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your branch quickly.
            </p>

            <div className="mt-6 space-y-3">

              <QuickAction
                href="/admin/orders"
                icon="📦"
                title="Manage Orders"
                description="View and update orders"
              />

              <QuickAction
                href="/admin/products"
                icon="🍹"
                title="Manage Products"
                description="Update your menu"
              />

              <QuickAction
                href="/admin/tables"
                icon="🪑"
                title="Manage Tables"
                description="Control table availability"
              />

              <QuickAction
                href="/admin/reports"
                icon="📊"
                title="View Reports"
                description="Analyze branch performance"
              />

            </div>

          </section>

        </div>

        {/* ================= ADMIN INFO ================= */}

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-sm">

          <h2 className="text-xl font-extrabold text-gray-900">
            Branch Information
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-3">

            <InfoItem
              label="Branch"
              value={
                branch?.name ||
                "-"
              }
            />

            <InfoItem
              label="Branch ID"
              value={
                String(
                  admin?.branch_id ||
                    "-"
                )
              }
            />

            <div>

              <p className="text-sm text-gray-500">
                Role
              </p>

              <p className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                {admin?.role}
              </p>

            </div>

          </div>

        </section>

        {/* ================= BRANCH NOTICE ================= */}

        <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-100 p-7">

          <h2 className="text-xl font-extrabold text-orange-900">
            Branch-specific dashboard
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-800">
            You are viewing the dashboard for{" "}
            <strong>
              {branch?.name}
            </strong>
            . All order statistics and management
            features are restricted to this branch.
          </p>

        </section>

      </div>
    </main>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div className="text-3xl">
          {icon}
        </div>

        <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
          Today
        </div>

      </div>

      <p className="mt-5 text-sm font-semibold text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* =====================================================
   QUICK ACTION
===================================================== */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50"
    >

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
        {icon}
      </div>

      <div>

        <p className="font-extrabold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

      </div>

    </Link>
  );
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let className =
    "bg-gray-100 text-gray-700";

  if (
    normalized ===
    "pending"
  ) {
    className =
      "bg-yellow-100 text-yellow-700";
  }

  if (
    normalized ===
      "preparing" ||
    normalized ===
      "ready"
  ) {
    className =
      "bg-orange-100 text-orange-700";
  }

  if (
    normalized ===
      "completed" ||
    normalized ===
      "served"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (
    normalized ===
    "cancelled"
  ) {
    className =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${className}`}
    >
      {status}
    </span>
  );
}

/* =====================================================
   ORDER TYPE BADGE
===================================================== */

function OrderTypeBadge({
  type,
}: {
  type:
    | "delivery"
    | "pickup"
    | "dine_in";
}) {
  const label =
    type === "dine_in"
      ? "Dine In"
      : type === "pickup"
      ? "Pickup"
      : "Delivery";

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize text-gray-700">
      {label}
    </span>
  );
}

/* =====================================================
   TIME FORMAT
===================================================== */

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}