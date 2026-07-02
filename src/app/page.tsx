import Link from "next/link";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { WardrobeCategory } from "@/types/wardrobe";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  outerwear: "Outerwear",
  top: "Tops",
  bottom: "Bottoms",
  dress: "Dresses",
  shoes: "Shoes",
  bag: "Bags",
  accessory: "Accessories",
  jewelry: "Jewelry",
};

const CATEGORY_ORDER: WardrobeCategory[] = [
  "outerwear",
  "top",
  "bottom",
  "dress",
  "shoes",
  "bag",
  "accessory",
  "jewelry",
];

const GAP_THRESHOLDS: Partial<Record<WardrobeCategory, number>> = {
  shoes: 3,
  bag: 2,
  outerwear: 2,
  top: 4,
  bottom: 3,
  dress: 1,
};

const GAP_NOTES: Partial<Record<WardrobeCategory, string>> = {
  shoes: "Add polished flats, loafers, or elevated sandals to unlock more outfit formulas.",
  bag: "A structured bag instantly makes simple outfits feel styled.",
  outerwear: "Light layers create polish without fighting the Puerto Rico heat.",
  top: "More strong tops create more daily combinations without needing new bottoms.",
  bottom: "Tailored trousers and one fashion skirt would expand your office options.",
  dress: "Dresses are your high-heat, low-effort, high-impact shortcut.",
  accessory: "Accessories are the difference between dressed and styled.",
  jewelry: "A few repeatable jewelry staples would make every outfit feel finished.",
};

function StatCard({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: number;
  note: string;
  href: string;
}) {
  return (
    <Link href={href} className="edit-card block p-5 no-underline md:p-6">
      <p className="eyebrow mb-4">{label}</p>
      <p className="font-display text-[4.2rem] leading-none text-[var(--espresso)]">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{note}</p>
      <span className="mt-5 inline-flex text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--burgundy)]">
        Open section →
      </span>
    </Link>
  );
}

