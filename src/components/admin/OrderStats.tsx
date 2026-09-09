type Order = {
  status: string;
};

export default function OrderStats({
  orders,
}: {
  orders: Order[];
}) {
  const pending = orders.filter(
    (order) =>
      order.status === "pending"
  ).length;

  const preparing = orders.filter(
    (order) =>
      order.status === "preparing"
  ).length;

  const completed = orders.filter(
    (order) =>
      order.status === "completed"
  ).length;

  const stats = [
    {
      title: "All Orders",
      value: orders.length,
      icon: "📦",
    },
    {
      title: "Pending",
      value: pending,
      icon: "⏳",
    },
    {
      title: "Preparing",
      value: preparing,
      icon: "👨‍🍳",
    },
    {
      title: "Completed",
      value: completed,
      icon: "✅",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-3xl bg-white p-5 shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-500">
                {stat.title}
              </p>

              <p className="mt-1 text-3xl font-extrabold text-gray-900">
                {stat.value}
              </p>

            </div>

            <div className="text-3xl">
              {stat.icon}
            </div>

          </div>

        </div>
      ))}

    </div>
  );
}