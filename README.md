# The Stephanie Edit — Closet OS

A private, single-user wardrobe operating system. Keeps track of what you own, what you want, and what to wear — built around real Supabase data with a warm, editorial design.

---

## What it is

The Edit is a personal wardrobe app that combines:

- **Closet** — a full catalog of owned items with categories, colors, sizing, scores, and photo support.
- **Wishlist** — a curated list of items to buy, with price tracking.
- **Home dashboard** — a daily-greeting header, live weather, and an upcoming-events feed from Apple Calendar.
- **Planner** — outfit-planning view. Currently in preview; uses a static mock outfit log.

This is a private tool, not a multi-user SaaS product. There is no login system.

---

## Feature status

| Feature | Status |
|---|---|
| Closet — view active items | Live (real Supabase data) |
| Closet — archive / donate / sell | Live |
| Closet — photo upload | Live (Supabase Storage, signed URLs) |
| Wishlist — view items | Live (real Supabase data) |
| Wishlist — signed image URLs | Live (wishlist-items bucket) |
| Home — greeting + weather | Live (client-side, geolocation) |
| Home — calendar events | Live (Apple Calendar ICS, requires env vars) |
| Planner | Preview (mock data, not connected to closet) |
| Outfit saving | API exists; UI is not wired |

---

## Stack

- **Framework** — Next.js 16.2.9 (App Router, TypeScript)
- **Styling** — Tailwind CSS v4
- **Database + Storage** — Supabase (PostgreSQL + Storage buckets)
- **Calendar** — node-ical, fetching Apple Calendar ICS feeds
- **Runtime** — Node.js

---

## Local setup

1. **Clone the repo and install dependencies**

```bash
npm install
```

2. **Create `.env.local`** (copy from `.env.example` and fill in values)

```bash
cp .env.example .env.local
# then edit .env.local
```

3. **Run the dev server**

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000). The `predev` hook runs `sync:closet-photos` automatically before starting.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run sync:closet-photos` | Copy `data/closet-photos/` → `public/` (runs automatically before dev and build) |

---

## Environment variables

See `.env.example` for the full annotated list. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `THE_EDIT_API_SECRET` | No | Optional header secret for mutable API routes |
| `APPLE_CALENDAR_ICS_URL` | No | Primary personal calendar ICS feed |
| `APPLE_HOLIDAYS_ICS_URL` | No | Holidays calendar ICS feed |
| `APPLE_WORKOUTS_ICS_URL` | No | Workouts calendar ICS feed |

`APPLE_BERLITZ_ICS_URL` is accepted as a legacy fallback for the personal calendar URL.

---

## Supabase notes

### Storage buckets

| Bucket | Used for |
|---|---|
| `closet-items` | Wardrobe item photos (private, signed URLs) |
| `wishlist-items` | Wishlist item images (private, signed URLs) |
| `outfit-looks` | Outfit look images (reserved) |
| `profile` | Profile images (reserved) |

Signed URLs are generated server-side with a 1-hour expiry. They are not persisted — every page load fetches fresh URLs.

### Key tables

- `wardrobe_items` — main item catalog. `item_status` controls active/archived/donated/sold/damaged.
- `wardrobe_item_images` — images linked to wardrobe items.
- `wishlist_items` — wishlist entries. `is_archived` controls visibility.
- `wishlist_item_images` — images linked to wishlist items.
- `price_history` — price observations for wishlist items.
- `saved_outfits` — outfit saves. `status = 'deleted'` is a soft delete; GET routes exclude these rows.

---

## Migration notes

Migration SQL lives in `supabase/migrations/`. Apply them in order against your Supabase project using the Supabase CLI or the SQL editor.

The `wardrobe_items` table uses `item_status` (not `is_archived`) to control item lifecycle. Active items have `item_status = 'active'`.

---

## API secret (optional hardening)

If you set `THE_EDIT_API_SECRET` in your environment, all mutable API routes will require a matching `x-the-edit-secret` header:

```
POST   /api/closet/items
PATCH  /api/closet/items/[id]
POST   /api/closet/items/[id]/image
POST   /api/outfits/saved
DELETE /api/outfits/saved
```

Read-only routes (`GET`) are not protected. If the variable is unset, all routes remain open (local dev behavior unchanged).

---

## Calendar layer

The calendar layer fetches events from Apple Calendar ICS feeds using `node-ical`.

**What exists:**
- `src/lib/calendar.ts` — fetches and normalizes events from up to 3 ICS feeds (personal, holidays, workouts).
- `GET /api/calendar` — exposes those events as JSON with optional `start`/`end` query params.
- `CalendarSignal` and `TodayCalendar` components on the home page consume `/api/calendar`.

**What is preview/mock:**
- The **Planner** page does not consume the calendar API. It uses a static mock outfit log. Calendar integration for Planner is not yet built.

---

## Legacy scripts

The following scripts in `scripts/` are **legacy migration tools** and reference columns (`photo_filename`, `drive_photo_path`) that do not exist in the current schema:

- `scripts/upload-closet-photos.mjs` — one-time bulk upload of local photos to Supabase Storage.
- `scripts/audit-closet-photo-matches.mjs` — audits local photos against DB entries.

These scripts are safe to ignore for a fresh setup. For new photo uploads, use the `POST /api/closet/items/[id]/image` route. See each script's header comment for full details.

`scripts/sync-closet-photos.mjs` is **not legacy** — it copies local `data/closet-photos/` into `public/` and runs automatically before dev and build.

---

## What is real vs preview

| | Real data | Preview/mock |
|---|---|---|
| Closet | Yes | |
| Wishlist | Yes | |
| Home calendar | Yes (if env vars set) | Gracefully hides if unset |
| Home weather | Yes (geolocation) | |
| Planner outfit log | | Yes (mock) |
| Outfit saving UI | | Not wired |

---

## Roadmap (not in scope for current sprints)

- Planner connected to real closet + calendar
- Outfit history and wears tracking
- Full outfit save/browse UI
- Mobile-optimized views
- Multi-user / auth layer
