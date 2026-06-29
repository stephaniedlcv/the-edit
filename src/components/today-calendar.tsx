"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  location: string | null;
  start: string;
  end: string;
  allDay: boolean;
};

type ApiResult =
  | { configured: false; events: [] }
  | { configured: true; events: CalendarEvent[] };

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; configured: boolean; events: CalendarEvent[] };

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 56;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekDays(reference: Date): Date[] {
  const ref = startOfDay(reference);
  const dow = (ref.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(d: Date): string {
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase()
    .replace(" ", "");
}

const EXAMPLE_EVENTS: { title: string; location: string; start: string; end: string }[] = [
  { title: "Work / Berlitz", location: "Office", start: "09:00", end: "12:00" },
  { title: "Lunch + errands", location: "Old San Juan", start: "12:30", end: "13:30" },
  { title: "Gym / active block", location: "Studio", start: "18:00", end: "19:15" },
];

export function TodayCalendar() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));

  const weekDays = useMemo(() => getWeekDays(today), [today]);

  useEffect(() => {
    let cancelled = false;
    const rangeStart = weekDays[0];
    const rangeEnd = new Date(weekDays[6]);
    rangeEnd.setHours(23, 59, 59, 999);

    fetch(
      `/api/calendar?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json() as Promise<ApiResult>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: "ready",
          configured: data.configured,
          events: data.events ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [weekDays]);

  const usingExample =
    state.status === "ready" && (!state.configured || state.events.length === 0);

  const parsedEvents = useMemo(() => {
    if (state.status !== "ready") return [];
    if (usingExample) {
      return EXAMPLE_EVENTS.map((e, i) => {
        const [sh, sm] = e.start.split(":").map(Number);
        const [eh, em] = e.end.split(":").map(Number);
        const s = startOfDay(today);
        s.setHours(sh, sm);
        const en = startOfDay(today);
        en.setHours(eh, em);
        return {
          id: `example-${i}`,
          title: e.title,
          location: e.location,
          start: s,
          end: en,
          allDay: false,
        };
      });
    }
    return state.events.map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      start: new Date(e.start),
      end: new Date(e.end),
      allDay: e.allDay,
    }));
  }, [state, usingExample, today]);

  const eventDays = useMemo(() => {
    const set = new Set<string>();
    parsedEvents.forEach((e) => set.add(startOfDay(e.start).toDateString()));
    return set;
  }, [parsedEvents]);

  const selectedDay = usingExample ? startOfDay(today) : selected;

  const dayEvents = useMemo(
    () =>
      parsedEvents
        .filter((e) => !e.allDay && sameDay(e.start, selectedDay))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    [parsedEvents, selectedDay],
  );

  const allDayEvents = useMemo(
    () => parsedEvents.filter((e) => e.allDay && sameDay(e.start, selectedDay)),
    [parsedEvents, selectedDay],
  );

  const { startHour, endHour } = useMemo(() => {
    let min = 8;
    let max = 20;
    dayEvents.forEach((e) => {
      min = Math.min(min, e.start.getHours());
      max = Math.max(max, e.end.getHours() + (e.end.getMinutes() > 0 ? 1 : 0));
    });
    return { startHour: Math.max(0, min), endHour: Math.min(24, Math.max(max, min + 4)) };
  }, [dayEvents]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const timelineHeight = (endHour - startHour) * HOUR_HEIGHT;

  const nowOffset = useMemo(() => {
    if (!sameDay(selectedDay, new Date())) return null;
    const now = new Date();
    const minutes = (now.getHours() - startHour) * 60 + now.getMinutes();
    if (minutes < 0 || minutes > (endHour - startHour) * 60) return null;
    return (minutes / 60) * HOUR_HEIGHT;
  }, [selectedDay, startHour, endHour]);

  const monthLabel = selectedDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const fullDateLabel = selectedDay.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-[12px] bg-[var(--paper-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(36,26,18,0.05),0_16px_44px_rgba(36,26,18,0.08)]">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
        <div>
          <p className="eyebrow mb-2">{monthLabel}</p>
          <p className="font-display text-[1.5rem] leading-none text-[var(--espresso)]">
            {fullDateLabel}
          </p>
        </div>
        <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--coffee)]">
          {usingExample ? "Example" : "Apple Calendar"}
        </span>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 border-b border-[var(--line)]">
        {weekDays.map((day, index) => {
          const isToday = sameDay(day, new Date());
          const isSelected = sameDay(day, selectedDay);
          const hasEvents = eventDays.has(day.toDateString());
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !usingExample && setSelected(startOfDay(day))}
              className={[
                "group flex flex-col items-center gap-1 border-r border-[var(--line)] px-1 py-3 text-center transition-colors last:border-r-0",
                isSelected ? "bg-[rgba(161,122,53,0.1)]" : "hover:bg-[rgba(36,26,18,0.03)]",
                usingExample ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                {DAY_LABELS[index]}
              </span>
              <span
                className={[
                  "font-display flex h-8 w-8 items-center justify-center rounded-full text-[1.15rem] leading-none transition-colors",
                  isToday
                    ? "bg-[var(--gold)] text-white"
                    : isSelected
                      ? "text-[var(--espresso)]"
                      : "text-[var(--caramel)]",
                ].join(" ")}
              >
                {day.getDate()}
              </span>
              <span
                className={[
                  "h-1 w-1 rounded-full transition-colors",
                  hasEvents ? "bg-[var(--gold)]" : "bg-transparent",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>

      {/* States */}
      {state.status === "loading" ? (
        <div className="px-6 py-10 text-center text-[0.85rem] text-[var(--ink-soft)]">
          Loading your calendar…
        </div>
      ) : state.status === "error" ? (
        <div className="px-6 py-10 text-center text-[0.85rem] text-[var(--ink-soft)]">
          Could not reach your calendar feed. Check the published link and try again.
        </div>
      ) : (
        <>
          {usingExample ? (
            <div className="border-b border-[var(--line)] bg-[rgba(161,122,53,0.06)] px-6 py-3 text-[0.72rem] leading-[1.6] text-[var(--coffee)]">
              {state.configured
                ? "No events on your calendar this week — showing an example day."
                : "Showing example events. Connect your Apple Calendar to see your real day."}
            </div>
          ) : null}

          {allDayEvents.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-b border-[var(--line)] px-6 py-3">
              {allDayEvents.map((e) => (
                <span
                  key={e.id}
                  className="rounded-md bg-[rgba(161,122,53,0.12)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--espresso)]"
                >
                  {e.title}
                </span>
              ))}
            </div>
          ) : null}

          {/* Day timeline */}
          <div className="px-4 py-4">
            <div className="relative" style={{ height: timelineHeight }}>
              {/* hour grid */}
              {hours.map((hour, i) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start"
                  style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <span className="w-14 shrink-0 pr-3 text-right text-[0.6rem] font-medium uppercase tracking-[0.06em] text-[var(--caramel)]">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </span>
                  <span className="mt-[0.45rem] h-px flex-1 bg-[var(--line)]" />
                </div>
              ))}

              {/* now line */}
              {nowOffset !== null ? (
                <div
                  className="absolute left-14 right-0 z-20 flex items-center"
                  style={{ top: nowOffset }}
                >
                  <span className="h-2 w-2 -ml-1 rounded-full bg-[#C0392B]" />
                  <span className="h-px flex-1 bg-[#C0392B]" />
                </div>
              ) : null}

              {/* events */}
              {dayEvents.length === 0 ? (
                <div className="absolute left-14 right-0 top-1/2 -translate-y-1/2 text-center text-[0.82rem] italic text-[var(--ink-soft)]">
                  Nothing scheduled — an open, easy styling day.
                </div>
              ) : (
                dayEvents.map((e) => {
                  const startMin =
                    (e.start.getHours() - startHour) * 60 + e.start.getMinutes();
                  const endMin =
                    (e.end.getHours() - startHour) * 60 + e.end.getMinutes();
                  const top = (startMin / 60) * HOUR_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 30);
                  return (
                    <div
                      key={e.id}
                      className="absolute left-14 right-1 z-10 overflow-hidden rounded-[6px] border-l-[3px] border-[var(--gold)] bg-[rgba(161,122,53,0.1)] px-3 py-1.5"
                      style={{ top, height }}
                    >
                      <p className="truncate text-[0.78rem] font-semibold leading-tight text-[var(--espresso)]">
                        {e.title}
                      </p>
                      <p className="truncate text-[0.66rem] leading-tight text-[var(--coffee)]">
                        {formatTime(e.start)}
                        {e.location ? ` · ${e.location}` : ""}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
