"use client";

type Props = {
  customerName: string;
  setCustomerName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  orderType: "delivery" | "pickup" | "dine_in";
};

export default function CustomerInformation({
  customerName,
  setCustomerName,
  phone,
  setPhone,
  orderType,
}: Props) {
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "");

    // Maximum 10 digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const isDineIn = orderType === "dine_in";

  // Accept both 97XXXXXXXX and 98XXXXXXXX
  const isValidPhone = /^(97|98)\d{8}$/.test(phone);

  return (
    <section className="rounded-3xl border border-[#242424] bg-[#111111] p-7 shadow-sm">
      <h2 className="text-xl font-extrabold text-white">
        Customer Information
      </h2>

      <p className="mt-1 text-sm text-[#BDBDBD]">
        {isDineIn
          ? "Add your name if you'd like us to call you when your order is ready."
          : "Please provide your contact details."}
      </p>

      {/* NAME */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-bold text-white">
          Your Name{" "}
          {!isDineIn && (
            <span className="text-[#FF6F00]">*</span>
          )}
        </label>

        <input
          type="text"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
          placeholder={
            isDineIn
              ? "Enter your name (optional)"
              : "Enter your name"
          }
          className="w-full rounded-2xl border border-[#333333] bg-black px-4 py-3 text-white outline-none transition placeholder:text-[#666] focus:border-[#FF6F00]"
        />
      </div>

      {/* PHONE */}
      {!isDineIn && (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-bold text-white">
            Phone Number{" "}
            <span className="text-[#FF6F00]">*</span>
          </label>

          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="97XXXXXXXX or 98XXXXXXXX"
            maxLength={10}
            className="w-full rounded-2xl border border-[#333333] bg-black px-4 py-3 text-white outline-none transition placeholder:text-[#666] focus:border-[#FF6F00]"
          />

          <p className="mt-2 text-xs text-[#888]">
            Enter a 10-digit mobile number starting with 97 or 98.
          </p>

          {/* DIGITS REMAINING */}
          {phone.length > 0 &&
            phone.length < 10 && (
              <p className="mt-1 text-xs text-[#FFD600]">
                {10 - phone.length} digits remaining
              </p>
            )}

          {/* VALID PHONE */}
          {phone.length === 10 &&
            isValidPhone && (
              <p className="mt-1 text-xs font-semibold text-[#00FF7F]">
                ✓ Valid phone number
              </p>
            )}

          {/* INVALID PHONE */}
          {phone.length === 10 &&
            !isValidPhone && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                Phone number must start with 97 or 98.
              </p>
            )}
        </div>
      )}
    </section>
  );
}