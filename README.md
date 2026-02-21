# ☪ Ramadan Planner

> A spiritual companion to track your prayers, Quran recitation, and daily good deeds — built for Ramadan 1447 / 2026.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![PWA](https://img.shields.io/badge/PWA-installable-purple?style=flat-square)

---

## What is this?

**Ramadan Planner** is a full-stack Progressive Web App that helps Muslims track their daily acts of worship across all 30 days of Ramadan. It combines a real-time prayer times panel with a 30-day activity tracker — all in one clean, mobile-first interface.

Built entirely in Bengali (বাংলা) for the target audience, with English UI chrome.

---

## Features

### 🕌 Live Prayer Times
- Auto-detects location via browser Geolocation API
- Fetches prayer times from [Aladhan API](https://aladhan.com/prayer-times-api)
- Shows current prayer countdown, next prayer, and status per prayer (current / next / upcoming / passed)
- Navbar shows live Iftar / Sehri countdown
- Skeleton loaders while fetching; disappears silently if location is denied

### 📊 30-Day Activity Tracker
- **23 daily goals** across 8 categories: Fard Salah, Nafl Salah, Quran Recitation, Seerah Study, Dua & Dhikr, Character, Charity, Self-Discipline
- **Desktop:** scrollable 30-column × 23-row grid with sticky headers and per-day progress bars
- **Mobile:** tap-to-open day grid (5 × 6 tiles) with a bottom sheet checklist — no horizontal scrolling
- Optimistic UI updates via React's `useOptimistic` — zero perceived latency
- Offline support: changes are queued in `localStorage` and synced when reconnected

### 🔐 Authentication
- **Google Sign-In** via NextAuth.js v5 (OAuth 2.0)
- **Guest access** with username + self-chosen 4–6 digit PIN — works across devices
- JWT session strategy; no session DB required

### 📱 PWA
- Installable on Android and iOS
- Install prompt banner with custom UI
- Works offline (activity changes queued, prayer times cached)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v5 (Google + Credentials) |
| Database | MongoDB Atlas via Prisma ORM |
| Prayer Data | Aladhan REST API |
| Notifications | Sonner (toast) |
| Icons | Lucide React |
| PWA | next-pwa |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (SSR, auth-gated)
│   ├── layout.tsx            # Root layout + Toaster
│   ├── api/
│   │   ├── guest/route.ts    # Guest account creation API
│   │   └── auth/             # NextAuth route handlers
│   └── auth/                 # Sign-in page redirect
├── components/
│   ├── RamadanChart.tsx      # 30-day tracker (table + mobile grid + sheet)
│   ├── PrayerTimes.tsx       # Prayer times card + countdown
│   ├── NavbarCountdown.tsx   # Iftar/Sehri live timer in navbar
│   ├── GuestLoginForm.tsx    # Multi-step PIN login form
│   ├── GoogleSignInButton.tsx
│   └── InstallPrompt.tsx     # PWA install banner
├── hooks/
│   ├── usePrayerTimes.ts     # Geolocation + Aladhan fetch + status calc
│   └── useOfflineSync.ts     # Offline queue + auto-sync on reconnect
├── actions.ts                # Server Actions: getDayLogs, toggleActivity
├── auth.ts                   # NextAuth config
└── lib/
    ├── prisma.ts
    └── utils.ts
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/ramadan-diary.git
cd ramadan-diary
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```env
AUTH_SECRET=         # generate with: openssl rand -base64 32
DATABASE_URL=        # MongoDB Atlas connection string
AUTH_URL=            # http://localhost:3000 (dev) or your production URL
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Push DB schema & run

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-domain>/api/auth/callback/google`
4. Add test users under OAuth Consent Screen → Test users (if using Testing mode)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all env vars under Project Settings → Environment Variables
4. Deploy

---

## Known Improvements (see `IMPROVEMENTS.md`)

- [ ] Hash guest PINs with `bcrypt` (currently plain text)
- [ ] Rate-limit `/api/guest` to prevent PIN brute-force
- [ ] Remove `revalidatePath` from `toggleActivity` (not needed with optimistic UI)
- [ ] Move prayer data into React Context (currently fetched twice)
- [ ] Streak / summary stats card

---

## License

MIT — free to use, fork, and build upon. Barakallahu Feek 🌙
