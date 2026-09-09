import Link from "next/link";
import { MessageCircle, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-extrabold text-orange-500">
              Anil&apos;s Juice Station
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              Fresh juices, delicious food, and good vibes served fresh at
              Musafir Station by Anil.
            </p>

            {/* Social Media */}
            <div className="mt-6 flex gap-3">

              {/* Facebook */}
              <a
                href="https://www.facebook.com/p/Anils-Juice-Station-61591700454331/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:scale-110 hover:bg-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.3v3h2.8v8h3.4z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/anilsjuicestation"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:scale-110 hover:bg-pink-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/9779862765255"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:scale-110 hover:bg-green-600"
              >
                <MessageCircle size={20} />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-orange-500"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/menu"
                  className="transition hover:text-orange-500"
                >
                  Menu
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="transition hover:text-orange-500"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-orange-500"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Visit Us */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Visit Us</h3>

            <div className="space-y-4 text-sm text-gray-400">

              <div className="flex gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <p>
                  Musafir Station by Anil
                  <br />
                  Budhanilkantha, Kathmandu
                </p>
              </div>

              <div className="flex gap-3">
                <Phone
                  size={20}
                  className="shrink-0 text-orange-500"
                />

                <a
                  href="tel:+9779862765255"
                  className="transition hover:text-orange-500"
                >
                  +977 986-2765255
                </a>
              </div>

            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Opening Hours</h3>

            <div className="text-sm text-gray-400">
              <div className="flex justify-between border-b border-white/10 py-2">
                <span>Everyday</span>
                <span className="font-medium text-white">
                  8:00 AM – 12:00 PM
                </span>
              </div>
            </div>

            <a
              href="https://wa.me/9779862765255"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <MessageCircle size={18} />
              Chat With Us
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-gray-500 md:flex-row">

          <p>
            © {new Date().getFullYear()} Anil&apos;s Juice Station. All
            rights reserved.
          </p>

          <p>
            Freshly made with ❤️ in Kathmandu
          </p>

        </div>
      </div>
    </footer>
  );
}