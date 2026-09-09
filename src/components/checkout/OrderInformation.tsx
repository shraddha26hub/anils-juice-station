"use client";

type Branch = {
  id: number;
  name: string;
};

type RestaurantTable = {
  id: number;
  table_number: number;
  is_active: boolean;
};

type Props = {
  branches: Branch[];
  tables: RestaurantTable[];
  selectedBranch: string;
  selectedTable: string;
  orderType: "delivery" | "pickup" | "dine_in";
};

export default function OrderInformation({
  branches,
  tables,
  selectedBranch,
  selectedTable,
  orderType,
}: Props) {
  const branchName = branches.find(
    (branch) => String(branch.id) === selectedBranch
  )?.name;

  const tableNumber = tables.find(
    (table) => String(table.id) === selectedTable
  )?.table_number;

  return (
    <section className="rounded-3xl border border-orange-200 bg-orange-100 p-6">
      <p className="text-sm font-bold text-orange-700">
        📋 Order Information
      </p>

      <div className="mt-3 space-y-2 text-sm text-orange-900">
        <p>
          <strong>Location:</strong>{" "}
          {branchName || "Not selected"}
        </p>

        <p>
          <strong>Order:</strong>{" "}
          {orderType === "delivery"
            ? "Delivery"
            : orderType === "pickup"
            ? "Pickup"
            : "Dine-in"}
        </p>

        {orderType === "dine_in" && selectedTable && (
          <p>
            <strong>Table:</strong> {tableNumber}
          </p>
        )}
      </div>
    </section>
  );
}