import "server-only";
import ical from "node-ical";

export type CalendarCategory = "personal" | "holiday" | "workout";

export type CalendarEvent = {
  id: string;
  title: string;
  location: string | null;
  start: string;
  end: string;
  allDay: boolean;
  category: CalendarCategory;
};

type CalendarSource = {
  url: string;
  category: CalendarCategory;
};

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  const normalized = trimmed.startsWith("webcal://")
    ? "https://" + trimmed.slice("webcal://".length)
    : trimmed;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Invalid calendar URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Calendar URL must use https or webcal");
  }
  return parsed.toString();
}

function getDurationMs(ev: ical.VEvent): number {
  const start = ev.start as Date;
  const end = ev.end as Date;
  if (start && end) {
    return end.getTime() - start.getTime();
  }
  return 60 * 60 * 1000;
}

function isAllDay(ev: ical.VEvent): boolean {
  const start = ev.start as Date & { dateOnly?: boolean };
  return Boolean(start?.dateOnly);
}

export type CalendarResult =
  | { configured: false; events: [] }
  | { configured: true; events: CalendarEvent[] };

async function fetchSourceEvents(
  source: CalendarSource,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<CalendarEvent[]> {
  const data = await ical.async.fromURL(source.url);
  const events: CalendarEvent[] = [];
  const { category } = source;

  for (const key of Object.keys(data)) {
    const item = data[key];
    if (!item || item.type !== "VEVENT") continue;
    const ev = item as ical.VEvent;

    const title = (ev.summary || "Untitled").toString();
    const location = ev.location ? ev.location.toString() : null;
    const allDay = isAllDay(ev);
    const durationMs = getDurationMs(ev);

    if (ev.rrule) {
      const occurrences = ev.rrule.between(rangeStart, rangeEnd, true);

      const exdates = new Set<number>();
      if (ev.exdate) {
        for (const exKey of Object.keys(ev.exdate)) {
          const exDate = ev.exdate[exKey] as Date;
          if (exDate) exdates.add(exDate.getTime());
        }
      }

      for (const occ of occurrences) {
        const occMs = occ.getTime();
        if (exdates.has(occMs)) continue;

        const override =
          ev.recurrences && ev.recurrences[occ.toISOString().slice(0, 10)];
        if (override) {
          const oStart = override.start as Date;
          const oEnd = override.end as Date;
          events.push({
            id: `${category}-${key}-${occMs}`,
            title: (override.summary || title).toString(),
            location: override.location ? override.location.toString() : location,
            start: oStart.toISOString(),
            end: (oEnd || new Date(oStart.getTime() + durationMs)).toISOString(),
            allDay,
            category,
          });
          continue;
        }

        events.push({
          id: `${category}-${key}-${occMs}`,
          title,
          location,
          start: occ.toISOString(),
          end: new Date(occMs + durationMs).toISOString(),
          allDay,
          category,
        });
      }
      continue;
    }

    const start = ev.start as Date;
    const end = (ev.end as Date) || new Date(start.getTime() + durationMs);
    if (!start) continue;

    if (end.getTime() > rangeStart.getTime() && start.getTime() < rangeEnd.getTime()) {
      events.push({
        id: `${category}-${key}`,
        title,
        location,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay,
        category,
      });
    }
  }

  return events;
}

export async function getCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<CalendarResult> {
  const sources: CalendarSource[] = [];

  const personalUrl = process.env.APPLE_BERLITZ_ICS_URL ?? process.env.APPLE_CALENDAR_ICS_URL;
  if (personalUrl) {
    sources.push({ url: normalizeUrl(personalUrl), category: "personal" });
  }

  const holidayUrl = process.env.APPLE_HOLIDAYS_ICS_URL;
  if (holidayUrl) {
    sources.push({ url: normalizeUrl(holidayUrl), category: "holiday" });
  }

  const workoutUrl = process.env.APPLE_WORKOUTS_ICS_URL;
  if (workoutUrl) {
    sources.push({ url: normalizeUrl(workoutUrl), category: "workout" });
  }

  if (sources.length === 0) {
    return { configured: false, events: [] };
  }

  const grouped = await Promise.allSettled(
    sources.map((source) => fetchSourceEvents(source, rangeStart, rangeEnd)),
  );

  const events: CalendarEvent[] = [];
  let anyFulfilled = false;
  grouped.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      anyFulfilled = true;
      events.push(...outcome.value);
    } else {
      console.error(
        `Calendar source "${sources[i].category}" failed:`,
        outcome.reason,
      );
    }
  });

  if (!anyFulfilled) {
    throw new Error("All calendar sources failed");
  }

  events.sort((a, b) => a.start.localeCompare(b.start));
  return { configured: true, events };
}
