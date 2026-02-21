# Project Audit — What Can Be Improved

> Generated: 2026-02-21. Review and tick off items as they are completed.

---

## 🔴 Critical / Security

| # | Area | Issue | Suggested Fix |
|---|------|-------|---------------|
| 1 | **Security** | `guestPasscode` is stored as **plain text** in MongoDB. If the DB leaks, all PINs are exposed. | Hash with `bcryptjs` before saving; compare with `bcrypt.compare()` in `auth.ts` |
| 2 | **API – no rate limiting** | `/api/guest` can be brute-forced — an attacker can try all 4-digit PINs (0000–9999 = 10 k tries) against any username. | Add a rate limiter (e.g. `@upstash/ratelimit` or a simple IP-based in-memory map) |
| 3 | **`revalidatePath` on every toggle** | `toggleActivity` calls `revalidatePath("/")` on every checkbox click. With 30 days × 25 activities = 750 cells this hammers the server. The UI is already optimistic via `useOptimistic`, so revalidation is not needed on toggle. | Remove `revalidatePath` from `toggleActivity`; only call it on page-level mutations (e.g. sign-in/out) |

---

## 🟠 Bugs / Logic Issues

| # | Area | Issue |
|---|------|-------|
| 4 | **Hardcoded Ramadan start date** | `new Date('2026-02-19')` is baked into `RamadanChart.tsx`. Also `Math.ceil` rounds incorrectly — after midnight it advances the day too early. Replace `Math.ceil` with `Math.floor`. |
| 5 | **Stale closure in `useOfflineSync`** | `syncPendingActions` is recreated every render; the `handleOnline` callback captures a stale closure. Wrap `syncPendingActions` in `useCallback`. |
| 6 | **Double geolocation requests** | `PrayerTimes` and `NavbarCountdown` both mount `usePrayerTimes()` independently → two separate geolocation prompts and two separate API calls to `aladhan.com`. Move `prayerData` into a React Context so it is fetched once. |
| 7 | **Fake `updatedAt` in `getDayLogs`** | `getDayLogs` returns `updatedAt: new Date()` for every entry (i.e. always "just now"). Use the real `updatedAt` from the DB record. |

---

## 🟡 UX / Product

| # | Area | Suggestion |
|---|------|------------|
| 8 | **Current vs next prayer card** | Both the current and next prayers use the same `bg-emerald-600` highlight. The active (current) prayer deserves a distinct amber tint so users can tell at a glance which prayer window they are in. |
| 9 | **Mobile chart UX** | The 30-column table is very wide on mobile. Consider a day-by-day sheet: tap a day column header → a bottom sheet slides up showing just that day's activities as a vertical checklist. |
| 10 | **Streak / summary stats** | After the chart, show a small summary card: "Best day · Day 12 (23/25 ✓)", "Current streak · 4 days full", "Total completed · 342 acts" — all computable from existing `completionStats`. |
| 11 | **Guest display name** | `session.user?.name` for guests is raw lowercase. Capitalise the first letter or show `"Guest · {username}"` in the navbar. |
| 12 | **Ramadan progress indicator** | Add a "Day X of 30" progress bar below the prayer section so users immediately see how far into Ramadan they are. |

---

## 🟢 Code Quality / DX

| # | Area | Issue |
|---|------|-------|
| 13 | **`ACTIVITIES` not shared** | `ACTIVITIES` is defined inside `RamadanChart.tsx`. If activities are added or removed the old DB logs are silently orphaned. Move to `src/lib/constants.ts` and import everywhere. |
| 14 | **Guest PIN in `localStorage` as plain text** | On a shared device anyone can read `localStorage` and retrieve the PIN. Store only the username; prompt for the PIN on every new session. |
| 15 | **Sequential offline sync** | `useOfflineSync` calls `toggleActivity` one by one in a `for...of` loop. Replace with `Promise.allSettled` for parallel sync. |
| 16 | **Missing PWA theme colour** | `InstallPrompt` offers to install as a PWA but no `<meta name="theme-color">` is set. Add `<meta name="theme-color" content="#064e3b">` to `layout.tsx`. |
