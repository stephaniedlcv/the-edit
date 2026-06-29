import { PageHeader } from "@/components/page-header";
import {
  outfitLogStats,
  outfitLogWeek,
  type OutfitLogStatus,
} from "@/lib/mock-outfit-log";

const modeStats = [
  {
    value: "Week",
    label: "Current view",
    note: "Best default for planning looks and avoiding repeat formulas.",
  },
  {
    value: String(outfitLogStats.planned).padStart(2, "0"),
    label: "Planned",
    note: "Looks already assigned to this week.",
  },
  {
    value: String(outfitLogStats.open).padStart(2, "0"),
    label: "Need styling",
    note: "Days that still need an outfit decision.",
  },
];

function getStatusLabel(status: OutfitLogStatus) {
  if (status === "planned") return "Planned";
  if (status === "worn") return "Worn";
  if (status === "skipped") return "Skipped";
  return "Open";
}

function getStatusClasses(status: OutfitLogStatus) {
  if (status === "planned") {
    return "border-[var(--coffee)] bg-[rgba(124,83,58,0.08)] text-[var(--espresso)]";
  }

  if (status === "worn") {
    return "border-[rgba(88,111,78,0.35)] bg-[rgba(88,111,78,0.1)] text-[var(--espresso)]";
  }

  if (status === "skipped") {
    return "border-[var(--line)] bg-[var(--paper)] text-[var(--ink-soft)]";
  }

  return "border-dashed border-[var(--caramel)] bg-[var(--paper-2)] text-[var(--coffee)]";
}

export default function PlannerPage() {
  return (
    <main className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Planner"
        title={
          <>
            Wear it,{" "}
            <em className="text-[var(--coffee)]">then track it.</em>
          </>
        }
        description="A calendar-based planner for planning looks, recording what you wore, and avoiding repeat formulas when you want variety."
        asideEyebrow="Calendar Mode"
        asideText="Week view is the default command center for Planner v1."
      />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {modeStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[0_0_0_1px_rgba(26,16,8,0.05),0_16px_50px_rgba(26,16,8,0.06)]"
            >
              <p className="font-display text-[4.5rem] leading-none text-[var(--espresso)]">
                {stat.value}
              </p>
              <p className="mt-5 eyebrow">{stat.label}</p>
              <p className="mt-3 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
                {stat.note}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-6">
          <div>
            <p className="eyebrow mb-3">Week of June 22</p>
            <h2 className="font-display text-[2.2rem] leading-none text-[var(--espresso)] md:text-4xl">
              Outfit calendar
            </h2>
          </div>
          <p className="max-w-xl text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
            Tracks outfit need, formula, weather signal, and repeat warning per day.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:gap-5">
          {outfitLogWeek.map((entry) => (
            <article
              key={entry.id}
              className="grid gap-5 rounded-[2px] bg-[var(--paper-2)] p-5 shadow-[0_0_0_1px_rgba(26,16,8,0.05),0_16px_50px_rgba(26,16,8,0.06)] md:grid-cols-[9rem_1fr_16rem]"
            >
              <div>
                <p className="eyebrow mb-2">{entry.date}</p>
                <h3 className="font-display mt-2 text-[2.4rem] leading-none text-[var(--espresso)]">
                  {entry.day}
                </h3>
                <span
                  className={`mt-5 inline-flex rounded-full border px-3 py-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.2em] ${getStatusClasses(
                    entry.status,
                  )}`}
                >
                  {getStatusLabel(entry.status)}
                </span>
              </div>

              <div>
                <p className="eyebrow mb-2">{entry.outfitNeed}</p>
                <h4 className="font-display mt-2 text-[1.85rem] leading-none text-[var(--espresso)]">
                  {entry.title}
                </h4>
                <p className="mt-4 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
                  {entry.notes}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.formula.map((piece) => (
                    <span
                      key={piece}
                      className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)]"
                    >
                      {piece}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="rounded-[2px] bg-[var(--paper)] p-5 shadow-[inset_0_0_0_1px_rgba(26,16,8,0.05)]">
                <p className="eyebrow mb-3">Weather signal</p>
                <p className="text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
                  {entry.weatherNote}
                </p>

                <div className="my-5 h-px bg-[var(--line)]" />

                <p className="eyebrow mb-3">Repeat check</p>
                <p className="text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
                  {entry.repeatSignal}
                </p>
              </aside>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
