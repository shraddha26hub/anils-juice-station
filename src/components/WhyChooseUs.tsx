const reasons = [
  {
    icon: "🍊",
    title: "Fresh Ingredients",
    description:
      "We use fresh ingredients to give you great taste in every sip and bite.",
    color: "#FF6F00",
  },
  {
    icon: "⚡",
    title: "Made Fresh",
    description:
      "Your food and drinks are prepared fresh so you can enjoy them at their best.",
    color: "#FFD600",
  },
  {
    icon: "❤️",
    title: "Made With Care",
    description:
      "Every order is prepared with attention to quality, taste and your experience.",
    color: "#FF1744",
  },
  {
    icon: "🌿",
    title: "Refreshing Taste",
    description:
      "From fresh juices to delicious food, we keep every visit refreshing.",
    color: "#00FF7F",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-black px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00FF7F]">
            Why Anil&apos;s?
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Freshness You Can{" "}
            <span className="text-[#FF6F00]">
              Taste
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#BDBDBD] sm:text-base">
            Good ingredients, fresh preparation and a whole lot of care.
          </p>
        </div>

        {/* REASONS */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group rounded-2xl border border-[#242424] bg-[#111] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#FF6F00] hover:shadow-[0_0_25px_rgba(255,111,0,0.12)] sm:p-6"
            >

              {/* ICON */}
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${reason.color}15`,
                  boxShadow: `0 0 20px ${reason.color}10`,
                }}
              >
                {reason.icon}
              </div>

              {/* TITLE */}
              <h3 className="mt-4 text-base font-extrabold text-white sm:text-lg">
                {reason.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-2 text-xs leading-5 text-[#999] sm:text-sm sm:leading-6">
                {reason.description}
              </p>

              {/* ACCENT */}
              <div
                className="mx-auto mt-4 h-1 w-8 rounded-full transition-all duration-300 group-hover:w-14"
                style={{ backgroundColor: reason.color }}
              />

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}