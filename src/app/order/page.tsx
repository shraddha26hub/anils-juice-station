"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

type OrderType = "dine_in" | "pickup" | "delivery";

type Branch = {
  id: number;
};

type RestaurantTable = {
  id: number;
  table_number: number;
  is_active: boolean;
  created_at: string;
  branch_id: number;
  status: "active" | "reserved" | "inactive";
};

export default function OrderPage() {
  const router = useRouter();

  const {
    cart,
    addToCart,
    decreaseQuantity,
    clearCart,
    cartCount,
    cartTotal,
  } = useCart();

  // ==================================================
  // BRANCH
  // ==================================================

  const [branchId, setBranchId] = useState<number | null>(null);

  // ==================================================
  // CUSTOMER
  // ==================================================

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  // ==================================================
  // ORDER
  // ==================================================

  const [orderType, setOrderType] =
    useState<OrderType>("dine_in");

  const [tableId, setTableId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // ==================================================
  // TABLES
  // ==================================================

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // ==================================================
  // PAGE STATE
  // ==================================================

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadBranch();
  }, []);

  // ==================================================
  // LOAD BRANCH
  // ==================================================

  async function loadBranch() {
    setLoading(true);
    setError("");

    try {
      const {
        data: branch,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("id")
        .eq("is_active", true)
        .order("id", {
          ascending: true,
        })
        .limit(1)
        .single();

      if (branchError || !branch) {
        console.error(
          "BRANCH ERROR:",
          branchError
        );

        throw new Error(
          branchError?.message ??
            "Unable to load branch."
        );
      }

      const typedBranch = branch as Branch;

      console.log(
        "CUSTOMER BRANCH ID:",
        typedBranch.id
      );

      setBranchId(typedBranch.id);

      await loadTables(typedBranch.id);
    } catch (error) {
      console.error(
        "BRANCH LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load branch."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // LOAD ACTIVE TABLES
  // ==================================================

  async function loadTables(
    currentBranchId: number
  ) {
    setLoadingTables(true);

    try {
      console.log(
        "================================"
      );

      console.log(
        "Loading tables for branch:",
        currentBranchId
      );

      // ==================================================
      // FIRST QUERY
      // ==================================================

      const {
        data: statusTables,
        error: statusError,
      } = await supabase
        .from("tables")
        .select(
          "id, table_number, is_active, status, created_at, branch_id"
        )
        .eq(
          "branch_id",
          currentBranchId
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "table_number",
          {
            ascending: true,
          }
        );

      console.log(
        "STATUS QUERY RESULT:",
        statusTables
      );

      console.log(
        "STATUS QUERY ERROR:",
        statusError
      );

      // ==================================================
      // IF CORRECT QUERY WORKS
      // ==================================================

      if (
        !statusError &&
        statusTables &&
        statusTables.length > 0
      ) {
        const activeTables =
          (
            statusTables as RestaurantTable[]
          )
            .filter(
              (table) =>
                table.status ===
                "active"
            )
            .sort(
              (a, b) =>
                a.table_number -
                b.table_number
            );

        console.log(
          "ACTIVE TABLES:",
          activeTables
        );

        setTables(activeTables);

        validateSelectedTable(
          activeTables
        );

        return;
      }

      // ==================================================
      // FALLBACK QUERY
      // ==================================================

      console.warn(
        "No active tables returned by status query."
      );

      console.warn(
        "Trying compatibility query..."
      );

      const {
        data: fallbackTables,
        error: fallbackError,
      } = await supabase
        .from("tables")
        .select(
          "id, table_number, is_active, status, created_at, branch_id"
        )
        .eq(
          "branch_id",
          currentBranchId
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "table_number",
          {
            ascending: true,
          }
        );

      console.log(
        "FALLBACK TABLE RESULT:",
        fallbackTables
      );

      console.log(
        "FALLBACK TABLE ERROR:",
        fallbackError
      );

      if (fallbackError) {
        throw new Error(
          statusError?.message ??
            fallbackError.message
        );
      }

      // ==================================================
      // FINAL STATUS FILTER
      // ==================================================

      const activeTables =
        (
          (fallbackTables as RestaurantTable[]) ??
          []
        )
          .filter(
            (table) =>
              table.status ===
              "active"
          )
          .sort(
            (a, b) =>
              a.table_number -
              b.table_number
          );

      console.log(
        "ACTIVE TABLES AFTER FINAL STATUS FILTER:",
        activeTables
      );

      setTables(activeTables);

      validateSelectedTable(
        activeTables
      );
    } catch (error) {
      console.error(
        "TABLE LOAD ERROR:",
        error
      );

      setTables([]);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load tables."
      );
    } finally {
      setLoadingTables(false);

      console.log(
        "================================"
      );
    }
  }

  // ==================================================
  // VALIDATE CURRENT TABLE
  // ==================================================

  function validateSelectedTable(
    activeTables: RestaurantTable[]
  ) {
    if (!tableId) {
      return;
    }

    const selectedTable =
      activeTables.find(
        (table) =>
          table.id ===
          Number(tableId)
      );

    if (!selectedTable) {
      console.log(
        "Selected table is no longer active."
      );

      setTableId("");
    }
  }

  // ==================================================
  // REFRESH TABLES
  // ==================================================

  useEffect(() => {
    if (
      orderType !== "dine_in" ||
      branchId === null
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        loadTables(branchId);
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    orderType,
    branchId,
  ]);

  // ==================================================
  // ADD TO CART
  // ==================================================

  function handleAddToCart(item: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  }) {
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
    });
  }

  // ==================================================
  // PHONE
  // ==================================================

  function handlePhoneChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    if (value.length <= 10) {
      setPhone(value);
    }
  }

  // ==================================================
  // SELECT TABLE
  // ==================================================

  function handleTableSelect(
    selectedTableId: number
  ) {
    const selectedTable =
      tables.find(
        (table) =>
          table.id ===
          selectedTableId
      );

    if (!selectedTable) {
      setError(
        "This table is no longer available."
      );

      setTableId("");

      if (
        branchId !== null
      ) {
        loadTables(branchId);
      }

      return;
    }

    if (
      selectedTable.status !==
      "active"
    ) {
      setError(
        "This table is no longer available. Please choose another table."
      );

      setTableId("");

      if (
        branchId !== null
      ) {
        loadTables(branchId);
      }

      return;
    }

    setError("");

    setTableId(
      String(selectedTableId)
    );
  }

  // ==================================================
  // PLACE ORDER
  // ==================================================

  async function placeOrder() {
    setError("");

    // ==================================================
    // CART
    // ==================================================

    if (cart.length === 0) {
      setError(
        "Your cart is empty. Please add an item first."
      );

      return;
    }

    // ==================================================
    // NAME
    // ==================================================

    if (
      orderType !== "dine_in" &&
      !customerName.trim()
    ) {
      setError(
        "Please enter your name."
      );

      return;
    }

    // ==================================================
    // PHONE
    // ACCEPTS BOTH 97 AND 98
    // ==================================================

    if (
      orderType !== "dine_in"
    ) {
      if (
        !/^(97|98)\d{8}$/.test(
          phone.trim()
        )
      ) {
        setError(
          "Please enter a valid 10-digit Nepal mobile number starting with 97 or 98."
        );

        return;
      }
    }

    // ==================================================
    // BRANCH
    // ==================================================

    if (
      branchId === null
    ) {
      setError(
        "Branch information is unavailable."
      );

      return;
    }

    // ==================================================
    // TABLE
    // ==================================================

    let numericTableId:
      number | null = null;

    if (
      orderType === "dine_in"
    ) {
      if (!tableId.trim()) {
        setError(
          "Please select an active table."
        );

        return;
      }

      const parsedTableId =
        Number(tableId);

      if (
        !Number.isInteger(
          parsedTableId
        ) ||
        parsedTableId <= 0
      ) {
        setError(
          "Please select a valid table."
        );

        return;
      }

      const selectedTable =
        tables.find(
          (table) =>
            table.id ===
            parsedTableId
        );

      if (!selectedTable) {
        setError(
          "The selected table is no longer available."
        );

        setTableId("");

        await loadTables(
          branchId
        );

        return;
      }

      if (
        selectedTable.status !==
        "active"
      ) {
        setError(
          "This table is no longer available. Please choose another table."
        );

        setTableId("");

        await loadTables(
          branchId
        );

        return;
      }

      numericTableId =
        parsedTableId;
    }

    // ==================================================
    // DELIVERY ADDRESS
    // ==================================================

    if (
      orderType === "delivery" &&
      !address.trim()
    ) {
      setError(
        "Please enter your delivery address."
      );

      return;
    }

    setPlacingOrder(true);

    try {
      // ==================================================
      // CREATE ORDER
      // ==================================================

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          customer_name:
            customerName.trim() ||
            null,

          phone:
            orderType === "dine_in"
              ? null
              : phone.trim(),

          order_type:
            orderType,

          status:
            "pending",

          total_amount:
            Number(cartTotal),

          table_id:
            numericTableId,

          branch_id:
            branchId,

          address:
            orderType === "delivery"
              ? address.trim()
              : null,

          notes:
            notes.trim() ||
            null,
        })
        .select("id")
        .single();

      if (
        orderError ||
        !order
      ) {
        throw new Error(
          orderError?.message ??
            "Unable to create order."
        );
      }

      // ==================================================
      // CREATE ORDER ITEMS
      // ==================================================

      const orderItems =
        cart.map(
          (item) => ({
            order_id:
              order.id,

            product_id:
              item.id,

            quantity:
              item.quantity,

            price:
              Number(
                item.price
              ),
          })
        );

      const {
        error: itemsError,
      } = await supabase
        .from("order_items")
        .insert(
          orderItems
        );

      // ==================================================
      // ROLLBACK
      // ==================================================

      if (itemsError) {
        await supabase
          .from("orders")
          .delete()
          .eq(
            "id",
            order.id
          );

        throw new Error(
          itemsError.message
        );
      }

      // ==================================================
      // SAVE ORDER ID
      // ==================================================

      let existingOrders:
        number[] = [];

      try {
        const storedOrders =
          localStorage.getItem(
            "anils-orders"
          );

        if (storedOrders) {
          const parsedOrders =
            JSON.parse(
              storedOrders
            );

          if (
            Array.isArray(
              parsedOrders
            )
          ) {
            existingOrders =
              parsedOrders
                .map(Number)
                .filter(
                  (id) =>
                    Number.isFinite(
                      id
                    )
                );
          }
        }
      } catch (
        storageError
      ) {
        console.error(
          "LOCAL STORAGE ERROR:",
          storageError
        );
      }

      const updatedOrders = [
        ...new Set([
          ...existingOrders,
          Number(order.id),
        ]),
      ];

      localStorage.setItem(
        "anils-orders",
        JSON.stringify(
          updatedOrders
        )
      );

      // ==================================================
      // CLEAR CART
      // ==================================================

      clearCart();

      // ==================================================
      // TRACK ORDER
      // ==================================================

      router.push(
        `/order/${order.id}`
      );
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to place order."
      );
    } finally {
      setPlacingOrder(
        false
      );
    }
  }

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#242424] border-t-[#FF6F00]" />

          <p className="mt-4 text-sm font-semibold text-white">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="border-b border-[#242424] pb-7">
          <Link
            href="/cart"
            className="text-sm font-bold text-[#FF6F00] hover:text-[#FFD600]"
          >
            ← Back to Cart
          </Link>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
            Anil&apos;s Juice Station
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Complete Your Order
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Enter your details and confirm
            your order.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-500/30 bg-black p-4 font-semibold text-red-400">
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-lg text-red-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_400px]">

          {/* ==================================================
              LEFT
          ================================================== */}

          <section className="space-y-7">

            {/* CUSTOMER INFORMATION */}

            <div className="rounded-3xl border border-[#242424] bg-black p-6 sm:p-7">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
                Customer Information
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-white">
                Your Details
              </h2>

              <p className="mt-2 text-sm text-white/60">
                {orderType === "dine_in"
                  ? "Name is optional for dine-in orders."
                  : "Please provide your contact details."}
              </p>

              <div className="mt-6 space-y-4">

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-white">
                    Name{" "}

                    {orderType !==
                      "dine_in" && (
                      <span className="text-[#FF6F00]">
                        *
                      </span>
                    )}
                  </label>

                  <input
                    type="text"
                    value={
                      customerName
                    }
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    placeholder={
                      orderType ===
                      "dine_in"
                        ? "Enter your name (optional)"
                        : "Enter your name"
                    }
                    className="w-full rounded-xl border border-[#242424] bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-[#FF6F00]"
                  />
                </div>

                {/* PHONE */}

                {orderType !==
                  "dine_in" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">
                      Phone Number{" "}

                      <span className="text-[#FF6F00]">
                        *
                      </span>
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      value={
                        phone
                      }
                      onChange={
                        handlePhoneChange
                      }
                      placeholder="97XXXXXXXX or 98XXXXXXXX"
                      maxLength={
                        10
                      }
                      className="w-full rounded-xl border border-[#242424] bg-black px-4 py-3.5 text-white outline-none transition placeholder:text-white/30 focus:border-[#FF6F00]"
                    />

                    <p className="mt-2 text-xs text-white/50">
                      Enter a 10-digit mobile
                      number starting with
                      97 or 98.
                    </p>

                    {phone.length >
                      0 &&
                      phone.length <
                        10 && (
                        <p className="mt-1 text-xs text-[#FFD600]">
                          {10 -
                            phone.length}{" "}
                          digits remaining
                        </p>
                      )}

                    {phone.length ===
                      10 &&
                      /^(97|98)\d{8}$/.test(
                        phone
                      ) && (
                        <p className="mt-1 text-xs font-semibold text-[#00FF7F]">
                          ✓ Valid phone number
                        </p>
                      )}

                    {phone.length ===
                      10 &&
                      !/^(97|98)\d{8}$/.test(
                        phone
                      ) && (
                        <p className="mt-1 text-xs font-semibold text-red-500">
                          Phone number must start
                          with 97 or 98.
                        </p>
                      )}
                  </div>
                )}

              </div>
            </div>

            {/* ORDER TYPE */}

            <div className="rounded-3xl border border-[#242424] bg-black p-6 sm:p-7">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
                Order Type
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-white">
                How would you like your order?
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                {/* DINE IN */}

                <button
                  type="button"
                  onClick={() => {
                    setOrderType(
                      "dine_in"
                    );

                    setError("");

                    if (
                      branchId !==
                      null
                    ) {
                      loadTables(
                        branchId
                      );
                    }
                  }}
                  className={`rounded-2xl border bg-black p-5 text-left text-white transition ${
                    orderType ===
                    "dine_in"
                      ? "border-[#FF6F00] shadow-[0_0_20px_rgba(255,111,0,0.10)]"
                      : "border-[#242424] hover:border-[#FF6F00]/60"
                  }`}
                >
                  <div className="text-2xl">
                    🪑
                  </div>

                  <p className="mt-3 font-extrabold text-white">
                    Dine In
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    Enjoy your order at the station
                  </p>
                </button>

                {/* PICKUP */}

                <button
                  type="button"
                  onClick={() => {
                    setOrderType(
                      "pickup"
                    );

                    setTableId("");

                    setError("");
                  }}
                  className={`rounded-2xl border bg-black p-5 text-left text-white transition ${
                    orderType ===
                    "pickup"
                      ? "border-[#FF6F00] shadow-[0_0_20px_rgba(255,111,0,0.10)]"
                      : "border-[#242424] hover:border-[#FF6F00]/60"
                  }`}
                >
                  <div className="text-2xl">
                    🛍️
                  </div>

                  <p className="mt-3 font-extrabold text-white">
                    Pickup
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    Pick up your order
                  </p>
                </button>

                {/* DELIVERY */}

                <button
                  type="button"
                  onClick={() => {
                    setOrderType(
                      "delivery"
                    );

                    setTableId("");

                    setError("");
                  }}
                  className={`rounded-2xl border bg-black p-5 text-left text-white transition ${
                    orderType ===
                    "delivery"
                      ? "border-[#FF6F00] shadow-[0_0_20px_rgba(255,111,0,0.10)]"
                      : "border-[#242424] hover:border-[#FF6F00]/60"
                  }`}
                >
                  <div className="text-2xl">
                    🛵
                  </div>

                  <p className="mt-3 font-extrabold text-white">
                    Delivery
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    Enter your delivery address
                  </p>
                </button>

              </div>

              {/* TABLE SELECTION */}

              {orderType ===
                "dine_in" && (
                <div className="mt-7">

                  <div className="flex items-end justify-between gap-4">

                    <div>
                      <label className="block text-sm font-bold text-white">
                        Select Your Table{" "}

                        <span className="text-[#FF6F00]">
                          *
                        </span>
                      </label>

                      <p className="mt-1 text-xs text-white/50">
                        Only currently available
                        tables are shown.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          branchId !==
                          null
                        ) {
                          loadTables(
                            branchId
                          );
                        }
                      }}
                      className="text-xs font-bold text-[#FF6F00] hover:text-[#FFD600]"
                    >
                      ↻ Refresh
                    </button>

                  </div>

                  {/* LOADING */}

                  {loadingTables ? (
                    <div className="mt-5 rounded-2xl border border-[#242424] bg-black p-8 text-center">

                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[#242424] border-t-[#FF6F00]" />

                      <p className="mt-3 text-sm text-white/50">
                        Checking available tables...
                      </p>

                    </div>
                  ) : tables.length ===
                    0 ? (
                    <div className="mt-5 rounded-2xl border border-[#242424] bg-black p-6 text-center">

                      <div className="text-3xl">
                        🪑
                      </div>

                      <p className="mt-3 font-bold text-white">
                        No tables are currently available.
                      </p>

                      <p className="mt-1 text-sm text-white/50">
                        Please try again in a moment.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            branchId !==
                            null
                          ) {
                            loadTables(
                              branchId
                            );
                          }
                        }}
                        className="mt-4 rounded-xl bg-[#FF6F00] px-4 py-2 text-sm font-extrabold text-black hover:bg-[#FFD600]"
                      >
                        Refresh Tables
                      </button>

                    </div>
                  ) : (

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                      {tables.map(
                        (table) => {

                          if (
                            table.status !==
                            "active"
                          ) {
                            return null;
                          }

                          const selected =
                            tableId ===
                            String(
                              table.id
                            );

                          return (
                            <button
                              key={
                                table.id
                              }
                              type="button"
                              onClick={() =>
                                handleTableSelect(
                                  table.id
                                )
                              }
                              className={`rounded-2xl border bg-black p-5 text-center text-white transition ${
                                selected
                                  ? "border-[#FF6F00] shadow-[0_0_20px_rgba(255,111,0,0.12)]"
                                  : "border-[#00FF7F]/30 hover:border-[#00FF7F]"
                              }`}
                            >

                              <div className="text-3xl">
                                🪑
                              </div>

                              <p className="mt-2 font-extrabold text-white">
                                Table{" "}
                                {
                                  table.table_number
                                }
                              </p>

                              {selected ? (
                                <p className="mt-1 text-xs font-bold text-[#FF6F00]">
                                  ✓ Selected
                                </p>
                              ) : (
                                <p className="mt-1 text-xs font-bold text-[#00FF7F]">
                                  Available
                                </p>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                  {/* SELECTED TABLE */}

                  {tableId && (
                    <div className="mt-4 rounded-xl border border-[#FF6F00]/30 bg-black px-4 py-3">

                      <div className="flex items-center justify-between gap-4">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                            Selected Table
                          </p>

                          <p className="mt-1 font-extrabold text-[#FF6F00]">
                            Table{" "}
                            {
                              tables.find(
                                (table) =>
                                  table.id ===
                                  Number(
                                    tableId
                                  )
                              )
                                ?.table_number
                            }
                          </p>
                        </div>

                        <span className="rounded-full border border-[#00FF7F]/30 px-3 py-1 text-xs font-bold text-[#00FF7F]">
                          Available
                        </span>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* DELIVERY ADDRESS */}

              {orderType ===
                "delivery" && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-bold text-white">
                    Delivery Address{" "}

                    <span className="text-[#FF6F00]">
                      *
                    </span>
                  </label>

                  <textarea
                    value={
                      address
                    }
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Enter your delivery address"
                    className="w-full resize-none rounded-xl border border-[#242424] bg-black px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-[#FF6F00]"
                  />

                </div>
              )}

            </div>

            {/* SPECIAL NOTES */}

            <div className="rounded-3xl border border-[#242424] bg-black p-6 sm:p-7">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#FFD600]">
                Optional
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-white">
                Special Notes
              </h2>

              <textarea
                value={
                  notes
                }
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Any special request?"
                className="mt-5 w-full resize-none rounded-xl border border-[#242424] bg-black px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-[#FFD600]"
              />

            </div>

          </section>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="rounded-3xl border border-[#242424] bg-black p-6 sm:p-7">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                    Your Order
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-white">
                    Order Summary
                  </h2>
                </div>

                <span className="rounded-full border border-[#FF6F00]/30 px-3 py-1 text-sm font-bold text-[#FF6F00]">
                  {cartCount}
                </span>

              </div>

              {/* EMPTY CART */}

              {cart.length ===
              0 ? (
                <div className="mt-6 rounded-2xl border border-[#242424] bg-black p-6 text-center">

                  <div className="text-4xl">
                    🛒
                  </div>

                  <p className="mt-3 font-bold text-white">
                    Your cart is empty.
                  </p>

                  <Link
                    href="/menu"
                    className="mt-4 inline-block font-bold text-[#FF6F00] hover:text-[#FFD600]"
                  >
                    Browse Menu →
                  </Link>

                </div>
              ) : (
                <>

                  {/* CART ITEMS */}

                  <div className="mt-6 space-y-4">

                    {cart.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="rounded-2xl border border-[#242424] bg-black p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="font-extrabold text-white">
                                {
                                  item.name
                                }
                              </p>

                              <p className="mt-1 text-sm text-white/50">
                                Rs.{" "}
                                {Number(
                                  item.price
                                ).toLocaleString()}{" "}
                                ×{" "}
                                {
                                  item.quantity
                                }
                              </p>

                            </div>

                            <p className="font-extrabold text-[#FFD600]">
                              Rs.{" "}
                              {(
                                Number(
                                  item.price
                                ) *
                                item.quantity
                              ).toLocaleString()}
                            </p>

                          </div>

                          {/* QUANTITY */}

                          <div className="mt-3 flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className="h-8 w-8 rounded-lg border border-[#242424] bg-black font-bold text-white hover:border-[#FF6F00]"
                            >
                              −
                            </button>

                            <span className="w-8 text-center font-bold text-white">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(
                                  {
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    image_url:
                                      item.image_url,
                                  }
                                )
                              }
                              className="h-8 w-8 rounded-lg bg-[#FF6F00] font-bold text-black hover:bg-[#FFD600]"
                            >
                              +
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  {/* TOTAL */}

                  <div className="mt-6 border-t border-[#242424] pt-5">

                    <div className="flex items-center justify-between">

                      <span className="font-bold text-white/60">
                        Items
                      </span>

                      <span className="font-bold text-white">
                        {cartCount}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-lg font-bold text-white">
                        Total
                      </span>

                      <span className="text-3xl font-extrabold text-[#FFD600]">
                        Rs.{" "}
                        {Number(
                          cartTotal
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={
                      placeOrder
                    }
                    disabled={
                      placingOrder ||
                      (orderType ===
                        "dine_in" &&
                        loadingTables)
                    }
                    className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-5 py-4 font-extrabold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,111,0,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {placingOrder
                      ? "Placing Order..."
                      : `Place Order • Rs. ${Number(
                          cartTotal
                        ).toLocaleString()}`}
                  </button>

                  <p className="mt-4 text-center text-xs text-white/40">
                    Your order will be sent
                    directly to the station.
                  </p>

                </>
              )}

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}