function MiniItem({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "rose" | "olive" | "plum" | "gold";
}) {
  const tones = {
    rose: "from-[var(--blush)] to-[var(--dusty-rose)]",
    olive: "from-[#EEE9DE] to-[var(--olive)]",
    plum: "from-[var(--blush)] to-[var(--plum)]",
    gold: "from-[#F4E8DF] to-[var(--gold)]",
  };

  return (
    <div className="flex items-center gap-3 rounded-[1.35rem] bg-white/50 p-3 shadow-[inset_0_0_0_1px_rgba(48,35,31,0.04)]">
      <div className={`h-14 w-14 shrink-0 rounded-[1.1rem] bg-gradient-to-br ${tones[tone]}`} />
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none text-[var(--espresso)]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">{subtitle}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const items = await getWardrobeItems();

  const counts = items.reduce<Partial<Record<WardrobeCategory, number>>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

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

  const covered = CATEGORY_ORDER
    .filter((cat) => (counts[cat] ?? 0) > 0)
    .map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat],
      count: counts[cat] ?? 0,
    }));

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
    if (savedRes.count !== null) savedLooksCount = savedRes.count;
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto max-w-[1120px]">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="edit-card-glass relative overflow-hidden p-6 md:p-8">
            <div className="absolute right-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-[rgba(216,175,163,0.36)] blur-3xl" />
            <div className="absolute bottom-[-6rem] left-[-5rem] h-64 w-64 rounded-full bg-[rgba(122,46,53,0.08)] blur-3xl" />

            <div className="relative">
              <p className="eyebrow mb-5">Daily Edit</p>

              <h1 className="font-display text-[4.1rem] leading-[0.82] text-[var(--espresso)] md:text-[6.3rem]">
                Good afternoon,
                <br />
                Stephanie.
              </h1>

              <p className="mt-6 max-w-xl text-[1rem] leading-7 text-[var(--ink-soft)]">
                Your style OS is ready. Today’s focus is polished, breathable,
                intentional — built for office life, Puerto Rico heat, and your
                evolving capsule.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="edit-chip edit-chip-active">Office day</span>
                <span className="edit-chip">Warm palette</span>
                <span className="edit-chip">PR heat</span>
                <span className="edit-chip">Elevated casual</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/outfits"
                  className="edit-button-primary px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] no-underline"
                >
                  Build today’s edit
                </Link>
                <Link
                  href="/planner"
                  className="rounded-full border border-white/70 bg-white/50 px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline shadow-sm"
                >
                  View calendar
                </Link>
              </div>
            </div>
          </section>

          <section className="edit-card p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-2">Today’s edit</p>
                <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                  Style plan
                </h2>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--burgundy)] text-sm font-bold text-white">
                82
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,var(--blush),rgba(255,253,252,0.74))] p-5">
              <p className="font-display text-3xl leading-none text-[var(--espresso)]">
                Blazer open, clean base, structured bottom.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                Keep the silhouette sharp but breathable. Add one warm color
                signal so the outfit feels styled, not basic.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <MiniItem
                title="Outfit Planning"
                subtitle="10:00 AM · Office polished, tropical-safe"
                tone="rose"
              />
              <MiniItem
                title="Gym"
                subtitle="12:30 PM · Pack the reset pieces"
                tone="olive"
              />
              <MiniItem
                title="Wishlist Review"
                subtitle="Check color fit and duplicate risk"
                tone="plum"
              />
            </div>
          </section>
        </div>

        <div className="mb-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="edit-card p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Closet Intelligence</p>
                <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                  {gaps.length > 0 ? "What needs attention" : "Your closet is solid"}
                </h2>
              </div>
              <Link
                href="/closet"
                className="rounded-full bg-white/60 px-4 py-2 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[var(--burgundy)] no-underline"
              >
                Closet
              </Link>
            </div>

            {covered.length > 0 ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {covered.slice(0, 8).map(({ cat, label, count }) => (
                  <span key={cat} className="edit-chip">
                    {count} {label}
                  </span>
                ))}
              </div>
            ) : null}

            {gaps.length > 0 ? (
              <div className="grid gap-3">
                {gaps.map(({ cat, label, count, threshold, note }) => (
                  <div key={cat} className="rounded-[1.35rem] bg-white/46 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--burgundy)]">
                        {label}
                      </p>
                      <span className="rounded-full bg-[rgba(122,46,53,0.10)] px-3 py-1 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[var(--burgundy)]">
                        {count}/{threshold}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--ink-soft)]">{note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--ink-soft)]">
                All key categories are covered. Keep logging looks so the AI can
                keep learning what actually works.
              </p>
            )}
          </section>

          <section className="edit-card-glass p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-2">Quick actions</p>
                <h2 className="font-display text-4xl leading-none text-[var(--espresso)]">
                  Choose your next move
                </h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/closet" className="rounded-[1.5rem] bg-white/52 p-5 no-underline">
                <p className="font-display text-3xl leading-none text-[var(--espresso)]">
                  Add closet piece
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Log an item, color, fit, and styling notes.
                </p>
              </Link>

              <Link href="/wishlist" className="rounded-[1.5rem] bg-white/52 p-5 no-underline">
                <p className="font-display text-3xl leading-none text-[var(--espresso)]">
                  Review wishlist
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Decide what deserves space in the capsule.
                </p>
              </Link>

              <Link href="/outfits" className="rounded-[1.5rem] bg-white/52 p-5 no-underline">
                <p className="font-display text-3xl leading-none text-[var(--espresso)]">
                  Build outfit
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Generate a look that is bold but wearable.
                </p>
              </Link>

              <Link href="/planner" className="rounded-[1.5rem] bg-white/52 p-5 no-underline">
                <p className="font-display text-3xl leading-none text-[var(--espresso)]">
                  Plan the week
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Align events, outfits, gym, and beauty.
                </p>
              </Link>
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Owned pieces"
            value={ownedCount}
            href="/closet"
            note="Active pieces in your closet — the AI’s raw material."
          />
          <StatCard
            label="Wishlist edits"
            value={wishlistCount}
            href="/wishlist"
            note="Items under review before they enter the capsule."
          />
          <StatCard
            label="Saved looks"
            value={savedLooksCount}
            href="/outfits"
            note="Curated outfits ready to repeat, improve, or adapt."
          />
        </section>
      </section>
    </main>
  );
}
