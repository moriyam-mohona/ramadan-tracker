# Future Improvements & Roadmap

Based on the current architecture and the goal of creating a "so good" user experience, here are recommendations for the next phase of development.

## 1. Functional Enhancements (New Features)

### 🤲 Prayer Times & Qibla
- **Integration**: Use the [Aladhan API](https://aladhan.com/prayer-times-api) to fetch accurate prayer times based on the user's location.
- **UI**: Display the next prayer time countdown prominently in the hero section or header.
- **Feature**: "Iftar" and "Sehri" countdowns specific to the user's coordinates.

### 📝 Daily Reflections (Journaling)
- **Feature**: Allow users to click on a "Day" header to open a modal.
- **Data**: Store a simple text note for that day (e.g., "Today I felt peace during Taraweeh...").
- **Benefit**: Transforms the app from a tracker to a spiritual diary.

### 📖 Quran Tracker
- **Dedicated Section**: Instead of just a checkbox, have a visual progress bar for the Quran (30 Juz or 604 Pages).
- **Bookmark**: "Result" save functionality to remember the last read page.

### ⚙️ Custom Habits
- **Flexibility**: Allow users to add their own custom rows to the tracker (e.g., "Read Islamic Book", "Help Parents").
- **Implementation**: New DB model `CustomActivity` linked to `User`.

## 2. UX & UI Polish

### 📱 PWA (Progressive Web App)
- **Installability**: Add a `manifest.json` so users can install the app on their phones.
- **Offline Mode**: Cache the chart data so they can check off items even without internet (sync when online).

### 🌗 Dark Mode
- **Accessibility**: While the "Light/Islamic" theme is beautiful, a "Night Mode" (Deep Emerald/Midnight Blue) is better for checking the diary during Tahajjud or before sleeping.

### 🎉 Gamification
- **Streaks**: Show a "Current Streak" flame icon if they complete >50% of tasks consecutive days.
- **Badges**: Unlock badges like "First 10 Days Completed", "Quran Finisher".
- **Confetti**: Trigger a confetti explosion when a user marks "Day complete" or finishes all tasks for a day.

## 3. Technical Improvements

### 🏗️ Component Refactoring
- **Current State**: `RamadanChart.tsx` is becoming monolithic.
- **Refactor**: Split into:
  - `DayColumn.tsx`
  - `ActivityRow.tsx`
  - `ChartHeader.tsx`
- **Benefit**: Easier to maintain and animate individual parts.

### ⚡ Performance
- **Optimistic UI**: Already implemented (Great job!).
- **Virtualization**: If you add more rows, consider virtualization to keep the scrolling buttery smooth on mobile.

### 🔍 SEO & Metadata
- **JSON-LD**: Add structured data so Google understands this is a Web Application.
- **OG Images**: Dynamic Open Graph images that show the user's current progress when they share the link on social media.

## Summary Recommendation
For the immediate next step, I recommend implementing **Prayer Times/Countdown** or **PWA Support**, as these add high value for mobile users during Ramadan.
