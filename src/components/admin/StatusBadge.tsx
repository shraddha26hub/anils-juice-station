export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "preparing"
      ? "bg-blue-100 text-blue-700"
      : status === "completed"
      ? "bg-green-100 text-green-700"
      : status === "cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}