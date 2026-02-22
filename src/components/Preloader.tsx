"use client"

import { useEffect, useState } from "react"

export function Preloader() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible")

  useEffect(() => {
    // Start fading after content has had time to paint
    const fadeTimer = setTimeout(() => setPhase("fading"), 1400)
    // Remove from DOM after the CSS transition finishes
    const removeTimer = setTimeout(() => setPhase("gone"), 2000)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-emerald-950 select-none"
      style={{
        transition: "opacity 600ms ease, visibility 600ms ease",
        opacity: phase === "fading" ? 0 : 1,
        visibility: phase === "fading" ? "hidden" : "visible",
      }}
    >
      {/* Glowing moon */}
      <div className="relative flex items-center justify-center mb-8">
        {/* outer glow ring */}
        <span
          className="absolute w-28 h-28 rounded-full bg-emerald-500/10 animate-ping"
          style={{ animationDuration: "1.8s" }}
        />
        {/* mid glow */}
        <span className="absolute w-20 h-20 rounded-full bg-emerald-500/15 animate-pulse" />
        {/* moon emoji */}
        <span
          className="relative text-6xl"
          style={{
            filter: "drop-shadow(0 0 24px rgba(52,211,153,0.7))",
            animation: "float 2.5s ease-in-out infinite",
          }}
        >
          🌙
        </span>
      </div>

      {/* App name */}
      <h1 className="text-2xl font-bold tracking-wide text-emerald-50 mb-1">
        Ramadan Tracker
      </h1>
      <p className="text-emerald-400/80 text-sm font-arabic tracking-widest mb-8">
        رمضان مبارك
      </p>

      {/* Loading bar */}
      <div className="w-40 h-0.5 bg-emerald-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
          style={{
            animation: "load 1.3s ease-in-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes load {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
