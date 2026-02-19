export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Ramadan Planner",
    "url": "https://ramadan-diary.vercel.app", // Adjust if domain changes
    "description": "A spiritual companion for tracking daily prayers, Quran recitation, and good deeds during Ramadan.",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Prayer Times, Iftar Countdown, Sehri Countdown, Daily Habit Tracker, Quran Log",
    "screenshot": "https://ramadan-diary.vercel.app/api/og", 
    "author": {
        "@type": "Person",
        "name": "Mohona" 
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
