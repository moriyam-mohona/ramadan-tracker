# 🐛 Bug List

> Track known bugs here. Add reproduction steps and fix status.

---

## 🔴 High Priority

### BUG-001 — Guest PINs stored as plain text
- **File:** `prisma/schema.prisma`, `src/auth.ts`, `src/app/api/guest/route.ts`
- **Problem:** `guestPasscode` is saved directly to MongoDB without hashing. A DB breach exposes all PINs.
- **Fix:** Install `bcryptjs`, hash PIN in `/api/guest` before `prisma.user.create`, use `bcrypt.compare()` in `auth.ts`.
- **Status:** ⏳ Open

### BUG-002 — No rate limiting on `/api/guest`
- **File:** `src/app/api/guest/route.ts`
- **Problem:** An attacker can enumerate usernames and brute-force 4-digit PINs (10,000 combinations) with no throttle.
- **Fix:** Add IP-based rate limiting using `@upstash/ratelimit` + Redis, or a simple in-memory token bucket.
- **Status:** ⏳ Open

### BUG-003 — `revalidatePath("/")` on every checkbox toggle (performance)
- **File:** `src/actions.ts` → `toggleActivity`
- **Problem:** Every single checkbox triggers a full Next.js incremental revalidation of the home page. With 30×23 = 690 possible toggles per user per day this is unnecessary — the UI already handles state via `useOptimistic`.
- **Fix:** Remove `revalidatePath("/")` from `toggleActivity`. Only revalidate on sign-in/sign-out.
- **Status:** ⏳ Open

---

## 🟠 Medium Priority

### BUG-004 — Prayer data fetched twice (double geolocation request)
- **File:** `src/hooks/usePrayerTimes.ts`
- **Problem:** `PrayerTimes` and `NavbarCountdown` both independently mount `usePrayerTimes()` → two geolocation prompts and two API calls to Aladhan on every page load.
- **Fix:** Lift prayer data into a React Context (`PrayerTimesProvider`) wrapping the layout. Both components consume the context.
- **Status:** ⏳ Open

### BUG-005 — `getDayLogs` returns fake `updatedAt`
- **File:** `src/actions.ts` → `getDayLogs`
- **Problem:** Each constructed log object gets `updatedAt: new Date()` (always "just now"). This means any consumer relying on `updatedAt` for cache validation or display will break.
- **Fix:** Use the real `log.updatedAt` from the DB record returned by Prisma. Requires grouping logs by day after fetch.
- **Status:** ⏳ Open

### BUG-006 — `useOfflineSync` stale closure on `syncPendingActions`
- **File:** `src/hooks/useOfflineSync.ts`
- **Problem:** `syncPendingActions` is defined inside the hook body and is not memoized. The `handleOnline` event listener captures a stale closure reference. If the hook re-renders before the `online` event fires, `syncPendingActions` may operate on stale state.
- **Fix:** Wrap `syncPendingActions` in `useCallback` with stable dependencies.
- **Status:** ⏳ Open

### BUG-007 — Ramadan day calculation can be off by one
- **File:** `src/components/RamadanChart.tsx`
- **Problem:** The Ramadan start date `2026-02-19` is hardcoded with no timezone adjustment. On timezones ahead of UTC, Day 1 could show as Day 2 after midnight local time.
- **Fix:** Compare dates in local timezone using `date.toLocaleDateString()` diff rather than raw millisecond diff, or accept environment variable `NEXT_PUBLIC_RAMADAN_START`.
- **Status:** ⏳ Open

---

## 🟡 Low Priority / UX

### BUG-008 — Guest name shown as raw lowercase in navbar on mobile
- **File:** `src/app/page.tsx`
- **Problem:** `session.user?.name` for guests is the raw lowercase username. Fixed on desktop with "Guest · Name" pill but name is hidden entirely on `xs` screens — users have no identity indicator at all.
- **Fix:** Show a small avatar initial circle on all screen sizes (partially addressed in v1 navbar update).
- **Status:** ⏳ Open

### BUG-009 — `ACTIVITIES` defined in two places
- **File:** `src/components/RamadanChart.tsx` (client) vs backend logic
- **Problem:** If an activity is renamed or removed in `ACTIVITIES`, old DB records for that activity become orphaned and silently ignored — no error, but data is lost.
- **Fix:** Move the canonical `ACTIVITIES` array to `src/lib/constants.ts` and import everywhere.
- **Status:** ⏳ Open

### BUG-010 — Guest PIN stored in `localStorage` as plain text
- **File:** `src/components/GuestLoginForm.tsx`
- **Problem:** On a shared/public device, anyone can open DevTools and read the PIN from `localStorage`.
- **Fix:** Store only the username in `localStorage`. Prompt PIN on every new browser session. Use `sessionStorage` instead of `localStorage` for the PIN if auto-fill convenience is needed.
- **Status:** ⏳ Open

### BUG-011 — `offline sync` processes actions sequentially
- **File:** `src/hooks/useOfflineSync.ts` → `syncPendingActions`
- **Problem:** Actions are synced one-by-one in a `for...of` loop, which is slow when many actions are queued.
- **Fix:** Replace with `Promise.allSettled` for parallel sync.
- **Status:** ⏳ Open

---

## ✅ Fixed

| ID | Description | Fixed in |
|----|-------------|----------|
| — | Wide table unusable on mobile | v1 — mobile day-grid added |
| — | Spinner instead of skeleton on prayer load | v1 — skeleton implemented |
| — | Math.ceil caused wrong current day after midnight | v1 — changed to Math.floor |
| — | Duplicate stale code in PrayerTimes.tsx | v1 — full file overwrite |
