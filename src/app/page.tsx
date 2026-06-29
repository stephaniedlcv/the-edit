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

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 md:px-10 md:pb-20">
      <PageHeader
        contained={false}
        eyebrow="Daily Edit"
        title="Good afternoon, Stephanie."
        description=""
        asideEyebrow="San Juan · Today"
        asideText="Humid heat — light fabrics, open layers, and no heavy styling."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
              Temperature
            </p>
            <p className="font-display mt-2 text-3xl text-[var(--espresso)]">
              88°F
            </p>
          </div>

          <div>
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
              Humidity
            </p>
            <p className="font-display mt-2 text-3xl text-[var(--espresso)]">
              78%
            </p>
          </div>

          <div>
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
              Rain chance
            </p>
            <p className="font-display mt-2 text-3xl text-[var(--espresso)]">
              35%
            </p>
          </div>

          <div>
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
              Style verdict
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Choose breathable pieces and keep structure light. Blazers only if
              worn open.
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="border-b border-[var(--line)] py-10">
        <div className="mb-6">
          <p className="eyebrow mb-3">Daily Styling Brief</p>
          <div className="grid gap-6 border-y border-[var(--line)] py-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-display text-[3rem] leading-none text-[var(--espresso)]">
                Office first. Humid heat. Gym separate.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                  Recommended
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Open blazer vest formula, worn open with breathable layers.
                </p>
              </div>

              <div>
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                  Avoid
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Heavy closed blazers, thick layers, and uncomfortable shoes.
                </p>
              </div>

              <div>
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                  Log note
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Keep the gym outfit separate from the work look.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr]">
          <aside className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7">
            <p className="eyebrow mb-3">Calendar Signal</p>

            <h2 className="font-display text-[2.65rem] leading-none text-[var(--espresso)]">
              Today&apos;s calendar
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              This is the Apple Calendar layer for the AI. It tells the system
              what kind of outfit the day actually needs.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {calendarStyleSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--coffee)]"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-5">
              <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                AI instruction
              </p>
              <p className="font-display mt-3 text-[1.08rem] italic leading-[1.45] text-[var(--coffee)]">
                Recommend an office look first, then treat gym as a separate
                logged outfit.
              </p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
              <div>
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
                  Apple Calendar Preview
                </p>
                <p className="font-display mt-2 text-[1.55rem] leading-none text-[var(--espresso)]">
                  Monday, June 22
                </p>
              </div>

              <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.55rem] font-medium uppercase tracking-[0.2em] text-[var(--coffee)]">
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
                      "border-r border-[var(--line)] px-3 py-3 text-center last:border-r-0",
                      isToday ? "bg-[rgba(148,113,77,0.08)]" : "",
                    ].join(" ")}
                  >
                    <p className="text-[0.52rem] font-medium uppercase tracking-[0.2em] text-[var(--caramel)]">
                      {day}
                    </p>
                    <p
                      className={[
                        "font-display mt-1 text-[1.4rem] leading-none",
                        isToday
                          ? "text-[var(--espresso)]"
                          : "text-[var(--caramel-soft)]",
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
                <div className="absolute bottom-0 left-[5.25rem] top-0 w-px bg-[var(--line)]" />

                {todayAgenda.map((event) => (
                  <div
                    key={`${event.time}-${event.title}`}
                    className="relative grid gap-4 pb-6 last:pb-0 md:grid-cols-[5.25rem_1fr]"
                  >
                    <div className="pr-4 text-right">
                      <p className="font-display text-[1.18rem] leading-none text-[var(--espresso)]">
                        {event.time}
                      </p>
                      <p className="mt-2 text-[0.5rem] font-medium uppercase tracking-[0.2em] text-[var(--caramel)]">
                        {event.context}
                      </p>
                    </div>

                    <div className="relative pl-6">
                      <span className="absolute left-[-0.28rem] top-2 h-2.5 w-2.5 rounded-full border border-[var(--paper-2)] bg-[var(--caramel)]" />

                      <div className="rounded-[3px] border border-[var(--line)] bg-[rgba(255,251,245,0.62)] px-5 py-4 shadow-[0_18px_40px_rgba(36,23,17,0.04)]">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[0.98rem] font-medium text-[var(--espresso)]">
                              {event.title}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                              Outfit need: {event.outfitNeed}.
                            </p>
                          </div>

                          <span className="w-fit rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.52rem] font-medium uppercase tracking-[0.18em] text-[var(--coffee)]">
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

      <section className="grid gap-8 border-b border-[var(--line)] py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)]">
          <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
            <div
              className="relative min-h-[26rem] overflow-hidden border-b border-[var(--line)] md:border-b-0 md:border-r"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,251,245,0.95) 0%, rgba(246,236,220,0.68) 100%)",
              }}
            >
              <div className="absolute right-5 top-5 rounded-full bg-[rgba(251,246,238,0.88)] px-3 py-2 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)]">
                Today&apos;s look
              </div>

              {todayOutfit.pieces.slice(0, 5).map((piece) => (
                <div
                  key={piece.id}
                  className="absolute rounded-[26px] bg-[rgba(148,113,77,0.16)] shadow-[0_20px_40px_rgba(36,23,17,0.06)]"
                  style={{
                    top: piece.top,
                    left: piece.left,
                    width: piece.width,
                    height: piece.height,
                    transform: `rotate(${piece.rotate ?? 0}deg)`,
                  }}
                >
                  <div className="absolute inset-3 rounded-[20px] border border-white/40" />
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <span className="font-display text-[1rem] leading-tight text-[rgba(36,23,17,0.55)]">
                      {piece.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-7 py-7">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[var(--caramel)]">
                Outfit of today
              </p>

              <h2 className="font-display mt-4 text-[2.65rem] leading-[1.02] text-[var(--espresso)]">
                {todayOutfit.title}
              </h2>

              <p className="mt-4 text-[0.98rem] leading-7 text-[var(--ink-soft)]">
                {todayOutfit.caption}
              </p>

              <div className="mt-6 border-y border-[var(--line)] py-4">
                <p className="mb-3 text-[0.55rem] font-medium uppercase tracking-[0.22em] text-[var(--caramel)]">
                  Formula
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {todayOutfit.formula.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[var(--coffee)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <p className="font-display mt-5 text-[1.05rem] italic leading-[1.5] text-[var(--coffee)]">
                {todayOutfit.notes}
              </p>

              <div className="mt-7 flex flex-wrap gap-5 border-t border-[var(--line)] pt-5">
                <Link
                  href="/outfits"
                  className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
                >
                  Open board
                </Link>

                <Link
                  href="/planner"
                  className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
                >
                  Add to log
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7">
          <p className="eyebrow mb-3">Closet Intelligence</p>

          <h2 className="font-display text-[2.4rem] leading-none text-[var(--espresso)]">
            What needs attention
          </h2>

          <div className="mt-6 space-y-5">
            {closetGaps.map((gap) => (
              <div key={gap.title} className="border-t border-[var(--line)] pt-4">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                  {gap.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {gap.detail}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/wishlist"
            className="mt-7 inline-block border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Review gaps
          </Link>
        </aside>
      </section>

      <section className="grid gap-5 py-10 md:grid-cols-3">
        {wardrobeStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7 no-underline transition duration-300 hover:-translate-y-1 hover:shadow-soft"
          >
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
              {stat.label}
            </p>

            <p className="font-display mt-5 text-6xl leading-none text-[var(--espresso)]">
              {String(stat.value).padStart(2, "0")}
            </p>

            <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
              {stat.note}
            </p>

            <span className="mt-6 inline-block border-b-[1.5px] border-transparent pb-[3px] text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] transition group-hover:border-[var(--coffee)]">
              Open section
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
