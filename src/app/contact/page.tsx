"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const googleMapsUrl =
    "https://maps.app.goo.gl/boWkCc3TuGt8kPMX8?g_st=ic";

  const mapEmbedUrl =
    "https://www.google.com/maps?q=Musafir%20Station%20by%20Anil%2C%20Budhanilkantha%2044600%2C%20Nepal&output=embed";

  const whatsappNumber = "9779862765255";

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert("Please fill in all the fields.");
      return;
    }

    const whatsappMessage = `Hello Anil's Juice Station! 👋

New Contact Message

Name: ${name.trim()}
Phone: ${phone.trim()}

Message:
${message.trim()}

Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, "_blank");

    setName("");
    setPhone("");
    setMessage("");
  };

  return (
    <section className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
              Get In Touch
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD600] shadow-[0_0_10px_#FFD600]" />
          </div>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Contact{" "}
            <span className="text-[#FF6F00]">Anil&apos;s</span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#888] sm:text-base">
            Have a question or want to know more? Send us a message
            directly on WhatsApp.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Left Side */}
          <div className="space-y-5">

            {/* Location */}
            <div className="rounded-[1.75rem] border border-[#242424] bg-[#111] p-6 transition duration-300 hover:border-[#FF6F00]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6F00]/10 text-[#FF6F00]">
                  <MapPin size={24} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                    Our Location
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    Musafir Station by Anil
                  </h2>

                  <p className="mt-2 text-sm text-[#999]">
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
              </div>
            </div>

            {/* Phone */}
            <div className="rounded-[1.75rem] border border-[#242424] bg-[#111] p-6 transition duration-300 hover:border-[#FFD600]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFD600]/10 text-[#FFD600]">
                  <Phone size={24} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                    Call Us
                  </p>

                  <a
                    href="tel:9862765255"
                    className="mt-1 block text-xl font-extrabold transition hover:text-[#FF6F00]"
                  >
                    986-276-5255
                  </a>

                  <p className="mt-2 text-sm text-[#777]">
                    We&apos;re happy to hear from you.
                  </p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="rounded-[1.75rem] border border-[#242424] bg-[#111] p-6 transition duration-300 hover:border-[#00FF7F]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00FF7F]/10 text-[#00FF7F]">
                  <Clock size={24} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF7F]">
                    Opening Hours
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[#FFD600]">
                    8:00 AM – 12:00 PM
                  </h2>

                  <p className="mt-2 text-sm text-[#777]">
                    Open every day
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="rounded-[1.75rem] border border-[#242424] bg-[#111] p-6 sm:p-8">

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle size={23} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25D366]">
                    WhatsApp
                  </p>

                  <h2 className="text-2xl font-extrabold">
                    Send Us a Message
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#888]">
                Fill out the form below and we&apos;ll open WhatsApp with
                your message ready to send.
              </p>
            </div>

            <form onSubmit={handleWhatsApp} className="space-y-5">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#BDBDBD]"
                >
                  Your Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[#BDBDBD]"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#FFD600] focus:ring-1 focus:ring-[#FFD600]"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-[#BDBDBD]"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#00FF7F] focus:ring-1 focus:ring-[#00FF7F]"
                />
              </div>

              {/* WhatsApp Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-extrabold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_0_25px_rgba(37,211,102,0.3)]"
              >
                <MessageCircle size={19} />
                Send via WhatsApp
              </button>

              <p className="text-center text-xs text-[#555]">
                You&apos;ll be redirected to WhatsApp to send the message.
              </p>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#242424] bg-[#111]">
          <div className="relative h-[380px]">
            <iframe
              title="Musafir Station by Anil - Budhanilkantha Kathmandu"
              src={mapEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/90 px-5 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-sm transition hover:bg-[#FF6F00] hover:text-black"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6F00] shadow-[0_0_10px_#FF6F00]" />

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#666]">
            Fresh • Delicious • Made With Love
          </p>

          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] shadow-[0_0_10px_#00FF7F]" />
        </div>
      </div>
    </section>
  );
}