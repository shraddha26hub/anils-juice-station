"use client";

type OrderType = "delivery" | "pickup" | "dine_in";

type Props = {
  orderType: OrderType;
  onChange: (type: OrderType) => void;
};

export default function OrderTypeSelector({
  orderType,
  onChange,
}: Props) {
  const options = [
    {
      type: "delivery" as const,
      icon: "🛵",
      title: "Delivery",
      description: "We deliver your order to your address.",
    },
    {
      type: "pickup" as const,
      icon: "🏪",
      title: "Pickup",
      description: "Pick up your order from the selected branch.",
    },
    {
      type: "dine_in" as const,
      icon: "🍽️",
      title: "Dine-in",
      description: "Enjoy your food at our restaurant.",
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-extrabold text-gray-900">
        How would you like your order?
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={`rounded-2xl border p-5 text-left transition ${
              orderType === option.type
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-300"
            }`}
          >
            <div className="text-3xl">
              {option.icon}
            </div>

            <h3 className="mt-3 font-extrabold text-gray-900">
              {option.title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {option.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}