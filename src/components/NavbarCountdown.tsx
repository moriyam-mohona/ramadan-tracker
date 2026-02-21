"use client"

import { usePrayerTimes } from "@/hooks/usePrayerTimes"
import { useEffect, useState } from "react"

export function NavbarCountdown() {
    const { prayerData, loading, locationDenied } = usePrayerTimes()
    const [countdown, setCountdown] = useState<{ label: string, time: string } | null>(null)

    useEffect(() => {
        if (!prayerData) return

        const calculateCountdown = () => {
            const now = new Date()
            const timings = prayerData.timings

            const getDate = (timeStr: string, addDays = 0) => {
                const [h, m] = timeStr.split(':')
                const d = new Date()
                d.setDate(d.getDate() + addDays)
                d.setHours(parseInt(h), parseInt(m), 0)
                return d
            }

            const maghrib  = getDate(timings.Maghrib)
            const fajr     = getDate(timings.Fajr)
            const nextFajr = getDate(timings.Fajr, 1)

            let targetDate: Date
            let label: string

            if (now < fajr) {
                targetDate = fajr;  label = "Sehri"
            } else if (now < maghrib) {
                targetDate = maghrib; label = "Iftar"
            } else {
                targetDate = nextFajr; label = "Sehri"
            }

            const diff    = targetDate.getTime() - now.getTime()
            const hours   = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setCountdown({ label, time: `${hours}h ${minutes}m ${seconds}s` })
        }

        const interval = setInterval(calculateCountdown, 1000)
        calculateCountdown()
        return () => clearInterval(interval)
    }, [prayerData])

    // Hide entirely if location was denied
    if (locationDenied) return null

    // Skeleton pill while loading
    if (loading) {
        return (
            <div className="hidden md:flex items-center gap-2 bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-200/60 shadow-sm animate-pulse">
                <div className="h-3 w-10 bg-emerald-200 rounded-full" />
                <div className="h-3 w-20 bg-amber-200 rounded-full" />
            </div>
        )
    }

    if (!countdown) return null

    return (
        <div className="hidden md:flex items-center gap-2 bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-200/60 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {countdown.label} in
            </span>
            <span className="font-mono text-sm font-bold text-amber-600 tabular-nums">
                {countdown.time}
            </span>
        </div>
    )
}
