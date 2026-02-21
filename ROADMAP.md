# 🌙 Ramadan Planner — Future Roadmap

> Living document. Update as features ship.

---

## ✅ Shipped (v1.0 — Ramadan 1447 / 2026)

- [x] Live prayer times via Aladhan API + geolocation
- [x] Navbar Iftar/Sehri live countdown
- [x] 30-day × 23-activity tracker (desktop table)
- [x] Mobile day-grid + bottom sheet checklist
- [x] Optimistic UI updates via `useOptimistic`
- [x] Offline support — queue + auto-sync on reconnect
- [x] Google Sign-In (NextAuth.js v5)
- [x] Guest login with username + self-chosen PIN
- [x] PWA — installable on Android & iOS
- [x] Skeleton loaders, location-denial graceful handling

---

## 🚧 Phase 2 — Quality & Polish

- [ ] **Hash guest PINs** with `bcryptjs` (security)
- [ ] **Rate-limit** `/api/guest` endpoint (prevent brute-force)
- [ ] Remove `revalidatePath` from `toggleActivity` (not needed with optimistic UI)
- [ ] Move prayer data into **React Context** (currently fetched twice — PrayerTimes + NavbarCountdown)
- [ ] **Streak tracking** — current streak + longest streak from `completionStats`
- [ ] **Summary stats card** — best day, total completions, overall %
- [ ] Day X of 30 **Ramadan progress bar** under the prayer section
- [ ] **Current prayer distinct colour** (amber vs emerald) in the prayer card strip

---

## 🔮 Phase 3 — Feature Expansion

- [ ] **Quran reading tracker** — track which Surah/Ayah you're on, daily pages target
- [ ] **Dhikr counter** — tap to count Subhanallah / Alhamdulillah / Allahu Akbar
- [ ] **Dua journal** — personal notes / duas to make this Ramadan
- [ ] **Tafseer snippet of the day** — short daily verse + meaning
- [ ] **Hadith of the day** — pulled from a Hadith API
- [ ] **Salah time notifications** — browser push notifications (Web Push API)
- [ ] **Charity log** — track amounts donated across the month

---

## 🌍 Phase 4 — Community & Sharing

- [ ] **Shareable day card** — generate an image card ("Day 15 — 21/23 goals ✓") to share on social
- [ ] **Multi-user leaderboard** (opt-in, anonymous) — "Top streaks in your city"
- [ ] **Group/family mode** — shared tracker for a household
- [ ] **Al-Quran integration** — in-app Quran reader with bookmarks
- [ ] **i18n** — support Arabic, Urdu, English alongside Bengali

---

## 📅 Phase 5 — Year-Round (Post-Ramadan)

- [ ] **Habit tracker mode** (beyond Ramadan) — weekly salah, Quran, charity goals
- [ ] **Hajj / Umrah checklist** mode
- [ ] **Zakat calculator** built-in
- [ ] **Islamic calendar widget** — Hijri date, upcoming events (Eid, Dhul Hijjah, etc.)
- [ ] **Prayer time widget** for home screen (PWA widget API when available)

---

## 🏗 Tech Debt

- [ ] Move `ACTIVITIES` to `src/lib/constants.ts` (shared between frontend and backend)
- [ ] Add E2E tests (Playwright) for auth flows and activity toggling
- [ ] Add unit tests for `usePrayerTimes` hook calculations
- [ ] Set up CI/CD pipeline on GitHub Actions
- [ ] Error boundary components for graceful fallback UI
