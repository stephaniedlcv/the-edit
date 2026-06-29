import Link from "next/link";
import { DailyHeader } from "@/components/daily-header";
import { DailyBrief } from "@/components/daily-brief";
import { CalendarSignal } from "@/components/calendar-signal";
import { TodayCalendar } from "@/components/today-calendar";
import { TodayOutfit } from "@/components/today-outfit";
import { mockOwnedItems } from "@/lib/mock-owned-items";
import { mockWishlistItems } from "@/lib/mock-wishlist-items";
import { outfitLooks } from "@/lib/mock-outfits";

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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-10 md:pb-20 md:pt-12">
      <DailyHeader />

      {/* Daily Styling Brief */}
      <section className="border-b border-[var(--line)] py-10 md:py-12">
        <DailyBrief />

        {/* Calendar + Agenda */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <CalendarSignal />

          {/* Calendar */}
          <TodayCalendar />
        </div>
      </section>

      {/* Today's Outfit + Closet Intelligence */}
      <section className="grid gap-6 border-b border-[var(--line)] py-10 md:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Today's Outfit — synced from Planner / Outfits / mock fallback */}
        <TodayOutfit />

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
