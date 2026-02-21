"use client"

import { usePrayerTimes } from "@/hooks/usePrayerTimes"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"

export function PrayerTimes() {
    const { prayerData, loading, error, locationDenied, nextPrayer, prayerTimings, city } = usePrayerTimes()

    // Hide everything if user denied location access
    if (locationDenied) return null

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
                {/* Skeleton main card */}
                <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 rounded-3xl p-6 sm:p-10 border border-emerald-700/30">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div className="space-y-3 w-full sm:w-auto">
                            <div className="h-3 w-32 bg-emerald-700/60 rounded-full mx-auto sm:mx-0" />
                            <div className="h-10 w-64 bg-emerald-700/60 rounded-xl mx-auto sm:mx-0" />
                            <div className="h-5 w-24 bg-emerald-700/40 rounded-lg mx-auto sm:mx-0" />
                        </div>
                        <div className="bg-emerald-950/30 rounded-2xl p-6 w-52 border border-emerald-700/20">
                            <div className="h-3 w-24 bg-emerald-700/40 rounded-full mx-auto mb-3" />
                            <div className="h-10 w-36 bg-amber-600/30 rounded-xl mx-auto" />
                            <div className="h-3 w-28 bg-emerald-700/30 rounded-full mx-auto mt-3" />
                        </div>
                    </div>
                </div>
                {/* Skeleton prayer cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-emerald-100 space-y-2">
                            <div className="h-2.5 w-12 bg-emerald-100 rounded-full" />
                            <div className="h-5 w-16 bg-emerald-100 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || !prayerData || !nextPrayer) return null

    // Current active prayer (has started, not yet finished)
    const currentPrayer = prayerTimings.find(p => p.status === "current")

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            {/* Main Countdown Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-emerald-900/20 border border-emerald-700/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400 rounded-full blur-[80px] opacity-20"></div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8 text-center sm:text-left">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-200/80 text-sm font-medium justify-center sm:justify-start">
                            <MapPin className="w-4 h-4" />
                            <span className="uppercase tracking-widest">{city}</span>
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                            <span>{prayerData.meta.timezone}</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold font-hind-siliguri leading-tight">
                            {nextPrayer.isIftar ? "Iftar Time" : nextPrayer.isSehri ? "Sehri Time" : `Next: ${nextPrayer.name}`}
                        </h2>
                        <p className="text-xl text-emerald-100/90 font-medium">
                            {nextPrayer.time}
                        </p>
                    </div>

                    {/* Countdown box */}
                    <div className="bg-emerald-950/30 backdrop-blur-md rounded-2xl p-6 min-w-[210px] border border-emerald-500/30 shadow-inner text-center">
                        {currentPrayer ? (
                            <>
                                {/* Current prayer remaining — big & prominent */}
                                <span className="block text-emerald-300 text-xs uppercase tracking-widest mb-1 font-semibold">
                                    {currentPrayer.name} ends in
                                </span>
                                <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tabular-nums tracking-tighter">
                                    {currentPrayer.timeLeft}
                                </div>
                                {/* Next prayer — muted secondary */}
                                <div className="mt-3 pt-3 border-t border-emerald-700/40 text-xs font-mono text-emerald-400/70">
                                    Next {nextPrayer.name} in {nextPrayer.timeLeft}
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="block text-emerald-300 text-xs uppercase tracking-widest mb-1 font-semibold">
                                    Time Remaining
                                </span>
                                <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 tabular-nums tracking-tighter">
                                    {nextPrayer.timeLeft.split(' ').slice(0, 2).join(' ')}
                                </div>
                                <div className="text-center text-xs font-mono text-emerald-200/50 mt-1">
                                    {nextPrayer.timeLeft}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Prayer List Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(prayerTimings.length > 0 ? prayerTimings : [
                    { name: "Fajr",    time: "", timeLeft: "", status: "upcoming" as const },
                    { name: "Dhuhr",   time: "", timeLeft: "", status: "upcoming" as const },
                    { name: "Asr",     time: "", timeLeft: "", status: "upcoming" as const },
                    { name: "Maghrib", time: "", timeLeft: "", status: "upcoming" as const },
                    { name: "Isha",    time: "", timeLeft: "", status: "upcoming" as const },
                ]).map((prayer) => {
                    const active = prayer.status === "next"
                    return (
                        <div key={prayer.name} className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border",
                            active
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105 border-emerald-500"
                                : "bg-white text-emerald-900 shadow-sm border-emerald-100 hover:border-emerald-300"
                        )}>
                            <span className={cn("text-xs uppercase tracking-wider font-semibold mb-1", active ? "text-emerald-100" : "text-emerald-500")}>
                                {prayer.name}
                            </span>
                            <span className="text-lg font-bold">
                                {prayer.time}
                            </span>
                            {/* {prayer.timeLeft && (
                                <span className={cn("text-[10px] font-mono mt-1 text-center", active ? "text-emerald-200" : "text-emerald-400")}>
                                    {prayer.status === "current" ? `${prayer.timeLeft} left` : prayer.status === "passed" ? "✓ done" : prayer.timeLeft}
                                </span>
                            )} */}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}
