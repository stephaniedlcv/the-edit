"use client";

import { useEffect, useState } from "react";

type CalEvent = {
  id: string;
  title: string;
  category: string;
  start: string;
  end: string;
  allDay: boolean;
};

const CATEGORY_STYLE: Record<string, { dot: string; bg: string; text: string }> = {
  personal: { dot: "#3E6B96", bg: "rgba(62,107,150,0.1)", text: "#3E6B96" },
  workout:  { dot: "#B85450", bg: "rgba(184,84,80,0.1)",  text: "#B85450" },
  holiday:  { dot: "#D6A93D", bg: "rgba(214,169,61,0.12)", text: "#B8920A" },
};

function formatHour(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).toLowerCase().replace(":00", "").replace(" ", "");
}

function isSameCalendarDay(isoStr: string): boolean {
  const d = new Date(isoStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function generateInstruction(events: CalEvent[]): string {
  if (events.length === 0) {
    return "Open day — no calendar signals. Dress freely, intentionally.";
  }

  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const hasWork = sorted.some((e) => e.category === "personal");
  const hasGym = sorted.some((e) => e.category === "workout");
  const hasHoliday = sorted.some((e) => e.category === "holiday");

  const firstWork = sorted.find((e) => e.category === "personal");
  const firstGym = sorted.find((e) => e.category === "workout");

  const gymBeforeWork =
    hasGym &&
    hasWork &&
    firstGym &&
    firstWork &&
    firstGym.start < firstWork.start;

  const workBeforeGym =
    hasGym &&
    hasWork &&
    firstGym &&
    firstWork &&
    firstWork.start <= firstGym.start;

  if (gymBeforeWork) {
    return "Morning gym first, then your work block. Two distinct looks — log them separately.";
  }
  if (workBeforeGym) {
    return "Work block first, then gym after. Pack your gym bag ready to go.";
  }
  if (hasWork) {
    return "Work day. Dress structured, professional, breathable for the heat.";
  }
  if (hasGym) {
    return "Active day. Intentional athleisure — comfort without sacrificing the look.";
  }
  if (hasHoliday) {
    return "Holiday today. Relaxed but still considered — your style has no days off.";
  }

  const eventCount = events.length;
  return `${eventCount} event${eventCount > 1 ? "s" : ""} today. Let the schedule shape the outfit.`;
}

export function CalendarSignal() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data: { events?: CalEvent[] }) => {
        const todayEvents = (data.events ?? [])
          .filter((e) => !e.allDay && isSameCalendarDay(e.start))
          .sort((a, b) => a.start.localeCompare(b.start));
        setEvents(todayEvents);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const instruction = generateInstruction(events);

  return (
    <aside className="rounded-[2px] bg-[var(--paper-2)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      <p className="eyebrow mb-4">Calendar Signal</p>

      <h2 className="font-display text-[2.2rem] leading-none text-[var(--espresso)]">
        Today&apos;s calendar
      </h2>

      <p className="mt-4 text-[0.88rem] leading-[1.8] text-[var(--ink-soft)]">
        This is the Apple Calendar layer — it tells the system what kind of
        outfit the day actually needs.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {loading ? (
          <div className="h-6 w-32 animate-pulse rounded-full bg-[var(--line)]" />
        ) : events.length === 0 ? (
          <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)]">
            No events today
          </span>
        ) : (
          events.map((e) => {
            const style = CATEGORY_STYLE[e.category] ?? CATEGORY_STYLE.personal;
            return (
              <span
                key={e.id}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: style.dot }}
                />
                {formatHour(e.start)} · {e.title}
              </span>
            );
          })
        )}
      </div>

      <div className="mt-7 border-t border-[var(--line)] pt-5">
        <p className="eyebrow mb-3">AI instruction</p>
        {loading ? (
          <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--line)]" />
        ) : (
          <p className="font-display text-[1.05rem] italic leading-[1.5] text-[var(--coffee)]">
            {instruction}
          </p>
        )}
      </div>
    </aside>
  );
}
