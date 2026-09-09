"use client";

type Props = {
  notes: string;
  setNotes: (value: string) => void;
};

export default function AdditionalNotes({
  notes,
  setNotes,
}: Props) {
  return (
    <section className="rounded-3xl border border-[#242424] bg-[#111111] p-7 shadow-sm">
      <h2 className="text-xl font-extrabold text-white">
        Additional Notes
      </h2>

      <p className="mt-1 text-sm text-[#BDBDBD]">
        Have any special instructions for your order?
      </p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Example: Less spicy, no onions, extra sauce..."
        rows={4}
        maxLength={500}
        className="mt-5 w-full resize-none rounded-2xl border border-[#333333] bg-black px-4 py-3 text-white outline-none transition placeholder:text-[#666] focus:border-[#FF6F00]"
      />

      <div className="mt-2 flex justify-between text-xs text-[#777]">
        <span>Optional</span>
        <span>{notes.length}/500</span>
      </div>
    </section>
  );
}