# Cromática — Auth Strategy

**Branch:** `cromatica-v1`  
**Date:** July 2026  
**Status:** Audit complete — no code changed.

---

## 1. Current State

### 1.1 Auth mechanism

`src/lib/api/auth.ts` implements a shared-secret check:

- Reads `THE_EDIT_API_SECRET` from the server environment.
- Reads the `x-the-edit-secret` request header.
- If the env var is **not set** → allows the request (local dev bypass).
- If header matches the secret → allows.
- Otherwise → returns `401 Unauthorized`.

### 1.2 Route protection map

| Route | Method | `getApiSecretError`? | Notes |
|---|---|---|---|
| `POST /api/closet/items` | POST | ✅ Called | Client sends no secret header → effectively open |
| `PATCH /api/closet/items/[id]` | PATCH | ✅ Called | Same |
| `POST /api/closet/items/[id]/image` | POST | ✅ Called | Same |
| `POST /api/outfits/saved` | POST | ✅ Called | Same |
| `DELETE /api/outfits/saved` | DELETE | ✅ Called | Same |
| `GET /api/outfits/saved` | GET | ❌ Not called | Reads all saved outfits — fully open |
| `POST /api/wishlist/items` | POST | ❌ Not called | Mutable write — fully open |
| `GET /api/calendar` | GET | ❌ Not called | Reads calendar ICS data — fully open |

### 1.3 Critical finding: the frontend never sends the secret

Every client component that calls the API sends only `Content-Type: application/json` — **none send `x-the-edit-secret`**:

| Component | Endpoint called | Secret header sent? |
|---|---|---|
| `closet-item-edit-form.tsx` | `POST/PATCH /api/closet/items[/id]` | ❌ No |
| `closet-item-lifecycle-action.tsx` | `PATCH /api/closet/items/[id]` | ❌ No |
| `add-piece-client.tsx` | `POST /api/closet/items/[id]/image` | ❌ No |
| `add-wishlist-client.tsx` | `POST /api/wishlist/items` | ❌ No |
| `saved-outfit-actions.tsx` | `POST/DELETE /api/outfits/saved` | ❌ No |

### 1.4 Effective state in production

Because `THE_EDIT_API_SECRET` is documented as optional and commented out in `.env.example`, and because the frontend never sends the header, there are only two consistent production states:

| `THE_EDIT_API_SECRET` env var | Actual result |
|---|---|
| **Not set** (current assumption) | All routes open — `getApiSecretError` returns `null` for everyone |
| **Set** | All protected routes return `401` for all clients — app breaks entirely |

The auth system is currently a no-op.

---

## 2. Risks

### High

- **All mutable API routes are open** to any HTTP client that can reach the deployed URL. Anyone who discovers the URL can POST closet items, PATCH existing items, DELETE outfits, or write wishlist items.
- **All read routes are open** — saved outfits and calendar data are readable without any credentials.

### Medium

- The `THE_EDIT_API_SECRET` mechanism is **unfixable as a client-side pattern**: a shared secret stored in a `NEXT_PUBLIC_*` env var is visible in the browser's network tab and source maps. It offers the appearance of security, not real protection.
- The "local dev bypass" (`if (!secret) return null`) means a misconfigured production deployment (env var accidentally unset) silently opens all routes.

### Low (contextual)

- This is a **private personal app** — the URL is not publicly advertised. Security-by-obscurity is the current de facto layer.
- Supabase's own `SUPABASE_SERVICE_ROLE_KEY` is server-only (`import "server-only"`), so raw DB credentials are not exposed to the browser even if the API routes are open.

---

## 3. Recommendation: Supabase Auth with a single personal account

**For a private personal wardrobe OS, this is the right solution.**

### How it works

1. Enable Supabase Auth (email + password, or Magic Link).
2. Create one account for Stephanie — the only user.
3. Enable Row Level Security (RLS) on `wardrobe_items`, `wishlist_items`, `saved_outfits`, and related tables so every row requires `auth.uid() = user_id`.
4. Client components use `@supabase/supabase-js` browser client — it handles the JWT automatically on every request.
5. Server routes use the existing `SUPABASE_SERVICE_ROLE_KEY` for admin operations where needed.
6. The home page and all protected pages check session server-side via Next.js middleware and redirect to `/login` if not authenticated.

