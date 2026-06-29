---
name: ICS all-day events and timezone drift
description: All-day ICS events render one day early in negative-UTC timezones unless date is anchored by UTC y/m/d components
---

# ICS all-day events / timezone drift

node-ical parses an all-day event (`DTSTART;VALUE=DATE:YYYYMMDD`) as UTC midnight (e.g. `2026-07-04T00:00:00.000Z`) and sets `start.dateOnly = true`. When a client in a negative-UTC timezone (e.g. Puerto Rico, UTC-4) does `new Date(iso)` and reads local y/m/d, the event shifts one day earlier (Jul 4 → Jul 3).

**Fix:** for all-day events only, rebuild a local Date from the UTC components: `new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())`. Do NOT apply this to timed events — they must keep their real instant.

**Why:** preserves the intended calendar date regardless of the viewer's timezone.

**How to apply:** anywhere all-day ICS dates are compared/displayed by calendar day. Note: ICS all-day `DTEND` is exclusive — multi-day all-day events cover `[start, end)`; matching only `start` shows them on the first day only (acceptable when feeds only have single-day all-day events).
