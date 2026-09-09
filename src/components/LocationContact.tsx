import Link from "next/link";

export default function LocationContact() {
  /*
   * Exact Google Maps location:
   * Musafir Station by Anil
   * Budhanilkantha, Kathmandu
   */

  const googleMapsUrl =
    "https://maps.app.goo.gl/boWkCc3TuGt8kPMX8?g_st=ic";

  const mapEmbedUrl =
    "https://www.google.com/maps?q=Musafir%20Station%20by%20Anil%2C%20Budhanilkantha%2044600%2C%20Nepal&output=embed";

  return (
    <section className="border-t border-[#171717] bg-black px-4 py-10 sm:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-7 text-center">

          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF6F00]">
              Visit Us
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />
          </div>

          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Find Anil&apos;s{" "}
            <span className="text-[#FFD600]">
              Juice Station
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#888] sm:text-base">
            Come visit us for fresh juices, delicious food and
            refreshing moments in Kathmandu.
          </p>

        </div>


        {/* ================= CONTACT + MAP ================= */}

        <div className="grid gap-5 lg:grid-cols-2">

          {/* ================= CONTACT INFORMATION ================= */}

          <div className="rounded-[1.75rem] border border-[#242424] bg-[#111] p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6F00]/10 text-2xl">
                📍
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                  Our Location
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-white">
                  Musafir Station by Anil
                </h3>
              </div>

            </div>


            {/* LOCATION */}

            <div className="mt-6 border-b border-[#242424] pb-5">

              <p className="text-sm text-[#BDBDBD]">
                Budhanilkantha, Kathmandu 44600
              </p>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-bold text-[#FF6F00] transition hover:text-[#FFD600]"
              >
                Get Directions →
              </a>

            </div>


            {/* INFORMATION GRID */}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* PHONE */}

              <div className="rounded-xl border border-[#242424] bg-[#080808] p-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6F00]/10 text-lg">
                  📞
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
                  Call Us
                </p>

                <a
                  href="tel:9862765255"
                  className="mt-1 block text-sm font-bold text-white transition hover:text-[#FF6F00]"
                >
                  986-2765255
                </a>

              </div>


              {/* HOURS */}

              <div className="rounded-xl border border-[#242424] bg-[#080808] p-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00FF7F]/10 text-lg">
                  🕐
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#666]">
                  Opening Hours
                </p>

                <p className="mt-1 text-sm font-bold text-[#FFD600]">
                  8:00 AM – 12:00 PM
                </p>

                <p className="mt-0.5 text-xs text-[#666]">
                  Every Day
                </p>

              </div>

            </div>


            {/* MENU BUTTON */}

            <Link
              href="/menu"
              className="mt-5 block w-full rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] py-3 text-center text-sm font-extrabold text-black transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(255,111,0,0.25)]"
            >
              Explore Our Menu →
            </Link>

          </div>


          {/* ================= MAP ================= */}

          <div className="relative min-h-[390px] overflow-hidden rounded-[1.75rem] border border-[#242424] bg-[#111] shadow-[0_0_25px_rgba(255,111,0,0.05)]">

            <iframe
              title="Musafir Station by Anil - Budhanilkantha Kathmandu"
              src={mapEmbedUrl}
              className="h-full min-h-[390px] w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* MAP OVERLAY */}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

            {/* MAP BUTTON */}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/90 px-5 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-[#FF6F00] hover:text-black"
            >
              Open in Google Maps →
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}