"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  MapPin,
  Utensils,
  User,
  Clock3,
  ChefHat,
  CheckCircle2,
  XCircle,
  Package,
  Receipt,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  order_type: "dine_in" | "pickup" | "delivery";
  status: string;
  total_amount: number;
  table_id: number | null;
  branch_id: number;
  created_at: string;
  address?: string | null;
  notes?: string | null;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
  image_url: string | null;
};

type OrderItemWithProduct = OrderItem & {
  product: Product | null;
};

type Admin = {
  branch_id: number;
};

const statuses: OrderStatus[] = [
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

export default function AdminOrderDetailsPage() {
  const params = useParams();

  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemWithProduct[]>([]);
  const [branchName, setBranchName] = useState("");
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {
    if (!Number.isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId]);

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      if (!Number.isInteger(orderId) || orderId <= 0) {
        throw new Error("Invalid order ID.");
      }

      // --------------------------------------------------
      // GET CURRENT ADMIN
      // --------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You are not logged in.");
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("branch_id")
        .eq("user_id", user.id)
        .single();

      if (adminError || !admin) {
        throw new Error("You are not registered as an admin.");
      }

      const typedAdmin = admin as Admin;

      // --------------------------------------------------
      // GET BRANCH
      // --------------------------------------------------

      const { data: branch, error: branchError } = await supabase
        .from("branches")
        .select("name")
        .eq("id", typedAdmin.branch_id)
        .single();

      if (branchError || !branch) {
        throw new Error("Unable to load your branch.");
      }

      setBranchName(branch.name);

      // --------------------------------------------------
      // GET ORDER
      // --------------------------------------------------

      const { data: orderData, error: orderError } = await supabase
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
            created_at,
            address,
            notes
          `
        )
        .eq("id", orderId)
        .eq("branch_id", typedAdmin.branch_id)
        .single();

      if (orderError || !orderData) {
        console.error("ORDER DETAILS ERROR:", orderError);

        throw new Error(
          orderError?.message || "Order not found."
        );
      }

      const typedOrder = orderData as Order;

      setOrder(typedOrder);

      // --------------------------------------------------
      // GET ACTUAL TABLE NUMBER
      // --------------------------------------------------

      setTableNumber(null);

      if (typedOrder.table_id !== null) {
        const { data: tableData, error: tableError } =
          await supabase
            .from("tables")
            .select("id, table_number")
            .eq("id", typedOrder.table_id)
            .eq("branch_id", typedAdmin.branch_id)
            .maybeSingle();

        if (tableError) {
          console.error(
            "TABLE FETCH ERROR:",
            tableError
          );
        } else if (tableData) {
          setTableNumber(tableData.table_number);
        }
      }

      // --------------------------------------------------
      // GET ORDER ITEMS
      // --------------------------------------------------

      const { data: itemData, error: itemError } =
        await supabase
          .from("order_items")
          .select(
            `
              id,
              order_id,
              product_id,
              quantity,
              price,
              created_at
            `
          )
          .eq("order_id", orderId)
          .order("id");

      if (itemError) {
        throw new Error(
          `Unable to load order items: ${itemError.message}`
        );
      }

      const rawItems = (itemData ?? []) as OrderItem[];

      // --------------------------------------------------
      // GET PRODUCTS
      // --------------------------------------------------

      if (rawItems.length > 0) {
        const productIds = [
          ...new Set(
            rawItems.map(
              (item) => item.product_id
            )
          ),
        ];

        const {
          data: productData,
          error: productError,
        } = await supabase
          .from("products")
          .select("id, name, image_url")
          .in("id", productIds);

        if (productError) {
          throw new Error(
            `Unable to load products: ${productError.message}`
          );
        }

        const products =
          (productData ?? []) as Product[];

        const combinedItems: OrderItemWithProduct[] =
          rawItems.map((item) => ({
            ...item,
            product:
              products.find(
                (product) =>
                  product.id === item.product_id
              ) ?? null,
          }));

        setItems(combinedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(
        "ORDER DETAILS LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // REALTIME ORDER STATUS
  // =====================================================

  useEffect(() => {
    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return;
    }

    let channel:
      ReturnType<typeof supabase.channel> | null =
      null;

    let mounted = true;

    async function setupRealtime() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("branch_id")
        .eq("user_id", user.id)
        .single();

      if (!admin || !mounted) {
        return;
      }

      channel = supabase.channel(
        `admin-order-details-${orderId}`
      );

      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updatedOrder =
            payload.new as Order;

          // ------------------------------------------------
          // SECURITY CHECK
          // ------------------------------------------------

          if (
            updatedOrder.branch_id !==
            admin.branch_id
          ) {
            return;
          }

          console.log(
            "ADMIN ORDER REALTIME UPDATE:",
            updatedOrder
          );

          setOrder((previous) => {
            if (!previous) {
              return updatedOrder;
            }

            return {
              ...previous,
              ...updatedOrder,
            };
          });
        }
      );

      channel.subscribe((status) => {
        console.log(
          "ADMIN ORDER REALTIME STATUS:",
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

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  async function updateStatus(
    newStatus: OrderStatus
  ) {
    if (!order) {
      return;
    }

    if (!statuses.includes(newStatus)) {
      setError("Invalid order status.");
      return;
    }

    if (
      order.status === "served" ||
      order.status === "cancelled"
    ) {
      setError(
        "This order is already closed and cannot be changed."
      );

      return;
    }

    if (order.status === newStatus) {
      return;
    }

    const previousStatus = order.status;

    setUpdatingStatus(true);
    setError("");

    // Instant UI update
    setOrder({
      ...order,
      status: newStatus,
    });

    try {
      const { error: updateError } =
        await supabase
          .from("orders")
          .update({
            status: newStatus,
          })
          .eq("id", order.id)
          .eq("branch_id", order.branch_id);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      // --------------------------------------------------
      // VERIFY DATABASE UPDATE
      // --------------------------------------------------

      const {
        data: verifiedOrder,
        error: verifyError,
      } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order.id)
        .eq("branch_id", order.branch_id)
        .single();

      if (
        verifyError ||
        !verifiedOrder
      ) {
        throw new Error(
          verifyError?.message ||
            "Unable to verify the status update."
        );
      }

      if (
        verifiedOrder.status !==
        newStatus
      ) {
        throw new Error(
          "The order status was not updated in the database."
        );
      }
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      setOrder({
        ...order,
        status: previousStatus,
      });

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  function statusStyle(status: string) {
    switch (status) {
      case "pending":
        return {
          box: "border-[#FFD600]/20 bg-[#FFD600]/10",
          text: "text-[#FFD600]",
          icon: <Clock3 size={18} />,
        };

      case "preparing":
        return {
          box: "border-blue-500/20 bg-blue-500/10",
          text: "text-blue-400",
          icon: <ChefHat size={18} />,
        };

      case "ready":
        return {
          box: "border-purple-500/20 bg-purple-500/10",
          text: "text-purple-400",
          icon: <CheckCircle2 size={18} />,
        };

      case "served":
        return {
          box: "border-[#00FF7F]/20 bg-[#00FF7F]/10",
          text: "text-[#00FF7F]",
          icon: <CheckCircle2 size={18} />,
        };

      case "cancelled":
        return {
          box: "border-red-500/20 bg-red-500/10",
          text: "text-red-400",
          icon: <XCircle size={18} />,
        };

      default:
        return {
          box: "border-[#242424] bg-[#111]",
          text: "text-[#BDBDBD]",
          icon: <Clock3 size={18} />,
        };
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[#242424] bg-[#111] p-16 text-center">
            <RefreshCw
              size={35}
              className="mx-auto animate-spin text-[#FF6F00]"
            />

            <p className="mt-5 font-semibold text-[#888]">
              Loading order details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#888] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </Link>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">
            <XCircle
              size={42}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-5 text-2xl font-extrabold">
              Unable to Load Order
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error ||
                "Order not found."}
            </p>

            <button
              onClick={loadOrder}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-5 py-3 text-sm font-extrabold text-black"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentStatusStyle =
    statusStyle(order.status);

  const calculatedTotal =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );

  const isClosed =
    order.status === "served" ||
    order.status === "cancelled";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ================================================= */}
        {/* BACK + REFRESH */}
        {/* ================================================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/orders"
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#888] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </Link>

          <button
            onClick={loadOrder}
            disabled={
              loading ||
              updatingStatus
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#242424] bg-[#111] px-4 py-3 text-sm font-bold text-white transition hover:border-[#FF6F00] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="rounded-3xl border border-[#242424] bg-[#111] p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />

                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
                  Order Details
                </p>
              </div>

              <h1 className="mt-3 text-4xl font-extrabold">
                Order #{order.id}
              </h1>

              {branchName && (
                <p className="mt-2 flex items-center gap-2 text-sm text-[#888]">
                  <MapPin
                    size={15}
                    className="text-[#FF6F00]"
                  />
                  {branchName}
                </p>
              )}
            </div>

            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold capitalize ${currentStatusStyle.box} ${currentStatusStyle.text}`}
            >
              {currentStatusStyle.icon}
              {order.status}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* CUSTOMER INFORMATION */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#242424] bg-[#111] p-6 sm:p-8">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FF6F00]/10 p-2.5 text-[#FF6F00]">
              <User size={20} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold">
                Customer Information
              </h2>

              <p className="text-sm text-[#666]">
                Customer and order information
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            {/* CUSTOMER */}

            <div className="rounded-2xl border border-[#242424] bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Customer
              </p>

              <p className="mt-2 text-lg font-bold">
                {order.customer_name}
              </p>
            </div>

            {/* PHONE */}

            <div className="rounded-2xl border border-[#242424] bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Phone
              </p>

              <a
                href={`tel:${order.phone}`}
                className="mt-2 flex items-center gap-2 text-lg font-bold text-[#FFD600] hover:underline"
              >
                <Phone size={17} />
                {order.phone}
              </a>
            </div>

            {/* ORDER TYPE */}

            <div className="rounded-2xl border border-[#242424] bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Order Type
              </p>

              <p className="mt-2 flex items-center gap-2 text-lg font-bold capitalize">
                <Utensils
                  size={17}
                  className="text-[#FF6F00]"
                />

                {order.order_type.replace(
                  "_",
                  " "
                )}
              </p>
            </div>

            {/* ORDERED AT */}

            <div className="rounded-2xl border border-[#242424] bg-black p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Ordered At
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm font-bold">
                <Clock3
                  size={17}
                  className="text-[#00FF7F]"
                />

                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>
            </div>

            {/* TABLE */}

            {order.table_id !== null && (
              <div className="rounded-2xl border border-[#242424] bg-black p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                  Table
                </p>

                <p className="mt-2 flex items-center gap-2 text-lg font-bold">
                  <MapPin
                    size={17}
                    className="text-[#00FF7F]"
                  />

                  {tableNumber !== null
                    ? `Table ${tableNumber}`
                    : "Table information unavailable"}
                </p>
              </div>
            )}

            {/* DELIVERY ADDRESS */}

            {order.order_type ===
              "delivery" &&
              order.address && (
                <div className="rounded-2xl border border-[#242424] bg-black p-4 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                    Delivery Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#BDBDBD]">
                    {order.address}
                  </p>
                </div>
              )}

          </div>
        </section>

        {/* ================================================= */}
        {/* ORDER ITEMS */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#242424] bg-[#111] p-6 sm:p-8">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FFD600]/10 p-2.5 text-[#FFD600]">
              <Package size={20} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold">
                Ordered Items
              </h2>

              <p className="text-sm text-[#666]">
                {items.length}{" "}
                {items.length === 1
                  ? "item"
                  : "different items"}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-[#242424] bg-black p-8 text-center">

              <Package
                size={30}
                className="mx-auto text-[#555]"
              />

              <p className="mt-3 text-sm text-[#666]">
                No order items found.
              </p>

            </div>
          ) : (
            <div className="mt-7 space-y-3">

              {items.map((item) => {
                const itemTotal =
                  Number(item.price) *
                  Number(item.quantity);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#242424] bg-black p-4"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      {item.product
                        ?.image_url ? (
                        <img
                          src={
                            item.product
                              .image_url
                          }
                          alt={
                            item.product
                              .name
                          }
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#111] text-[#555]">
                          <Package size={22} />
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="truncate font-extrabold">
                          {item.product
                            ?.name ||
                            `Product #${item.product_id}`}
                        </p>

                        <p className="mt-1 text-sm text-[#777]">
                          Rs.{" "}
                          {Number(
                            item.price
                          ).toLocaleString()}{" "}
                          ×{" "}
                          {item.quantity}
                        </p>

                      </div>

                    </div>

                    <p className="shrink-0 text-lg font-extrabold text-[#FFD600]">
                      Rs.{" "}
                      {itemTotal.toLocaleString()}
                    </p>

                  </div>
                );
              })}

            </div>
          )}

          {/* TOTAL */}

          <div className="mt-6 border-t border-[#242424] pt-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Receipt
                  size={19}
                  className="text-[#FF6F00]"
                />

                <span className="font-bold text-[#888]">
                  Order Total
                </span>

              </div>

              <span className="text-3xl font-extrabold text-[#FFD600]">
                Rs.{" "}
                {Number(
                  order.total_amount
                ).toLocaleString()}
              </span>

            </div>

            {Math.abs(
              calculatedTotal -
                Number(
                  order.total_amount
                )
            ) > 0.01 && (
              <p className="mt-3 text-xs text-[#FFD600]">
                Item total: Rs.{" "}
                {calculatedTotal.toLocaleString()}
              </p>
            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* NOTES */}
        {/* ================================================= */}

        {order.notes && (
          <section className="mt-6 rounded-3xl border border-[#242424] bg-[#111] p-6 sm:p-8">

            <h2 className="text-xl font-extrabold">
              Additional Notes
            </h2>

            <p className="mt-4 rounded-2xl border border-[#242424] bg-black p-5 text-sm leading-6 text-[#BDBDBD]">
              {order.notes}
            </p>

          </section>
        )}

        {/* ================================================= */}
        {/* STATUS MANAGEMENT */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#242424] bg-[#111] p-6 sm:p-8">

          <div>
            <h2 className="text-xl font-extrabold">
              Order Status
            </h2>

            <p className="mt-1 text-sm text-[#666]">
              Update the order progress from here.
            </p>
          </div>

          {/* CLOSED ORDER */}

          {isClosed ? (
            <div
              className={`mt-6 rounded-2xl border p-5 ${
                order.status ===
                "served"
                  ? "border-[#00FF7F]/20 bg-[#00FF7F]/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >

              <div
                className={`flex items-center gap-3 ${
                  order.status ===
                  "served"
                    ? "text-[#00FF7F]"
                    : "text-red-400"
                }`}
              >

                {order.status ===
                "served" ? (
                  <CheckCircle2
                    size={22}
                  />
                ) : (
                  <XCircle
                    size={22}
                  />
                )}

                <div>

                  <p className="font-extrabold capitalize">
                    Order{" "}
                    {order.status}
                  </p>

                  <p className="mt-1 text-xs text-[#888]">
                    This order is closed
                    and can no longer
                    be changed.
                  </p>

                </div>

              </div>

            </div>
          ) : (
            <>
              {/* CURRENT STATUS */}

              <div className="mt-6 rounded-2xl border border-[#242424] bg-black p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                  Current Status
                </p>

                <div
                  className={`mt-3 flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold capitalize ${currentStatusStyle.box} ${currentStatusStyle.text}`}
                >
                  {currentStatusStyle.icon}
                  {order.status}
                </div>

              </div>

              {/* NEXT ACTIONS */}

              <div className="mt-5">

                <p className="text-xs font-bold uppercase tracking-wider text-[#555]">
                  Available Actions
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {/* PREPARING */}

                  {order.status ===
                    "pending" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          "preparing"
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-extrabold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChefHat
                        size={18}
                      />

                      {updatingStatus
                        ? "Updating..."
                        : "Start Preparing"}
                    </button>
                  )}

                  {/* READY */}

                  {order.status ===
                    "preparing" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          "ready"
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-extrabold text-purple-400 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2
                        size={18}
                      />

                      {updatingStatus
                        ? "Updating..."
                        : "Mark Ready"}
                    </button>
                  )}

                  {/* SERVED */}

                  {order.status ===
                    "ready" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          "served"
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#00FF7F]/30 bg-[#00FF7F]/10 px-4 py-3 text-sm font-extrabold text-[#00FF7F] transition hover:bg-[#00FF7F]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2
                        size={18}
                      />

                      {updatingStatus
                        ? "Updating..."
                        : "Mark Served"}
                    </button>
                  )}

                  {/* CANCEL */}

                  <button
                    onClick={() =>
                      updateStatus(
                        "cancelled"
                      )
                    }
                    disabled={
                      updatingStatus
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle
                      size={18}
                    />

                    {updatingStatus
                      ? "Updating..."
                      : "Cancel Order"}
                  </button>

                </div>

              </div>
            </>
          )}

        </section>

        {/* ================================================= */}
        {/* BOTTOM BACK BUTTON */}
        {/* ================================================= */}

        <div className="mt-8 pb-8">

          <Link
            href="/admin/orders"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#242424] bg-[#111] px-5 py-4 text-sm font-extrabold text-white transition hover:border-[#FF6F00] hover:bg-[#161616]"
          >
            <ArrowLeft size={17} />
            Back to All Orders
          </Link>

        </div>

      </div>
    </main>
  );
}