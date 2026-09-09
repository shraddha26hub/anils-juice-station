"use client";

type RestaurantTable = {
  id: number;
  table_number: number;
  qr_code?: string | null;
  is_active: boolean;
  status: "active" | "reserved" | "inactive";
  created_at?: string;
  branch_id?: number;
};

type Props = {
  tables: RestaurantTable[];
  selectedTable: string;
  setSelectedTable: (value: string) => void;
  loadingTables: boolean;
};

export default function TableSelector({
  tables,
  selectedTable,
  setSelectedTable,
  loadingTables,
}: Props) {
  /*
   * IMPORTANT:
   *
   * `status` is the source of truth.
   *
   * Reserved and inactive tables are never shown.
   *
   * No table numbers are hard-coded.
   */

  const activeTables = tables
    .filter(
      (table) =>
        table.status === "active"
    )
    .sort(
      (a, b) =>
        a.table_number -
        b.table_number
    );

  return (
    <section className="rounded-3xl border border-[#242424] bg-black p-6 sm:p-7">
      {/* HEADER */}

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00FF7F]">
        Dine In
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-white">
        Select Your Table
      </h2>

      <p className="mt-2 text-sm text-white/50">
        Only currently available tables are shown.
      </p>

      {/* LOADING */}

      {loadingTables ? (
        <div className="mt-5 rounded-2xl border border-[#242424] bg-black p-8 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[#242424] border-t-[#FF6F00]" />

          <p className="mt-3 text-sm text-white/50">
            Checking available tables...
          </p>
        </div>
      ) : activeTables.length === 0 ? (
        /* NO TABLES */

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
        </div>
      ) : (
        /* TABLES */

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {activeTables.map((table) => {
            const selected =
              selectedTable ===
              String(table.id);

            return (
              <button
                key={table.id}
                type="button"
                onClick={() =>
                  setSelectedTable(
                    String(table.id)
                  )
                }
                className={`rounded-2xl border bg-black p-5 text-center transition ${
                  selected
                    ? "border-[#FF6F00] shadow-[0_0_20px_rgba(255,111,0,0.12)]"
                    : "border-[#00FF7F]/30 hover:border-[#00FF7F]"
                }`}
              >
                <div className="text-3xl">
                  🪑
                </div>

                <p className="mt-2 font-extrabold text-white">
                  Table {table.table_number}
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
          })}
        </div>
      )}

      {/* SELECTED TABLE */}

      {selectedTable && (
        <div className="mt-4 rounded-xl border border-[#FF6F00]/30 bg-black px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            Selected Table
          </p>

          <p className="mt-1 font-extrabold text-[#FF6F00]">
            Table{" "}
            {
              activeTables.find(
                (table) =>
                  table.id ===
                  Number(selectedTable)
              )?.table_number
            }
          </p>
        </div>
      )}
    </section>
  );
}