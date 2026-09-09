import StatusBadge from "@/components/admin/StatusBadge";

export type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  total_amt: number;
  order_type: string;
  status: string;
  table_id: number | null;
  created_at: string;
};

type OrderCardProps = {
  order: Order;
  updating: boolean;
  onStatusChange: (
    orderId: number,
    status: string
  ) => void;
};

export default function OrderCard({
  order,
  updating,
  onStatusChange,
}: OrderCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5 transition hover:border-orange-200 hover:shadow-sm">

      {/* TOP */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <span className="text-xl font-extrabold text-orange-600">
              Order #{order.id}
            </span>

            <StatusBadge
              status={order.status}
            />

          </div>

          <p className="mt-2 text-sm text-gray-500">
            {new Date(
              order.created_at
            ).toLocaleString("en-NP", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

        </div>

        {/* STATUS */}

        <select
          value={order.status}
          disabled={updating}
          onChange={(e) =>
            onStatusChange(
              order.id,
              e.target.value
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 disabled:opacity-50"
        >
          <option value="pending">
            Pending
          </option>

          <option value="preparing">
            Preparing
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {/* DETAILS */}

      <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Customer
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {order.customer_name}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Phone
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {order.phone}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Order Type
          </p>

          <p className="mt-1 font-semibold capitalize text-gray-900">
            {order.order_type.replace(
              "_",
              " "
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Total
          </p>

          <p className="mt-1 font-extrabold text-orange-600">
            Rs. {order.total_amt}
          </p>
        </div>

      </div>

      {/* TABLE */}

      {order.table_id && (
        <div className="mt-4 rounded-xl bg-lime-50 p-4">

          <p className="text-xs font-bold uppercase tracking-wider text-lime-600">
            Table
          </p>

          <p className="mt-1 font-semibold text-gray-800">
            Table ID: {order.table_id}
          </p>

        </div>
      )}

      {/* ADDRESS */}

      {order.address && (
        <div className="mt-4 rounded-xl bg-orange-50 p-4">

          <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Delivery Address
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {order.address}
          </p>

        </div>
      )}

      {/* NOTES */}

      {order.notes && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Customer Notes
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {order.notes}
          </p>

        </div>
      )}

    </div>
  );
}