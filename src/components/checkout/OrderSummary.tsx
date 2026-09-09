"use client";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type Props = {
  cart: CartItem[];
  cartTotal: number;
};

export default function OrderSummary({
  cart,
  cartTotal,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-extrabold text-gray-900">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold text-gray-900">
                {item.name}
              </p>

              <p className="text-sm text-gray-500">
                {item.quantity} × Rs. {item.price}
              </p>
            </div>

            <p className="font-bold text-gray-900">
              Rs. {item.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      <div className="my-6 border-t border-gray-100" />

      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>Rs. {cartTotal}</span>
      </div>

      <div className="mt-4 flex justify-between">
        <span className="text-lg font-extrabold text-gray-900">
          Total
        </span>

        <span className="text-2xl font-extrabold text-orange-600">
          Rs. {cartTotal}
        </span>
      </div>
    </section>
  );
}