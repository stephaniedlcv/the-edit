import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getWardrobeItems } from "@/lib/wardrobe/data";
import type { WardrobeItem } from "@/types/wardrobe";

function percentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function hasAllScores(item: WardrobeItem) {
  return (
    item.loveScore !== undefined &&
    item.versatilityScore !== undefined &&
    item.fitConfidenceScore !== undefined &&
    item.capsuleValueScore !== undefined
  );
}

function hasPurchaseInfo(item: WardrobeItem) {
  return Boolean(item.paidPrice || item.purchaseSource || item.purchaseDate);
}

function getTopEntries(
  items: WardrobeItem[],
  key: "category" | "colorName" | "colorFamily",
) {
  const counts = items.reduce<Record<string, number>>((accumulator, item) => {
    const value = String(item[key] ?? "Unknown");
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

function getCategoryGaps(activeItems: WardrobeItem[]) {
  const counts = activeItems.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
    return accumulator;
  }, {});

  const expectedCategories = [
    "top",
    "bottom",
    "dress",
    "outerwear",
    "shoes",
    "bag",
    "accessory",
    "jewelry",
  ];

  return expectedCategories
    .map((category) => ({
      category,
      count: counts[category] ?? 0,
    }))
    .sort((a, b) => a.count - b.count);
}

function getHealthLabel(score: number) {
  if (score >= 85) return "Polished";
  if (score >= 65) return "Strong foundation";
  if (score >= 45) return "Needs cleanup";
  return "Data reset needed";
}

function displayColorFamily(label: string) {
  return label.toLowerCase() === "mustard" ? "Yellow" : label;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(46,31,24,0.08)]">
      <div
        className="h-full rounded-full bg-[var(--coffee)]"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default async function ClosetHealthPage() {
  const items = await getWardrobeItems();

  const activeItems = items.filter((item) => (item.itemStatus ?? "active") === "active");
  const archivedItems = items.filter((item) => (item.itemStatus ?? "active") !== "active");

  const missingPhotos = activeItems.filter((item) => !item.imageUrl);
  const missingScores = activeItems.filter((item) => !hasAllScores(item));
  const missingPurchaseInfo = activeItems.filter((item) => !hasPurchaseInfo(item));
  const missingProductLinks = activeItems.filter((item) => !item.productUrl);
  const needsStyling = activeItems.filter(
    (item) =>
      !item.stylingNotes ||
      !item.vibes?.length ||
      !hasAllScores(item) ||
      !item.imageUrl,
  );

  const photoCoverage = percentage(activeItems.length - missingPhotos.length, activeItems.length);
  const scoreCoverage = percentage(activeItems.length - missingScores.length, activeItems.length);
  const purchaseCoverage = percentage(
    activeItems.length - missingPurchaseInfo.length,
    activeItems.length,
  );
  const linkCoverage = percentage(
    activeItems.length - missingProductLinks.length,
    activeItems.length,
  );

  const healthScore = Math.round(
    photoCoverage * 0.3 + scoreCoverage * 0.35 + purchaseCoverage * 0.2 + linkCoverage * 0.15,
  );

  const topCategories = getTopEntries(activeItems, "category");
  const topColors = getTopEntries(activeItems, "colorName");
  const topColorFamilies = getTopEntries(activeItems, "colorFamily");
  const categoryGaps = getCategoryGaps(activeItems);
  const attentionItems = needsStyling.slice(0, 10);

  const actionCards = [
    {
      label: "Score sprint",
      value: missingScores.length,
      note: "Complete Love + Fit first. AI can help later with Versatility + Capsule Value.",
      href: "/closet",
    },
    {
      label: "Purchase cleanup",
      value: missingPurchaseInfo.length,
      note: "Add source, date, and paid price so future cost-per-wear works.",
      href: "/closet",
    },
    {
      label: "Link recovery",
      value: missingProductLinks.length,
      note: "Add product links where possible for easy reference and dupes.",
      href: "/closet",
    },
  ];

  const coverageCards = [
    {
      label: "Photo coverage",
      value: photoCoverage,
      note: `${missingPhotos.length} active pieces need photos.`,
    },
    {
      label: "Score coverage",
      value: scoreCoverage,
      note: `${missingScores.length} pieces need scores.`,
    },
    {
      label: "Purchase info",
      value: purchaseCoverage,
      note: `${missingPurchaseInfo.length} pieces need purchase details.`,
    },
    {
      label: "Product links",
      value: linkCoverage,
      note: `${missingProductLinks.length} pieces need links.`,
    },
  ];

  return (
    <main className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Closet Health"
        title={
          <>
            What works,{" "}
            <em className="text-[var(--coffee)]">what needs attention.</em>
          </>
        }
        description="A live command center for your closet: data quality, styling readiness, color balance, category strength, and cleanup priorities."
        asideEyebrow="System Signal"
        asideText="The intelligence layer for shopping less randomly."
      >
        <div className="flex flex-wrap gap-5">
          <Link
            href="/closet"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Wardrobe Gallery
          </Link>
          <Link
            href="/closet-health"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Closet Health
          </Link>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="relative overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--espresso)] p-8 text-[var(--paper)] shadow-[0_24px_80px_rgba(46,31,24,0.18)]">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-[rgba(255,255,255,0.14)]" />
            <div className="absolute -bottom-24 right-16 h-72 w-72 rounded-full border border-[rgba(255,255,255,0.1)]" />

            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--caramel)]">
              Closet readiness
            </p>
            <p className="mt-8 font-display text-8xl leading-none">{healthScore}</p>
            <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--caramel)]">
              / 100
            </p>
            <h2 className="mt-8 font-display text-4xl leading-tight">
              {getHealthLabel(healthScore)}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[rgba(255,248,237,0.76)]">
              Your closet has {activeItems.length} active pieces. The biggest unlock
              right now is completing scores and purchase data so the system can make
              smarter outfit and shopping decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-[rgba(255,255,255,0.1)] px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em]">
                {activeItems.length} active
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.1)] px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em]">
                {archivedItems.length} archived
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.1)] px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em]">
                {needsStyling.length} need cleanup
              </span>
            </div>
          </article>

          <div className="grid gap-5 sm:grid-cols-2">
            {coverageCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(46,31,24,0.1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                      {card.label}
                    </p>
                    <p className="mt-4 font-display text-5xl leading-none text-[var(--espresso)]">
                      {card.value}%
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--line)] px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]">
                    Live
                  </span>
                </div>
                <ProgressBar value={card.value} />
                <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                  {card.note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {actionCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-6 no-underline transition hover:-translate-y-1 hover:bg-[var(--paper)] hover:shadow-[0_18px_50px_rgba(46,31,24,0.1)]"
            >
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                This week’s focus
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <h3 className="font-display text-3xl leading-none text-[var(--espresso)]">
                  {card.label}
                </h3>
                <p className="font-display text-5xl leading-none text-[var(--coffee)]">
                  {card.value}
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                {card.note}
              </p>
              <p className="mt-6 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--espresso)]">
                Open closet →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
            <p className="eyebrow mb-3">Category balance</p>
            <h2 className="font-display text-4xl text-[var(--espresso)]">
              Weakest categories
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              These are the areas that will limit outfit variety first.
            </p>

            <div className="mt-7 space-y-4">
              {categoryGaps.slice(0, 6).map((entry) => {
                const maxCount = Math.max(...categoryGaps.map((gap) => gap.count), 1);
                const barValue = percentage(entry.count, maxCount);

                return (
                  <div key={entry.category}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm capitalize text-[var(--ink-soft)]">
                        {entry.category}
                      </p>
                      <p className="text-sm font-semibold text-[var(--espresso)]">
                        {entry.count} pieces
                      </p>
                    </div>
                    <ProgressBar value={barValue} />
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
            <p className="eyebrow mb-3">Color story</p>
            <h2 className="font-display text-4xl text-[var(--espresso)]">
              Dominant palette
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              This shows why some outfits feel easy and others feel repetitive.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {topColorFamilies.map(([label, count]) => (
                <div
                  key={label}
                  className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm capitalize text-[var(--ink-soft)]">
                      {displayColorFamily(label)}
                    </p>
                    <p className="text-sm font-semibold text-[var(--espresso)]">
                      {count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
            <p className="eyebrow mb-3">Top categories</p>
            <div className="mt-5 space-y-4">
              {topCategories.map(([label, count]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[var(--line)] pb-3">
                  <span className="text-sm capitalize text-[var(--ink-soft)]">
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-[var(--espresso)]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
            <p className="eyebrow mb-3">Top colors</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {topColors.map(([label, count]) => (
                <span
                  key={label}
                  className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink-soft)]"
                >
                  {label} <strong className="text-[var(--espresso)]">{count}</strong>
                </span>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-8 rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-3">Needs attention</p>
              <h2 className="font-display text-4xl text-[var(--espresso)]">
                Cleanup queue
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Start here when you have 10 minutes. Every cleanup makes future outfit logic smarter.
              </p>
            </div>
            <Link
              href="/closet"
              className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)] no-underline"
            >
              Open closet →
            </Link>
          </div>

          {attentionItems.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {attentionItems.map((item) => {
                const reasons = [
                  !item.imageUrl ? "photo" : null,
                  !hasAllScores(item) ? "scores" : null,
                  !item.vibes?.length ? "vibes" : null,
                  !item.stylingNotes ? "styling notes" : null,
                ].filter(Boolean);

                return (
                  <div
                    key={item.id}
                    className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(46,31,24,0.08)]"
                  >
                    <p className="font-display text-2xl text-[var(--espresso)]">
                      {item.name}
                    </p>
                    <p className="mt-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                      {item.category} · {item.colorName}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-[var(--paper-2)] px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-[var(--ink-soft)]">
              Everything active has the core styling data completed.
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
