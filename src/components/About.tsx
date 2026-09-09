import Link from "next/link";

export default function About() {
  return (
    <main className="bg-black text-white">

      {/* ================= HERO ================= */}

      <section className="bg-black px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl text-center">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
            About Anil&apos;s
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Freshness in
            <span className="block text-[#FF6F00]">
              Every Sip &amp; Bite
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#BDBDBD] sm:text-base md:text-lg">
            Fresh juices, delicious food and refreshing moments —
            prepared with care at Anil&apos;s Juice Station.
          </p>

          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />
            <span className="h-px w-16 bg-[#333]" />
            <span className="h-2 w-2 rounded-full bg-[#FFD600] shadow-[0_0_12px_#FFD600]" />
            <span className="h-px w-16 bg-[#333]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />
          </div>

        </div>
      </section>


      {/* ================= OUR STORY ================= */}

      <section className="bg-black px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* IMAGE */}

          <div className="relative overflow-hidden rounded-[2rem] border border-[#242424] bg-[#111] shadow-[0_0_35px_rgba(255,111,0,0.08)]">

            <img
              src="/logo/logo.jpg"
              alt="Anil's Juice Station"
              className="h-[380px] w-full object-cover sm:h-[450px] md:h-[520px]"
            />

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

            <div className="absolute bottom-5 left-5 rounded-2xl border border-[#333] bg-black/85 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-[#FF6F00]">
                Freshly prepared
              </p>

              <p className="mt-1 text-sm text-[#BDBDBD]">
                Every day, with care ❤️
              </p>
            </div>

          </div>


          {/* CONTENT */}

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Simple Food.
              <span className="block text-[#FF6F00]">
                Fresh Ingredients.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-[#BDBDBD] sm:text-base">
              At Anil&apos;s Juice Station, we believe that great
              food doesn&apos;t need to be complicated. It starts
              with fresh ingredients, good preparation and a genuine
              passion for serving people.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#BDBDBD] sm:text-base">
              From refreshing fruit juices to tasty food, we prepare
              our favorites with care so you can enjoy something
              fresh, flavorful and satisfying whenever you visit us.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#BDBDBD] sm:text-base">
              We are currently serving our customers from our
              Kathmandu location at Musafir Station by Anil,
              Budhanilkantha.
            </p>


            {/* HIGHLIGHTS */}

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-[#242424] bg-[#111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#FF6F00] hover:shadow-[0_0_25px_rgba(255,111,0,0.12)]">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6F00]/10 text-2xl">
                  🍊
                </div>

                <p className="mt-4 text-lg font-extrabold text-[#FF6F00]">
                  Fresh
                </p>

                <p className="mt-1 text-xs text-[#999] sm:text-sm">
                  Quality ingredients
                </p>

              </div>


              <div className="rounded-2xl border border-[#242424] bg-[#111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#00FF7F] hover:shadow-[0_0_25px_rgba(0,255,127,0.1)]">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00FF7F]/10 text-2xl">
                  ❤️
                </div>

                <p className="mt-4 text-lg font-extrabold text-[#00FF7F]">
                  Made with Care
                </p>

                <p className="mt-1 text-xs text-[#999] sm:text-sm">
                  Prepared for you
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= WHY CHOOSE US ================= */}

      <section className="border-y border-[#171717] bg-[#050505] px-4 py-14 sm:px-6 md:py-20">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FFD600]">
              Why Anil&apos;s
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Why Customers
              <span className="text-[#FF6F00]"> Choose Us</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#999] sm:text-base">
              We focus on the things that matter most —
              freshness, flavor and a good experience.
            </p>

          </div>


          <div className="mt-10 grid gap-4 md:grid-cols-3">

            {/* CARD 1 */}

            <div className="group rounded-2xl border border-[#242424] bg-[#111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF6F00] hover:shadow-[0_0_30px_rgba(255,111,0,0.1)]">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6F00]/10 text-3xl">
                🍹
              </div>

              <h3 className="mt-5 text-xl font-extrabold">
                Fresh Drinks
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#999]">
                Refreshing juices prepared to give you
                a fresh and delicious experience.
              </p>

              <div className="mt-5 h-1 w-8 rounded-full bg-[#FF6F00] transition-all duration-300 group-hover:w-14" />

            </div>


            {/* CARD 2 */}

            <div className="group rounded-2xl border border-[#242424] bg-[#111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FFD600] hover:shadow-[0_0_30px_rgba(255,214,0,0.1)]">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD600]/10 text-3xl">
                🥗
              </div>

              <h3 className="mt-5 text-xl font-extrabold">
                Quality Food
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#999]">
                Tasty food made with attention to quality,
                freshness and flavor.
              </p>

              <div className="mt-5 h-1 w-8 rounded-full bg-[#FFD600] transition-all duration-300 group-hover:w-14" />

            </div>


            {/* CARD 3 */}

            <div className="group rounded-2xl border border-[#242424] bg-[#111] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00FF7F] hover:shadow-[0_0_30px_rgba(0,255,127,0.1)]">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00FF7F]/10 text-3xl">
                😊
              </div>

              <h3 className="mt-5 text-xl font-extrabold">
                Made With Care
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#999]">
                Every order matters to us, and we want
                you to leave happy and satisfied.
              </p>

              <div className="mt-5 h-1 w-8 rounded-full bg-[#00FF7F] transition-all duration-300 group-hover:w-14" />

            </div>

          </div>

        </div>

      </section>


      {/* ================= LOCATION ================= */}

      <section className="bg-black px-4 py-14 sm:px-6 md:py-20">

        <div className="mx-auto max-w-5xl">

          <div className="overflow-hidden rounded-[2rem] border border-[#242424] bg-[#111] p-7 text-center shadow-[0_0_35px_rgba(255,111,0,0.06)] sm:p-10 md:p-12">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6F00]/10 text-3xl">
              📍
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#FF6F00]">
              Visit Us
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Find Us in <span className="text-[#FFD600]">Kathmandu</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#999] sm:text-base">
              Visit Anil&apos;s Juice Station at Musafir Station
              by Anil, Budhanilkantha, Kathmandu.
            </p>


            <div className="mt-8 flex flex-wrap justify-center gap-3">

              <Link
                href="/contact"
                className="rounded-full bg-gradient-to-r from-[#FF6F00] to-[#FFD600] px-6 py-3 font-bold text-black shadow-[0_0_20px_rgba(255,111,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,111,0,0.3)]"
              >
                Contact &amp; Location
              </Link>

              <Link
                href="/menu"
                className="rounded-full border border-[#444] bg-black px-6 py-3 font-bold text-white transition hover:border-[#00FF7F] hover:text-[#00FF7F]"
              >
                Explore Menu
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}