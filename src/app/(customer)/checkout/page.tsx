"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

import CustomerInformation from "@/components/checkout/CustomerInformation";
import OrderTypeSelector from "@/components/checkout/OrderTypeSelector";
import TableSelector from "@/components/checkout/TableSelector";
import DeliveryAddress from "@/components/checkout/DeliveryAddress";
import AdditionalNotes from "@/components/checkout/AdditionalNotes";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderInformation from "@/components/checkout/OrderInformation";

type Branch = {
  id: number;
  name: string;
};

type TableStatus =
  | "active"
  | "reserved"
  | "inactive";

type RestaurantTable = {
  id: number;
  table_number: number;
  is_active: boolean;
  status: TableStatus;
  branch_id: number;
};

type OrderType =
  | "delivery"
  | "pickup"
  | "dine_in";

const KATHMANDU_BRANCH_ID = 2;

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    cartTotal,
    clearCart,
  } = useCart();

  // =========================================================
  // STATE
  // =========================================================

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [tables, setTables] =
    useState<RestaurantTable[]>([]);

  const [selectedTable, setSelectedTable] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [orderType, setOrderType] =
    useState<OrderType>("delivery");

  const [loadingBranches, setLoadingBranches] =
    useState(true);

  const [loadingTables, setLoadingTables] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // QR TABLE STATE
  // =========================================================

  const [qrTableNumber, setQrTableNumber] =
    useState<number | null>(null);

  const [qrTableId, setQrTableId] =
    useState<number | null>(null);

  const [isQrOrder, setIsQrOrder] =
    useState(false);

  // =========================================================
  // LOAD KATHMANDU BRANCH
  // =========================================================

  useEffect(() => {
    async function loadKathmanduBranch() {
      setLoadingBranches(true);
      setError("");

      try {
        const {
          data,
          error: branchError,
        } = await supabase
          .from("branches")
          .select("id, name")
          .eq(
            "id",
            KATHMANDU_BRANCH_ID
          )
          .eq(
            "is_active",
            true
          )
          .order("id");

        if (branchError) {
          console.error(
            "BRANCH LOAD ERROR:",
            branchError
          );

          throw new Error(
            branchError.message
          );
        }

        console.log(
          "KATHMANDU BRANCH:",
          data
        );

        setBranches(data ?? []);

      } catch (error) {
        console.error(
          "BRANCH LOAD ERROR:",
          error
        );

        setBranches([]);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load Kathmandu location."
        );

      } finally {
        setLoadingBranches(false);
      }
    }

    loadKathmanduBranch();
  }, []);

  // =========================================================
  // READ QR TABLE
  // =========================================================

  useEffect(() => {
    const storedTableId =
      localStorage.getItem(
        "qr_table_id"
      );

    const storedTableNumber =
      localStorage.getItem(
        "qr_table_number"
      );

    const storedOrderType =
      localStorage.getItem(
        "qr_order_type"
      );

    if (
      storedTableId &&
      storedTableNumber &&
      storedOrderType === "dine_in"
    ) {
      const parsedTableId =
        Number(storedTableId);

      const parsedTableNumber =
        Number(storedTableNumber);

      if (
        Number.isInteger(
          parsedTableId
        ) &&
        Number.isInteger(
          parsedTableNumber
        )
      ) {
        console.log(
          "QR TABLE FROM STORAGE:",
          {
            tableId:
              parsedTableId,

            tableNumber:
              parsedTableNumber,
          }
        );

        setQrTableId(
          parsedTableId
        );

        setQrTableNumber(
          parsedTableNumber
        );

        setIsQrOrder(true);

        setOrderType(
          "dine_in"
        );

        setSelectedTable(
          String(parsedTableId)
        );
      }
    }
  }, []);

  // =========================================================
  // LOAD ACTIVE TABLES
  // =========================================================

  useEffect(() => {
    async function loadTables() {
      /*
       * Tables are only required
       * for dine-in orders.
       */

      if (
        orderType !== "dine_in"
      ) {
        setTables([]);

        setSelectedTable(
          isQrOrder
            ? selectedTable
            : ""
        );

        return;
      }

      setLoadingTables(true);
      setError("");

      try {
        console.log(
          "================================"
        );

        console.log(
          "LOADING ACTIVE TABLES"
        );

        console.log(
          "Branch ID:",
          KATHMANDU_BRANCH_ID
        );

        console.log(
          "================================"
        );

        const {
          data,
          error: tableError,
        } = await supabase
          .from("tables")
          .select(
            "id, table_number, is_active, status, branch_id"
          )
          .eq(
            "branch_id",
            KATHMANDU_BRANCH_ID
          )
          .eq(
            "status",
            "active"
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

        if (tableError) {
          console.error(
            "TABLE LOAD ERROR:",
            tableError
          );

          throw new Error(
            tableError.message
          );
        }

        console.log(
          "ACTIVE TABLES FROM SUPABASE:",
          data
        );

        const activeTables =
          ((data ?? []) as RestaurantTable[])
            .filter(
              (table) =>
                table.status ===
                  "active" &&
                table.is_active ===
                  true
            )
            .sort(
              (a, b) =>
                a.table_number -
                b.table_number
            );

        console.log(
          "TABLES SHOWN TO CUSTOMER:",
          activeTables
        );

        setTables(
          activeTables
        );

        // -----------------------------------------------------
        // VERIFY QR TABLE
        // -----------------------------------------------------

        if (
          isQrOrder &&
          qrTableId !== null
        ) {
          const qrTable =
            activeTables.find(
              (table) =>
                table.id ===
                qrTableId
            );

          if (!qrTable) {
            setError(
              `Table ${
                qrTableNumber ?? ""
              } is no longer available. Please scan an active table QR code.`
            );

            setSelectedTable("");

            setQrTableId(null);

            setQrTableNumber(null);

            setIsQrOrder(false);

            localStorage.removeItem(
              "qr_table_id"
            );

            localStorage.removeItem(
              "qr_table_number"
            );

            localStorage.removeItem(
              "qr_order_type"
            );

          } else {
            setSelectedTable(
              String(qrTable.id)
            );
          }
        }

      } catch (error) {
        console.error(
          "LOAD TABLES ERROR:",
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
      }
    }

    loadTables();

  }, [
    orderType,
    isQrOrder,
    qrTableId,
    qrTableNumber,
  ]);

  // =========================================================
  // ORDER TYPE CHANGE
  // =========================================================

  function handleOrderTypeChange(
    type: OrderType
  ) {
    /*
     * QR orders must remain dine-in.
     */

    if (
      isQrOrder &&
      type !== "dine_in"
    ) {
      setError(
        "This order started from a table QR code, so it must be a dine-in order."
      );

      return;
    }

    setError("");

    setOrderType(type);

    /*
     * Remove selected table
     * when leaving dine-in.
     */

    if (
      type !== "dine_in" &&
      !isQrOrder
    ) {
      setSelectedTable("");
    }

    /*
     * Remove address when
     * leaving delivery.
     */

    if (
      type !== "delivery"
    ) {
      setAddress("");
    }

    /*
     * Phone is not required for
     * dine-in orders.
     *
     * We don't clear it here so
     * switching back to pickup/delivery
     * won't make the user type it again.
     */
  }

  // =========================================================
  // PLACE ORDER
  // =========================================================

  async function handlePlaceOrder() {
    setError("");

    // -------------------------------------------------------
    // CUSTOMER NAME
    // -------------------------------------------------------

    if (!customerName.trim()) {
      setError(
        "Please enter your name."
      );

      return;
    }

    // -------------------------------------------------------
    // PHONE
    // -------------------------------------------------------

    /*
     * Dine-in orders do NOT require
     * a phone number.
     *
     * Pickup and delivery DO require
     * a valid Nepal mobile number.
     *
     * Valid prefixes:
     * 97XXXXXXXX
     * 98XXXXXXXX
     */

    let cleanPhone = "";

    if (
      orderType !== "dine_in"
    ) {
      cleanPhone =
        phone.trim();

      if (!cleanPhone) {
        setError(
          "Please enter your phone number."
        );

        return;
      }

      if (
        !/^(97|98)\d{8}$/.test(
          cleanPhone
        )
      ) {
        setError(
          "Please enter a valid 10-digit Nepal mobile number starting with 97 or 98."
        );

        return;
      }
    }

    // -------------------------------------------------------
    // BRANCH
    // -------------------------------------------------------

    const kathmanduBranch =
      branches.find(
        (branch) =>
          branch.id ===
          KATHMANDU_BRANCH_ID
      );

    if (!kathmanduBranch) {
      setError(
        "Kathmandu location is currently unavailable."
      );

      return;
    }

    // -------------------------------------------------------
    // DELIVERY ADDRESS
    // -------------------------------------------------------

    if (
      orderType === "delivery" &&
      !address.trim()
    ) {
      setError(
        "Please enter your delivery address."
      );

      return;
    }

    // -------------------------------------------------------
    // DINE-IN TABLE
    // -------------------------------------------------------

    if (
      orderType === "dine_in" &&
      !selectedTable
    ) {
      setError(
        "Please select your table number."
      );

      return;
    }

    // -------------------------------------------------------
    // VERIFY SELECTED TABLE
    // -------------------------------------------------------

    if (
      orderType === "dine_in" &&
      selectedTable
    ) {
      const selectedTableData =
        tables.find(
          (table) =>
            table.id ===
            Number(
              selectedTable
            )
        );

      if (!selectedTableData) {
        setError(
          "The selected table is no longer available."
        );

        return;
      }

      if (
        selectedTableData.status !==
        "active"
      ) {
        setError(
          "The selected table is no longer active. Please choose another table."
        );

        return;
      }

      if (
        selectedTableData.is_active !==
        true
      ) {
        setError(
          "The selected table is inactive. Please choose another table."
        );

        return;
      }

      if (
        selectedTableData.branch_id !==
        KATHMANDU_BRANCH_ID
      ) {
        setError(
          "The selected table does not belong to this branch."
        );

        return;
      }

      // -----------------------------------------------------
      // QR TABLE MATCH
      // -----------------------------------------------------

      if (
        isQrOrder &&
        qrTableId !== null &&
        Number(
          selectedTable
        ) !== qrTableId
      ) {
        setError(
          "The selected table does not match the scanned QR code."
        );

        return;
      }
    }

    // -------------------------------------------------------
    // CART
    // -------------------------------------------------------

    if (
      cart.length === 0
    ) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    setPlacingOrder(true);

    try {
      // =====================================================
      // ENSURE CUSTOMER AUTHENTICATION
      // =====================================================

      const {
        data: {
          session,
        },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "AUTH SESSION ERROR:",
          sessionError
        );

        throw new Error(
          "Unable to start your customer session."
        );
      }

      // -----------------------------------------------------
      // CREATE ANONYMOUS SESSION IF NEEDED
      // -----------------------------------------------------

      if (!session) {
        console.log(
          "No customer session found. Creating anonymous session..."
        );

        const {
          data: anonymousData,
          error: anonymousError,
        } =
          await supabase.auth.signInAnonymously();

        if (anonymousError) {
          console.error(
            "ANONYMOUS SIGN-IN ERROR:",
            anonymousError
          );

          throw new Error(
            "Unable to start your customer session. Please try again."
          );
        }

        if (
          !anonymousData.session
        ) {
          throw new Error(
            "Customer session could not be created."
          );
        }

        console.log(
          "ANONYMOUS CUSTOMER SESSION CREATED"
        );

      } else {
        console.log(
          "EXISTING CUSTOMER SESSION FOUND"
        );
      }

      // =====================================================
      // PREPARE ORDER ITEMS
      // =====================================================

      const orderItems =
        cart.map(
          (item) => ({
            product_id:
              item.id,

            quantity:
              item.quantity,
          })
        );

      console.log(
        "ORDER ITEMS:",
        orderItems
      );

      // =====================================================
      // FINAL TABLE ID
      // =====================================================

      const finalTableId =
        orderType === "dine_in"
          ? Number(
              selectedTable
            )
          : null;

      console.log(
        "FINAL ORDER TABLE ID:",
        finalTableId
      );

      console.log(
        "QR TABLE ID:",
        qrTableId
      );

      console.log(
        "QR TABLE NUMBER:",
        qrTableNumber
      );

      // =====================================================
      // FINAL PHONE VALUE
      // =====================================================

      /*
       * Dine-in:
       * null
       *
       * Pickup / Delivery:
       * valid 97XXXXXXXX or 98XXXXXXXX
       */

      const finalPhone =
        orderType === "dine_in"
          ? null
          : cleanPhone;

      console.log(
        "FINAL ORDER PHONE:",
        finalPhone
      );

      // =====================================================
      // CREATE CUSTOMER ORDER
      // =====================================================

      const {
        data: orderId,
        error: orderError,
      } = await supabase.rpc(
        "create_customer_order",
        {
          p_branch_id:
            KATHMANDU_BRANCH_ID,

          p_customer_name:
            customerName.trim(),

          p_phone:
            finalPhone,

          p_order_type:
            orderType,

          p_table_id:
            finalTableId,

          p_address:
            orderType ===
            "delivery"
              ? address.trim()
              : null,

          p_notes:
            notes.trim() ||
            null,

          p_items:
            orderItems,
        }
      );

      // =====================================================
      // RPC ERROR
      // =====================================================

      if (orderError) {
        console.error(
          "SUPABASE ORDER ERROR:",
          orderError
        );

        throw new Error(
          orderError.message
        );
      }

      // =====================================================
      // CHECK ORDER ID
      // =====================================================

      if (!orderId) {
        throw new Error(
          "Order was not created."
        );
      }

      console.log(
        "ORDER CREATED:",
        orderId
      );

      // =====================================================
      // CLEAR QR TABLE STORAGE
      // =====================================================

      localStorage.removeItem(
        "qr_table_id"
      );

      localStorage.removeItem(
        "qr_table_number"
      );

      localStorage.removeItem(
        "qr_order_type"
      );

      // =====================================================
      // CLEAR CART
      // =====================================================

      clearCart();

      // =====================================================
      // GO TO ORDER PAGE
      // =====================================================

      router.push(
        `/order/${orderId}`
      );

    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order."
      );

    } finally {
      setPlacingOrder(false);
    }
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    cart.length === 0
  ) {
    return (
      <main className="min-h-screen bg-orange-50 px-6 py-20">

        <div className="mx-auto max-w-2xl text-center">

          <div className="text-7xl">
            🛒
          </div>

          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
            Your Cart is Empty
          </h1>

          <p className="mt-4 text-gray-600">
            Please add some items before going
            to checkout.
          </p>

          <Link
            href="/menu"
            className="mt-8 inline-block rounded-full bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Go to Menu
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // CHECKOUT PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-12">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
            Almost There
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Checkout
          </h1>

          <p className="mt-4 text-gray-600">
            Your order will be prepared at our
            Kathmandu location.
          </p>

        </div>

        {/* =================================================
            QR TABLE NOTICE
        ================================================= */}

        {isQrOrder &&
          qrTableNumber !== null && (

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-green-200 bg-green-50 p-5">

            <div className="flex items-center justify-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                🪑
              </div>

              <div className="text-left">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                  QR Table Order
                </p>

                <p className="mt-1 text-xl font-extrabold text-gray-900">
                  Table {qrTableNumber}
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Your table was detected automatically.
                </p>

              </div>

              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                Dine-in
              </span>

            </div>

          </div>
        )}

        {/* =================================================
            KATHMANDU NOTICE
        ================================================= */}

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-orange-200 bg-orange-100 p-4 text-center">

          <p className="text-sm font-semibold text-orange-800">

            📍 Ordering from{" "}

            <span className="font-extrabold">

              {loadingBranches
                ? "Kathmandu..."
                : branches[0]?.name ??
                  "Kathmandu"}

            </span>

          </p>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            <CustomerInformation
              customerName={
                customerName
              }

              setCustomerName={
                setCustomerName
              }

              phone={
                phone
              }

              setPhone={
                setPhone
              }

              orderType={
                orderType
              }
            />

            <OrderTypeSelector
              orderType={
                orderType
              }

              onChange={
                handleOrderTypeChange
              }
            />

            {/* =================================================
                DINE-IN TABLE SELECTOR
            ================================================= */}

            {orderType ===
              "dine_in" && (

              <TableSelector
                tables={
                  tables
                }

                selectedTable={
                  selectedTable
                }

                setSelectedTable={
                  isQrOrder
                    ? () => {}
                    : setSelectedTable
                }

                loadingTables={
                  loadingTables
                }
              />

            )}

            {/* =================================================
                DELIVERY
            ================================================= */}

            {orderType ===
              "delivery" && (

              <DeliveryAddress
                address={
                  address
                }

                setAddress={
                  setAddress
                }
              />

            )}

            {/* =================================================
                NOTES
            ================================================= */}

            <AdditionalNotes
              notes={
                notes
              }

              setNotes={
                setNotes
              }
            />

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="h-fit space-y-6">

            <OrderSummary
              cart={
                cart
              }

              cartTotal={
                cartTotal
              }
            />

            <OrderInformation
              branches={
                branches
              }

              tables={
                tables
              }

              selectedBranch={String(
                KATHMANDU_BRANCH_ID
              )}

              selectedTable={
                selectedTable
              }

              orderType={
                orderType
              }
            />

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">

                {error}

              </div>

            )}

            {/* =================================================
                PLACE ORDER
            ================================================= */}

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }

              disabled={
                placingOrder ||
                loadingBranches ||
                loadingTables
              }

              className="w-full rounded-full bg-orange-500 px-6 py-4 font-bold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {placingOrder
                ? "Placing Order..."
                : "Confirm & Place Order"}

            </button>

            {/* =================================================
                BACK TO MENU
            ================================================= */}

            <Link
              href="/menu"
              className="block text-center text-sm font-semibold text-gray-500 hover:text-orange-600"
            >
              ← Back to Menu
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}