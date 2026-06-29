---
name: node-ical with Next.js Turbopack
description: node-ical crashes at import under Next.js bundling unless marked as a server external package
---

# node-ical under Next.js (Turbopack)

Importing `node-ical` inside a route handler/server module throws `TypeError: e.BigInt is not a function` at module evaluation when Next.js (Turbopack) bundles it. Its `rrule` dependency uses BigInt in a way the bundler mangles.

**Fix:** add the package to `serverExternalPackages` in `next.config.ts` so Next requires it at runtime instead of bundling it:
```ts
const nextConfig: NextConfig = { serverExternalPackages: ["node-ical"] };
```

**Why:** keeps the native/BigInt-using dependency out of the bundler transform.

**How to apply:** any time a server-only npm package fails at import with a mangled built-in (BigInt, etc.) under Next, try serverExternalPackages before swapping libraries. Requires a workflow restart (next.config change).
