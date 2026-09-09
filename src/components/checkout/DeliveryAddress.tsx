"use client";

type Props = {
  address: string;
  setAddress: (value: string) => void;
};

export default function DeliveryAddress({
  address,
  setAddress,
}: Props) {
  return (
    <section className="rounded-3xl border border-[#242424] bg-[#111111] p-7 shadow-sm">
      <h2 className="text-xl font-extrabold text-white">
        Delivery Address
      </h2>

      <p className="mt-1 text-sm text-[#BDBDBD]">
        Enter the address where you want your order delivered.
      </p>

      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter your complete delivery address"
        rows={4}
        maxLength={500}
        className="mt-5 w-full resize-none rounded-2xl border border-[#333333] bg-black px-4 py-3 text-white outline-none transition placeholder:text-[#666] focus:border-[#FF6F00]"
      />

      <div className="mt-2 flex justify-between text-xs text-[#777]">
        <span>Required for delivery</span>
        <span>{address.length}/500</span>
      </div>
    </section>
  );
}