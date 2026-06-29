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
        <div className="grid gap-5 md:grid-cols-3">
          {modeStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7"
            >
              <p className="font-display text-5xl leading-none text-[var(--espresso)]">
                {stat.value}
              </p>
              <p className="mt-5 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[var(--caramel)]">
                {stat.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {stat.note}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-6">
          <div>
            <p className="eyebrow">Week of June 22</p>
            <h2 className="font-display mt-3 text-4xl text-[var(--espresso)]">
              Outfit calendar
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
            This first version tracks the outfit need, formula, weather signal,
            and repeat warning for each day. Later this will connect to Apple
            Calendar and real worn history.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {outfitLogWeek.map((entry) => (
            <article
              key={entry.id}
              className="grid gap-5 rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] p-5 md:grid-cols-[9rem_1fr_16rem]"
            >
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--caramel)]">
                  {entry.date}
                </p>
                <h3 className="font-display mt-2 text-3xl leading-none text-[var(--espresso)]">
                  {entry.day}
                </h3>
                <span
                  className={`mt-5 inline-flex rounded-full border px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                    entry.status,
                  )}`}
                >
                  {getStatusLabel(entry.status)}
                </span>
              </div>

              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
                  {entry.outfitNeed}
                </p>
                <h4 className="font-display mt-2 text-[2rem] leading-none text-[var(--espresso)]">
                  {entry.title}
                </h4>
                <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                  {entry.notes}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.formula.map((piece) => (
                    <span
                      key={piece}
                      className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--coffee)]"
                    >
                      {piece}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="rounded-[4px] border border-[var(--line)] bg-[var(--paper)] p-5">
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Weather signal
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {entry.weatherNote}
                </p>

                <div className="my-5 h-px bg-[var(--line)]" />

                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                  Repeat check
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
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
