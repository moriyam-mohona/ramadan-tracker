"use client"

import { usePrayerTimes } from "@/hooks/usePrayerTimes"
import { cn } from "@/lib/utils"
import { Loader2, MapPin } from "lucide-react"

export function PrayerTimes() {
    const { prayerData, loading, error, nextPrayer, city } = usePrayerTimes()

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm border border-red-100">
                {error}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-center gap-3 border border-emerald-100">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-emerald-700 text-sm font-medium">Fetching Prayer Times...</span>
            </div>
        )
    }

    if (!prayerData || !nextPrayer) return null

    // Helper to check if a prayer is the next one
    const isNext = (name: string) => nextPrayer.name === name

    // Helper to format time
    const formatTime = (time24: string) => {
        const [h, m] = time24.split(':');
        const date = new Date();
        date.setHours(parseInt(h), parseInt(m));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const prayers = [
        { name: "Fajr", time: prayerData.timings.Fajr },
        { name: "Dhuhr", time: prayerData.timings.Dhuhr },
        { name: "Asr", time: prayerData.timings.Asr },
        { name: "Maghrib", time: prayerData.timings.Maghrib },
        { name: "Isha", time: prayerData.timings.Isha },
    ]

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            
            {/* Main Countdown Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-emerald-900/20 border border-emerald-700/50">
                {/* Background Pattern */}
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

                    {/* Countdown Timer */}
                    <div className="bg-emerald-950/30 backdrop-blur-md rounded-2xl p-6 min-w-[200px] border border-emerald-500/30 shadow-inner">
                         <span className="block text-emerald-300 text-xs uppercase tracking-widest mb-1 font-semibold text-center">Time Remaining</span>
                         <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 tabular-nums tracking-tighter text-center">
                             {nextPrayer.timeLeft.split(' ')[0]} 
                             {/* Showing only hours first to simplify layout, let's show full */}
                         </div>
                         <div className="text-center text-sm font-mono text-emerald-200/70 mt-1">
                             {nextPrayer.timeLeft}
                         </div>
                    </div>
                </div>
            </div>

            {/* Prayer List Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {prayers.map((prayer) => {
                    const active = isNext(prayer.name)
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
                                {formatTime(prayer.time)}
                            </span>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}
