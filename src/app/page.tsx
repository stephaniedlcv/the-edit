import Link from "next/link";
import { DailyHeader } from "@/components/daily-header";
import { DailyBrief } from "@/components/daily-brief";
import { CalendarSignal } from "@/components/calendar-signal";
import { TodayCalendar } from "@/components/today-calendar";
import { TodayOutfit } from "@/components/today-outfit";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { WardrobeCategory } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  outerwear:  "Outerwear",
  top:        "Tops",
  bottom:     "Bottoms",
  dress:      "Dresses",
  shoes:      "Shoes",
  bag:        "Bags",
  accessory:  "Accessories",
  jewelry:    "Jewelry",
};

const GAP_THRESHOLDS: Partial<Record<WardrobeCategory, number>> = {
  shoes:     3,
  bag:       2,
  outerwear: 2,
  top:       4,
  bottom:    3,
  dress:     1,
};

const GAP_NOTES: Partial<Record<WardrobeCategory, string>> = {
  shoes:     "Polished flats, loafers, or tropical sandals would expand your formula range.",
  bag:       "Even one structured bag completes simple outfits and elevates the look.",
  outerwear: "A light layer — blazer or jacket — gives the AI more coverage options.",
  top:       "More tops = more daily combinations. Aim for solid neutrals and one print.",
  bottom:    "Versatile bottoms anchor every formula. Trousers and a skirt are must-haves.",
  dress:     "Dresses are the single-piece solution for high-heat, low-effort days.",
  accessory: "Accessories are the final signal that turns a good look into a great one.",
  jewelry:   "Jewelry elevates elevation. A few staples — chain, studs, hoops — go far.",
};

const CATEGORY_ORDER: WardrobeCategory[] = [
  "outerwear", "top", "bottom", "dress", "shoes", "bag", "accessory", "jewelry",
];

export default async function HomePage() {
  // --- Fetch wardrobe items (used by TodayOutfit + ClosetIntelligence) ---
  const items = await getWardrobeItems();

  // --- Category breakdown ---
  const counts = items.reduce<Partial<Record<WardrobeCategory, number>>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Gaps: categories below threshold, sorted by priority order
  const gaps = CATEGORY_ORDER
    .filter((cat) => (counts[cat] ?? 0) < (GAP_THRESHOLDS[cat] ?? 99))
    .slice(0, 3)
    .map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat],
      count: counts[cat] ?? 0,
      threshold: GAP_THRESHOLDS[cat] ?? 2,
      note: GAP_NOTES[cat] ?? "",
    }));

  // Well-covered categories (for "Your closet, by category" summary)
  const covered = CATEGORY_ORDER
    .filter((cat) => (counts[cat] ?? 0) > 0)
    .map((cat) => ({ cat, label: CATEGORY_LABELS[cat], count: counts[cat] ?? 0 }));

  // --- Real wardrobe stats ---
  const supabase = getSupabaseServerClient();
  const ownedCount = items.length;
  let wishlistCount = 0;
  let savedLooksCount = 0;

  if (supabase) {
    const [wishlistRes, savedRes] = await Promise.all([
      supabase
        .from("wishlist_items")
        .select("id", { count: "exact", head: true })
        .eq("is_archived", false),
      supabase
        .from("saved_outfits")
        .select("id", { count: "exact", head: true })
        .neq("status", "deleted"),
    ]);
    if (wishlistRes.count !== null) wishlistCount = wishlistRes.count;
    if (savedRes.count !== null)    savedLooksCount = savedRes.count;
  }

  const wardrobeStats = [
    {
      label: "Owned pieces",
      value: ownedCount,
      href: "/closet",
      note: "Active pieces in your closet — the AI's raw material.",
    },
    {
      label: "Wishlist edits",
      value: wishlistCount,
      href: "/wishlist",
      note: "Items under review — potential additions to the formula.",
    },
    {
      label: "Saved looks",
      value: savedLooksCount,
      href: "/outfits",
      note: "Curated outfits ready to wear or adapt.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-10 md:pb-20 md:pt-12">
      <DailyHeader />

      {/* Daily Styling Brief */}
      <section className="border-b border-[var(--line)] py-10 md:py-12">
        <DailyBrief />

        {/* Calendar + Agenda */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <CalendarSignal />
          <TodayCalendar />
        </div>
      </section>

      {/* Today's Outfit + Closet Intelligence */}
      <section className="grid gap-6 border-b border-[var(--line)] py-10 md:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <TodayOutfit items={items} />

        {/* Closet Intelligence */}
        <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
          <p className="eyebrow mb-4">Closet Intelligence</p>

          <h2 className="font-display text-[2.1rem] leading-[1.05] text-[var(--espresso)]">
            {gaps.length > 0 ? "What needs attention" : "Your closet is solid"}
          </h2>

          {/* Category breakdown */}
          {covered.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {covered.map(({ cat, label, count }) => (
                <span
                  key={cat}
                  className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
                >
                  {count} {label}
                </span>
              ))}
            </div>
          )}

          {/* Gap rows */}
          {gaps.length > 0 ? (
            <div className="mt-6 space-y-5">
              {gaps.map(({ cat, label, count, threshold, note }) => (
                <div key={cat} className="border-t border-[var(--line)] pt-5">
                  <div className="mb-1.5 flex items-center gap-3">
                    <p className="eyebrow">{label}</p>
                    <span className="rounded-full bg-[rgba(161,34,63,0.1)] px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.15em] text-[#A1223F]">
                      {count}/{threshold} min
                    </span>
                  </div>
                  <p className="text-[0.84rem] leading-[1.8] text-[var(--ink-soft)]">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-[0.88rem] leading-[1.8] text-[var(--ink-soft)]">
              All key categories are covered. Keep building to give the AI more
              formula combinations to work with.
            </p>
          )}

          <Link
            href="/wishlist"
            className="mt-8 inline-block border-b border-[var(--espresso)] pb-[2px] text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] no-underline"
          >
            {gaps.length > 0 ? "Review gaps" : "Explore wishlist"}
          </Link>
        </aside>
      </section>

      {/* Wardrobe Stats */}
      <section className="py-10 md:py-12">
        {/* Intro */}
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow mb-3">Your wardrobe, by the numbers</p>
          <p className="text-[0.92rem] leading-[1.85] text-[var(--ink-soft)]">
            These three sections power the AI — the more you build each one,
            the sharper the daily recommendations become. Click any card to go
            deeper.
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
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
        </div>
      </section>
    </div>
  );
}
