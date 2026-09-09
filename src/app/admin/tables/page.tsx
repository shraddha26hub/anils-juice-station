"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

type TableStatus = "active" | "reserved" | "inactive";

type RestaurantTable = {
  id: number;
  table_number: number;
  is_active: boolean;
  status: TableStatus;
  branch_id: number;
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  const [branchName, setBranchName] = useState("");
  const [branchId, setBranchId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [editTable, setEditTable] =
    useState<RestaurantTable | null>(null);

  // =========================================================
  // QR TABLE
  // =========================================================

  const [qrTable, setQrTable] =
    useState<RestaurantTable | null>(null);

  const [tableNumber, setTableNumber] = useState("");

  const [tableStatus, setTableStatus] =
    useState<TableStatus>("active");

  // =========================================================
  // LOAD PAGE
  // =========================================================

  useEffect(() => {
    loadTables();
  }, []);

  // =========================================================
  // LOAD TABLES
  // =========================================================

  async function loadTables(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      // -------------------------------------------------------
      // GET CURRENT USER
      // -------------------------------------------------------

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

      // -------------------------------------------------------
      // GET ADMIN BRANCH
      // -------------------------------------------------------

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("branch_id")
        .eq("user_id", user.id)
        .single();

      if (adminError) {
        throw new Error(adminError.message);
      }

      if (!admin) {
        throw new Error(
          "You are not registered as an admin."
        );
      }

      setBranchId(admin.branch_id);

      // -------------------------------------------------------
      // GET BRANCH NAME
      // -------------------------------------------------------

      const {
        data: branch,
        error: branchError,
      } = await supabase
        .from("branches")
        .select("name")
        .eq("id", admin.branch_id)
        .single();

      if (branchError) {
        throw new Error(branchError.message);
      }

      if (branch) {
        setBranchName(branch.name);
      }

      // -------------------------------------------------------
      // GET TABLES
      // -------------------------------------------------------

      const {
        data: tableData,
        error: tableError,
      } = await supabase
        .from("tables")
        .select(
          "id, table_number, is_active, status, branch_id"
        )
        .eq("branch_id", admin.branch_id)
        .order("table_number", {
          ascending: true,
        });

      if (tableError) {
        throw new Error(tableError.message);
      }

      const formattedTables: RestaurantTable[] =
        ((tableData || []) as RestaurantTable[]).map(
          (table) => {
            /*
             * Safety fallback for old rows where status
             * may not have been properly set.
             */

            let status: TableStatus;

            if (
              table.status === "active" ||
              table.status === "reserved" ||
              table.status === "inactive"
            ) {
              status = table.status;
            } else {
              status = table.is_active
                ? "active"
                : "inactive";
            }

            return {
              ...table,
              status,
            };
          }
        );

      setTables(formattedTables);
    } catch (error) {
      console.error(
        "LOAD TABLES ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load tables."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =========================================================
  // GET STATUS
  // =========================================================

  function getTableStatus(
    table: RestaurantTable
  ): TableStatus {
    return table.status;
  }

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  function openEditTable(
    table: RestaurantTable
  ) {
    setEditTable(table);

    setTableNumber(
      String(table.table_number)
    );

    setTableStatus(table.status);

    setError("");
  }

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  function closeEditTable() {
    if (saving) {
      return;
    }

    setEditTable(null);

    setTableNumber("");

    setTableStatus("active");

    setError("");
  }

  // =========================================================
  // OPEN QR MODAL
  // =========================================================

  function openQrModal(
    table: RestaurantTable
  ) {
    setQrTable(table);
    setError("");
  }

  // =========================================================
  // CLOSE QR MODAL
  // =========================================================

  function closeQrModal() {
    setQrTable(null);
  }

  // =========================================================
  // GET QR URL
  // =========================================================

  function getQrUrl(
    table: RestaurantTable
  ) {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/menu?table=${table.table_number}`;
  }

  // =========================================================
  // SAVE TABLE
  // =========================================================

  async function handleSaveTable() {
    if (!editTable) {
      return;
    }

    setError("");

    // -------------------------------------------------------
    // VALIDATE TABLE NUMBER
    // -------------------------------------------------------

    const newTableNumber = Number(tableNumber);

    if (
      !tableNumber.trim() ||
      !Number.isInteger(newTableNumber) ||
      newTableNumber <= 0
    ) {
      setError(
        "Please enter a valid table number."
      );

      return;
    }

    // -------------------------------------------------------
    // VALIDATE STATUS
    // -------------------------------------------------------

    if (
      tableStatus !== "active" &&
      tableStatus !== "reserved" &&
      tableStatus !== "inactive"
    ) {
      setError(
        "Please select a valid table status."
      );

      return;
    }

    // -------------------------------------------------------
    // CHECK DUPLICATE
    // -------------------------------------------------------

    const duplicateTable = tables.find(
      (table) =>
        table.id !== editTable.id &&
        table.table_number === newTableNumber
    );

    if (duplicateTable) {
      setError(
        "This table number already exists."
      );

      return;
    }

    setSaving(true);

    try {
      console.log("==============================");
      console.log("UPDATING TABLE");
      console.log(
        "Table ID:",
        editTable.id
      );
      console.log(
        "Table Number:",
        newTableNumber
      );
      console.log(
        "Status:",
        tableStatus
      );
      console.log("==============================");

      // -------------------------------------------------------
      // KEEP is_active COMPATIBLE WITH status
      // -------------------------------------------------------

      const newIsActive =
        tableStatus !== "inactive";

      // =====================================================
      // UPDATE TABLE
      // =====================================================

      const {
        error: updateError,
      } = await supabase
        .from("tables")
        .update({
          table_number: newTableNumber,
          status: tableStatus,
          is_active: newIsActive,
        })
        .eq("id", editTable.id);

      if (updateError) {
        console.error(
          "SUPABASE UPDATE ERROR:",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      // =====================================================
      // FETCH UPDATED ROW
      // =====================================================

      const {
        data: updatedTable,
        error: fetchError,
      } = await supabase
        .from("tables")
        .select(
          "id, table_number, is_active, status, branch_id"
        )
        .eq("id", editTable.id)
        .single();

      if (fetchError) {
        console.error(
          "FETCH UPDATED TABLE ERROR:",
          fetchError
        );

        throw new Error(
          fetchError.message
        );
      }

      if (!updatedTable) {
        throw new Error(
          "The table could not be found after updating."
        );
      }

      console.log(
        "UPDATED TABLE:",
        updatedTable
      );

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================

      setTables((currentTables) =>
        currentTables
          .map((table) =>
            table.id === updatedTable.id
              ? (updatedTable as RestaurantTable)
              : table
          )
          .sort(
            (a, b) =>
              a.table_number -
              b.table_number
          )
      );

      // =====================================================
      // CLOSE MODAL
      // =====================================================

      setEditTable(null);

      setTableNumber("");

      setTableStatus("active");

      setError("");

      // =====================================================
      // REFRESH
      // =====================================================

      await loadTables(false);
    } catch (error) {
      console.error(
        "SAVE TABLE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update table."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#242424] border-t-[#FF6F00]" />

          <p className="mt-4 font-semibold text-white">
            Loading tables...
          </p>

        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            BACK
        =================================================== */}

        <Link
          href="/admin"
          className="text-sm font-bold text-[#FF6F00] transition hover:text-[#FFD600]"
        >
          ← Back to Dashboard
        </Link>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mt-6">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
            Table Management
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                Restaurant Tables
              </h1>

              <p className="mt-2 text-white/50">
                Manage tables for{" "}
                <span className="font-bold text-white">
                  {branchName}
                </span>
              </p>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadTables(false)}
              disabled={refreshing}
              className="rounded-xl border border-[#242424] bg-black px-5 py-3 text-sm font-bold text-white transition hover:border-[#FF6F00] hover:text-[#FF6F00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && !editTable && !qrTable && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-black p-4 font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* ===================================================
            TABLE SECTION
        =================================================== */}

        <section className="mt-8 rounded-3xl border border-[#242424] bg-black p-5 sm:p-7">

          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-2xl font-extrabold text-white">
                Your Tables
              </h2>

              <p className="mt-1 text-sm text-white/50">
                {tables.length}{" "}
                {tables.length === 1
                  ? "table"
                  : "tables"}{" "}
                in this branch
              </p>

            </div>

            {/* =================================================
                LEGEND
            ================================================= */}

            <div className="flex flex-wrap gap-4 text-xs font-bold">

              <div className="flex items-center gap-2 text-[#00FF7F]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00FF7F]" />
                Active
              </div>

              <div className="flex items-center gap-2 text-[#FFD600]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFD600]" />
                Reserved
              </div>

              <div className="flex items-center gap-2 text-red-500">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Inactive
              </div>

            </div>

          </div>

          {/* ===================================================
              NO TABLES
          =================================================== */}

          {tables.length === 0 ? (
            <div className="rounded-2xl border border-[#242424] bg-black py-20 text-center">

              <div className="text-6xl">
                🪑
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                No tables found
              </h3>

              <p className="mt-2 text-sm text-white/50">
                No tables have been added to this branch yet.
              </p>

            </div>
          ) : (

            /* =================================================
               TABLE GRID
            ================================================= */

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

              {tables.map((table) => {

                const status =
                  getTableStatus(table);

                return (
                  <div
                    key={table.id}
                    className={`rounded-2xl border bg-black p-6 text-center transition ${
                      status === "inactive"
                        ? "border-red-500/30"
                        : status === "reserved"
                        ? "border-[#FFD600]/30"
                        : "border-[#00FF7F]/30"
                    }`}
                  >

                    {/* ICON */}

                    <div
                      className={`text-5xl ${
                        status === "inactive"
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      🪑
                    </div>

                    {/* TABLE NUMBER */}

                    <h2 className="mt-4 text-xl font-extrabold text-white">
                      Table {table.table_number}
                    </h2>

                    {/* STATUS */}

                    <div className="mt-3">

                      {status === "inactive" && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-black px-3 py-1 text-xs font-bold text-red-500">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}

                      {status === "reserved" && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD600]/20 bg-black px-3 py-1 text-xs font-bold text-[#FFD600]">
                          <span className="h-2 w-2 rounded-full bg-[#FFD600]" />
                          Reserved
                        </span>
                      )}

                      {status === "active" && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#00FF7F]/20 bg-black px-3 py-1 text-xs font-bold text-[#00FF7F]">
                          <span className="h-2 w-2 rounded-full bg-[#00FF7F]" />
                          Active
                        </span>
                      )}

                    </div>

                    {/* DESCRIPTION */}

                    <p className="mt-3 min-h-[32px] text-xs text-white/40">

                      {status === "inactive" &&
                        "Not available for customers."}

                      {status === "reserved" &&
                        "Reserved for a customer."}

                      {status === "active" &&
                        "Available for a new customer."}

                    </p>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        openEditTable(table)
                      }
                      className="mt-5 w-full rounded-xl border border-[#242424] bg-black py-2.5 font-bold text-white transition hover:border-[#FF6F00] hover:text-[#FF6F00]"
                    >
                      ✏️ Edit Table
                    </button>

                    {/* QR CODE */}

                    <button
                      type="button"
                      onClick={() =>
                        openQrModal(table)
                      }
                      disabled={status !== "active"}
                      className="mt-3 w-full rounded-xl border border-[#242424] bg-black py-2.5 font-bold text-white transition hover:border-[#00FF7F] hover:text-[#00FF7F] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      📱 View QR Code
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">

          <div className="w-full max-w-md rounded-3xl border border-[#242424] bg-black p-7 shadow-2xl">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF6F00]">
                  Edit Table
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-white">
                  Table {editTable.table_number}
                </h2>

                <div className="mt-3">

                  {tableStatus === "inactive" && (
                    <span className="text-xs font-bold text-red-500">
                      🔴 Currently Inactive
                    </span>
                  )}

                  {tableStatus === "reserved" && (
                    <span className="text-xs font-bold text-[#FFD600]">
                      🟡 Currently Reserved
                    </span>
                  )}

                  {tableStatus === "active" && (
                    <span className="text-xs font-bold text-[#00FF7F]">
                      🟢 Currently Active
                    </span>
                  )}

                </div>

              </div>

              <button
                type="button"
                onClick={closeEditTable}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-black text-white transition hover:border-red-500 hover:text-red-500 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* =================================================
                TABLE NUMBER
            ================================================= */}

            <div className="mt-7">

              <label className="text-sm font-bold text-white">
                Table Number
              </label>

              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) =>
                  setTableNumber(e.target.value)
                }
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-[#242424] bg-black px-4 py-3 text-white outline-none transition focus:border-[#FF6F00]"
              />

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="mt-6">

              <label className="text-sm font-bold text-white">
                Table Status
              </label>

              <select
                value={tableStatus}
                onChange={(e) =>
                  setTableStatus(
                    e.target.value as TableStatus
                  )
                }
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-[#242424] bg-black px-4 py-3 text-white outline-none transition focus:border-[#FF6F00]"
              >

                <option
                  value="active"
                  className="bg-black text-white"
                >
                  🟢 Active
                </option>

                <option
                  value="reserved"
                  className="bg-black text-white"
                >
                  🟡 Reserved
                </option>

                <option
                  value="inactive"
                  className="bg-black text-white"
                >
                  🔴 Inactive
                </option>

              </select>

              <p className="mt-2 text-xs leading-5 text-white/40">
                Active tables are available for customers.
                Reserved tables are held for a customer.
                Inactive tables cannot be selected.
              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-black p-4 text-sm font-semibold text-red-400">
                {error}
              </div>
            )}

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={closeEditTable}
                disabled={saving}
                className="flex-1 rounded-xl border border-[#242424] bg-black py-3 font-bold text-white transition hover:border-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTable}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#FF6F00] py-3 font-bold text-black transition hover:bg-[#FFD600] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          QR CODE MODAL
      ===================================================== */}

      {qrTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">

          <div className="w-full max-w-md rounded-3xl border border-[#242424] bg-black p-7 text-center shadow-2xl">

            {/* HEADER */}

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
              Table QR Code
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Table {qrTable.table_number}
            </h2>

            <p className="mt-2 text-sm text-white/50">
              Customers can scan this QR code to open the menu.
            </p>

            {/* QR CODE */}

            <div className="mx-auto mt-7 flex w-fit rounded-2xl bg-white p-5">
              <QRCodeSVG
                value={getQrUrl(qrTable)}
                size={240}
                level="H"
              />
            </div>

            {/* URL */}

            <p className="mt-5 break-all rounded-xl border border-[#242424] bg-black px-4 py-3 text-xs text-white/50">
              {getQrUrl(qrTable)}
            </p>

            {/* STATUS */}

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#00FF7F]/20 bg-black px-4 py-2 text-xs font-bold text-[#00FF7F]">
              <span className="h-2 w-2 rounded-full bg-[#00FF7F]" />
              Active Table
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeQrModal}
              className="mt-6 w-full rounded-xl border border-[#242424] bg-black py-3 font-bold text-white transition hover:border-white"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </main>
  );
}