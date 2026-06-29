import Link from "next/link";
import { DailyHeader } from "@/components/daily-header";
import { TodayCalendar } from "@/components/today-calendar";
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

const calendarStyleSignals = [
  "Office first",
  "Humid weather",
  "Light structure",
  "Comfortable shoes",
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-10 md:pb-20 md:pt-12">
      <DailyHeader />

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
          <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
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

          {/* Calendar */}
          <TodayCalendar />
        </div>
      </section>

      {/* Today's Outfit + Closet Intelligence */}
      <section className="grid gap-6 border-b border-[var(--line)] py-10 md:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Today's Outfit */}
        <div className="overflow-hidden rounded-[2px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
          <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <div
              className="relative min-h-[22rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r md:min-h-[26rem]"
              style={{
                background:
                  "linear-gradient(170deg, #F4EEE4 0%, #EDE6DA 70%, #E6DDCE 100%)",
              }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-[rgba(255,255,255,0.85)] px-3 py-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] shadow-[0_4px_16px_rgba(36,26,18,0.12)] backdrop-blur-sm border border-[rgba(36,26,18,0.08)]">
                Today&apos;s look
              </div>

              {todayOutfit.pieces.slice(0, 5).map((piece) => (
                <div
                  key={piece.id}
                  className="absolute rounded-[22px] bg-[rgba(255,255,255,0.7)] shadow-[0_16px_36px_rgba(36,26,18,0.12)]"
                  style={{
                    top: piece.top,
                    left: piece.left,
                    width: piece.width,
                    height: piece.height,
                    transform: `rotate(${piece.rotate ?? 0}deg)`,
                  }}
                >
                  <div className="absolute inset-3 rounded-[16px] border border-[rgba(36,26,18,0.08)]" />
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <span className="font-display text-[0.95rem] leading-tight text-[var(--coffee)]">
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
        <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
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
            className="group block rounded-[2px] bg-[var(--paper-2)] px-6 py-7 no-underline transition duration-300 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(161,122,53,0.2),0_26px_60px_rgba(36,26,18,0.12)]"
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