### What this fixes

- Every API route is gated by a real JWT — no shared secret needed.
- RLS means even a rogue request with a valid anon key can only read/write rows owned by the authenticated user.
- Login state is managed by Supabase's auth library — no custom session management.
- The `THE_EDIT_API_SECRET` mechanism and `getApiSecretError` can be fully removed once RLS is in place.

### Cost

- Requires adding a login page (`/login`).
- Requires Next.js middleware to protect all non-public routes.
- Requires enabling RLS on each table and writing policies.
- Requires migrating the existing Supabase client calls to include `auth` session context on the server side (or keeping `SUPABASE_SERVICE_ROLE_KEY` for server routes as-is, which is already safe).
- Estimated scope: medium — 1 focused session.

---

## 4. Alternative: Next.js Middleware password gate

**Simpler, faster, lower engineering effort.**

### How it works

1. Set a single `PERSONAL_ACCESS_PASSWORD` env var.
2. Write a Next.js `middleware.ts` that checks a signed cookie.
3. If the cookie is valid → allow. Otherwise → redirect to `/login`.
4. The login page is a simple form that sets the cookie on correct password entry.
5. No Supabase Auth needed. No RLS needed. No user accounts.

### What this fixes

- All routes — API and pages — are protected at the edge before any code runs.
- The shared secret pattern can be kept or removed.
- Deployable in one session.

### Trade-offs vs. Supabase Auth

| | Middleware password | Supabase Auth |
|---|---|---|
| Setup effort | Low | Medium |
| Security model | Single shared password | Per-user JWT + RLS |
| Multi-user ready | No | Yes |
| Scales to team/family sharing | No | Yes |
| Correct long-term pattern | No — workaround | Yes — proper solution |

**Recommended for now if a quick fix is needed before implementing Supabase Auth.**

---

## 5. What is NOT changing now

- No route logic changed.
- No Supabase schema changed.
- No API payloads changed.
- No UI changed.
- `getApiSecretError` and the `x-the-edit-secret` pattern remain in place until explicitly replaced.
- The `THE_EDIT_API_SECRET` env var remains documented as optional.

---

## 6. Decision pending for Stephanie

> **Which auth path do you want to take?**
>
> **Option A — Supabase Auth (recommended)**  
> Real security. Single personal account with email/password or Magic Link. RLS protects the database. Correct long-term solution. Medium effort (~1 session).
>
> **Option B — Middleware password gate (quick fix)**  
> One env var, one middleware file. All routes protected by a cookie-based password check. Low effort (~1–2 hours). Not a permanent solution — replace with Supabase Auth later.
>
> **Option C — Leave as-is for now**  
> Acceptable while the URL is private and the app is in active development. Revisit before any public sharing or wider deployment.

The team will not implement auth changes until Stephanie confirms which option to pursue.

---

## 7. Files inspected (no changes made)

| File | Finding |
|---|---|
| `src/lib/api/auth.ts` | Shared secret mechanism — env var opt-in |
| `src/app/api/closet/items/route.ts` | `getApiSecretError` called — but client sends no header |
| `src/app/api/closet/items/[id]/route.ts` | Same |
| `src/app/api/closet/items/[id]/image/route.ts` | Same |
| `src/app/api/outfits/saved/route.ts` | POST/DELETE protected, GET open |
| `src/app/api/wishlist/items/route.ts` | POST unprotected entirely |
| `src/app/api/calendar/route.ts` | GET open |
| `src/components/closet-item-edit-form.tsx` | Never sends `x-the-edit-secret` |
| `src/components/ui/closet-item-lifecycle-action.tsx` | Never sends secret |
| `src/components/ui/add-piece-client.tsx` | Never sends secret |
| `src/components/ui/add-wishlist-client.tsx` | Never sends secret |
| `src/components/saved-outfit-actions.tsx` | Never sends secret |
| `.env.example` | `THE_EDIT_API_SECRET` documented as optional/commented out |
