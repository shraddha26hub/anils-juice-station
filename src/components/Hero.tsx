export default function Hero() {
  return (
    <section className="bg-black px-3 pb-8 pt-3 sm:px-5 sm:pb-10 sm:pt-5">
      <div className="mx-auto max-w-7xl">

        {/* HERO VIDEO */}
        <div className="relative overflow-hidden rounded-2xl border border-[#222] shadow-[0_0_40px_rgba(255,111,0,0.08)] sm:rounded-3xl">

          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="block aspect-video w-full object-cover"
          >
            <source src="/videos/hero1.mp4" type="video/mp4" />
          </video>

          {/* Subtle bottom glow */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        </div>

        {/* SMALL BRAND ACCENT */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BDBDBD]">
            Fresh • Delicious • Made With Love
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD600] shadow-[0_0_10px_#FFD600]" />
        </div>

      </div>
    </section>
  );
}