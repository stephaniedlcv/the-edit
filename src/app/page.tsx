import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { mockOwnedItems } from "@/lib/mock-owned-items";
import { mockWishlistItems } from "@/lib/mock-wishlist-items";
import { outfitLooks } from "@/lib/mock-outfits";

const todayOutfit = outfitLooks[0];

const wardrobeStats = [
  {
    label: "Owned pieces",
    value: mockOwnedItems.length,
    href: "/closet",
    note: "Ready to style",
  },
  {
    label: "Wishlist edits",
    value: mockWishlistItems.length,
    href: "/wishlist",
    note: "Shopping under review",
  },
  {
    label: "Saved looks",
    value: outfitLooks.length,
    href: "/outfits",
    note: "Collage formulas",
  },
];

const closetGaps = [
  {
    title: "Shoes",
    detail: "Low styling support — add polished flats, loafers, and tropical sandals.",
  },
  {
    title: "Bags",
    detail: "Opportunity area — bags can make simple outfits feel finished.",
  },
  {
    title: "Rain days",
    detail: "Build a small capsule for humid/rainy PR days without looking casual.",
  },
];

const todayAgenda = [
  {
    time: "9:00 AM",
    title: "Work / Berlitz",
    context: "Office",
    outfitNeed: "polished, breathable, structured but not heavy",
  },
  {
    time: "12:30 PM",
    title: "Lunch + errands",
    context: "Day movement",
    outfitNeed: "comfortable shoes, light layers, easy bag",
  },
  {
    time: "6:00 PM",
    title: "Gym / active block",
    context: "Fitness",
    outfitNeed: "separate gym look; avoid over-styling after work",
  },
];

const calendarStyleSignals = [
  "Office first",
  "Humid weather",
  "Light structure",
  "Comfortable shoes",
];

const weatherData = [
  { label: "Temperature", value: "88°F" },
  { label: "Humidity", value: "78%" },
  { label: "Rain chance", value: "35%" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-10 md:pb-20 md:pt-12">
      <PageHeader
        contained={false}
        eyebrow="Daily Edit"
        title="Good afternoon, Stephanie."
        description=""
        asideEyebrow="San Juan · Today"
        asideText="Humid heat — light fabrics, open layers, and no heavy styling."
      >
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {weatherData.map((d) => (
            <div key={d.label}>
              <p className="eyebrow mb-2">{d.label}</p>
              <p className="font-display mt-2 text-[2.4rem] leading-none text-[var(--espresso)]">
                {d.value}
              </p>
            </div>
          ))}
          <div>
            <p className="eyebrow mb-2">Style verdict</p>
            <p className="mt-2 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
              Choose breathable pieces and keep structure light.
            </p>
          </div>
        </div>
      </PageHeader>

      {/* Daily Styling Brief */}
      <section className="border-b border-[var(--line)] py-10 md:py-12">
        <p className="eyebrow mb-5">Daily Styling Brief</p>

        <div className="border-y border-[var(--line)] py-7">
          <h2 className="font-display text-[2.4rem] leading-[1.0] text-[var(--espresso)] md:text-[3.2rem]">
            Office first. Humid heat. Gym separate.
          </h2>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {[
            {
              label: "Recommended",
              text: "Open blazer vest formula, worn open with breathable layers.",
            },
            {
              label: "Avoid",
              text: "Heavy closed blazers, thick layers, and uncomfortable shoes.",
            },
            {
              label: "Log note",
              text: "Keep the gym outfit separate from the work look.",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="eyebrow mb-3">{item.label}</p>
              <p className="text-[0.9rem] leading-[1.8] text-[var(--ink-soft)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Calendar + Agenda */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          {/* Calendar Signal */}
          <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.3)]">
            <p className="eyebrow mb-4">Calendar Signal</p>

            <h2 className="font-display text-[2.2rem] leading-none text-[var(--espresso)]">
              Today&apos;s calendar
            </h2>

            <p className="mt-4 text-[0.88rem] leading-[1.8] text-[var(--ink-soft)]">
              This is the Apple Calendar layer for the AI — it tells the system
              what kind of outfit the day actually needs.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {calendarStyleSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)]"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-5">
              <p className="eyebrow mb-3">AI instruction</p>
              <p className="font-display text-[1.05rem] italic leading-[1.5] text-[var(--coffee)]">
                Recommend an office look first, then treat gym as a separate
                logged outfit.
              </p>
            </div>
          </aside>

          {/* Agenda */}
          <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
              <div>
                <p className="eyebrow mb-2">Apple Calendar Preview</p>
                <p className="font-display text-[1.5rem] leading-none text-[var(--espresso)]">
                  Monday, June 22
                </p>
              </div>
              <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)]">
                Preview
              </span>
            </div>

            <div className="grid grid-cols-7 border-b border-[var(--line)]">
              {[
                ["Mon", "22"],
                ["Tue", "23"],
                ["Wed", "24"],
                ["Thu", "25"],
                ["Fri", "26"],
                ["Sat", "27"],
                ["Sun", "28"],
              ].map(([day, date], index) => {
                const isToday = index === 0;
                return (
                  <div
                    key={`${day}-${date}`}
                    className={[
                      "border-r border-[var(--line)] px-1 py-3 text-center last:border-r-0",
                      isToday ? "bg-[rgba(176,144,96,0.08)]" : "",
                    ].join(" ")}
                  >
                    <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                      {day}
                    </p>
                    <p
                      className={[
                        "font-display mt-1 text-[1.3rem] leading-none",
                        isToday ? "text-[var(--espresso)]" : "text-[var(--caramel-soft)]",
                      ].join(" ")}
                    >
                      {date}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-6">
              <div className="relative">
                <div className="absolute bottom-0 left-[5rem] top-0 w-px bg-[var(--line)]" />
                {todayAgenda.map((event) => (
                  <div
                    key={`${event.time}-${event.title}`}
                    className="relative grid gap-4 pb-6 last:pb-0 md:grid-cols-[5rem_1fr]"
                  >
                    <div className="pr-4 text-right">
                      <p className="font-display text-[1.1rem] leading-none text-[var(--espresso)]">
                        {event.time}
                      </p>
                      <p className="mt-1.5 text-[0.48rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                        {event.context}
                      </p>
                    </div>
                    <div className="relative pl-6">
                      <span className="absolute left-[-0.28rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--paper-2)] bg-[var(--gold)]" />
                      <div className="rounded-[2px] bg-[rgba(44,28,12,0.7)] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_30px_rgba(0,0,0,0.25)]">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[0.95rem] font-medium text-[var(--espresso)]">
                              {event.title}
                            </p>
                            <p className="mt-1.5 text-[0.85rem] leading-[1.7] text-[var(--ink-soft)]">
                              {event.outfitNeed}
                            </p>
                          </div>
                          <span className="w-fit shrink-0 rounded-full border border-[var(--line)] px-2.5 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
                            outfit signal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Outfit + Closet Intelligence */}
      <section className="grid gap-6 border-b border-[var(--line)] py-10 md:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Today's Outfit */}
        <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <div
              className="relative min-h-[22rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r md:min-h-[26rem]"
              style={{
                background:
                  "linear-gradient(170deg, #2C1C0C 0%, #1A1008 70%, #120C06 100%)",
              }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-[rgba(18,10,4,0.8)] px-3 py-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm border border-[rgba(255,255,255,0.07)]">
                Today&apos;s look
              </div>

              {todayOutfit.pieces.slice(0, 5).map((piece) => (
                <div
                  key={piece.id}
                  className="absolute rounded-[22px] bg-[rgba(200,151,58,0.12)] shadow-[0_16px_36px_rgba(0,0,0,0.3)]"
                  style={{
                    top: piece.top,
                    left: piece.left,
                    width: piece.width,
                    height: piece.height,
                    transform: `rotate(${piece.rotate ?? 0}deg)`,
                  }}
                >
                  <div className="absolute inset-3 rounded-[16px] border border-white/10" />
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <span className="font-display text-[0.95rem] leading-tight text-[rgba(242,228,200,0.45)]">
                      {piece.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-7">
              <p className="eyebrow mb-4">Outfit of today</p>

              <h2 className="font-display text-[2.4rem] leading-[1.02] text-[var(--espresso)]">
                {todayOutfit.title}
              </h2>

              <p className="mt-4 text-[0.9rem] leading-[1.8] text-[var(--ink-soft)]">
                {todayOutfit.caption}
              </p>

              <div className="mt-6 border-y border-[var(--line)] py-4">
                <p className="eyebrow mb-3">Formula</p>
                <div className="flex flex-wrap gap-2">
                  {todayOutfit.formula.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <p className="font-display mt-5 text-[1.02rem] italic leading-[1.55] text-[var(--coffee)]">
                {todayOutfit.notes}
              </p>

              <div className="mt-7 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5">
                <Link
                  href="/outfits"
                  className="border-b border-[var(--espresso)] pb-[2px] text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] no-underline"
                >
                  Open board
                </Link>
                <Link
                  href="/planner"
                  className="border-b border-transparent pb-[2px] text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
                >
                  Add to log
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Closet Intelligence */}
        <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.3)]">
          <p className="eyebrow mb-4">Closet Intelligence</p>

          <h2 className="font-display text-[2.2rem] leading-none text-[var(--espresso)]">
            What needs attention
          </h2>

          <div className="mt-7 space-y-5">
            {closetGaps.map((gap) => (
              <div key={gap.title} className="border-t border-[var(--line)] pt-5">
                <p className="eyebrow mb-2">{gap.title}</p>
                <p className="text-[0.88rem] leading-[1.8] text-[var(--ink-soft)]">
                  {gap.detail}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/wishlist"
            className="mt-8 inline-block border-b border-[var(--espresso)] pb-[2px] text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] no-underline"
          >
            Review gaps
          </Link>
        </aside>
      </section>

      {/* Wardrobe Stats */}
      <section className="grid gap-4 py-10 md:gap-5 md:grid-cols-3">
        {wardrobeStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group block rounded-[2px] bg-[var(--paper-2)] px-6 py-7 no-underline transition duration-300 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.06),0_28px_72px_rgba(0,0,0,0.45)]"
          >
            <p className="eyebrow mb-4">{stat.label}</p>

            <p className="font-display text-[5rem] leading-none text-[var(--espresso)]">
              {String(stat.value).padStart(2, "0")}
            </p>

            <p className="mt-4 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
              {stat.note}
            </p>

            <span className="mt-6 inline-block border-b border-transparent pb-[2px] text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] transition group-hover:border-[var(--coffee)]">
              Open section
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
