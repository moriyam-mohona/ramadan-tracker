"use client"

import { useState, useOptimistic, startTransition, useMemo, useEffect, useCallback } from "react"
import { toggleActivity } from "@/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { X, CheckCircle2, Circle } from "lucide-react"

// ─── Constants ──────────────────────────────────────────────────────────────

const ACTIVITIES = [
  "ফজর আদায় করেছি", "যোহর আদায় করেছি", "আসর আদায় করেছি", "মাগরিব আদায় করেছি", "ঈশা আদায় করেছি",
  "তাহাজ্জুদ আদায় করেছি", "তারাবীহ আদায় করেছি",
  "১ পৃষ্ঠা অর্থসহ কুরআন পড়েছি", "অর্ধপারা অর্থসহ কুরআন পড়েছি", "১ পারা অর্থসহ কুরআন পড়েছি", "১ পারা অর্থসহ কুরআন তিলাওয়াত শুনেছি",
  "সীরাত পড়েছি ১০ পৃষ্ঠা", "সীরাত পড়েছি ২০ পৃষ্ঠা",
  "৫ মিনিট দুআ করেছি", "সকাল-সন্ধ্যার দুআ পড়েছি",
  "চোখের হেফাজত করেছি", "গীবত করিনি", "বাবা-মার সাথে ভালো ব্যবহার করেছি",
  "৫ টাকা দান করেছি",
  "গান শুনিনি", "প্রয়োজন ছাড়া ইন্টারনেট ব্যবহার করিনি", "ইন্টারনেট ব্যবহার অর্ধেক কমিয়েছি", "সঠিক সময়ে ঘুমিয়েছি ও সাহরি খেয়েছি",
]

const SECTIONS = [
  { label: "ফরজ নামাজ",      icon: "🕌", activities: ["ফজর আদায় করেছি","যোহর আদায় করেছি","আসর আদায় করেছি","মাগরিব আদায় করেছি","ঈশা আদায় করেছি"] },
  { label: "নফল নামাজ",      icon: "🌙", activities: ["তাহাজ্জুদ আদায় করেছি","তারাবীহ আদায় করেছি"] },
  { label: "কুরআন তিলাওয়াত", icon: "📖", activities: ["১ পৃষ্ঠা অর্থসহ কুরআন পড়েছি","অর্ধপারা অর্থসহ কুরআন পড়েছি","১ পারা অর্থসহ কুরআন পড়েছি","১ পারা অর্থসহ কুরআন তিলাওয়াত শুনেছি"] },
  { label: "সীরাত অধ্যয়ন",   icon: "📚", activities: ["সীরাত পড়েছি ১০ পৃষ্ঠা","সীরাত পড়েছি ২০ পৃষ্ঠা"] },
  { label: "দুআ ও যিকির",    icon: "🤲", activities: ["৫ মিনিট দুআ করেছি","সকাল-সন্ধ্যার দুআ পড়েছি"] },
  { label: "চরিত্র ও আচরণ",  icon: "❤️", activities: ["চোখের হেফাজত করেছি","গীবত করিনি","বাবা-মার সাথে ভালো ব্যবহার করেছি"] },
  { label: "দান",             icon: "💰", activities: ["৫ টাকা দান করেছি"] },
  { label: "আত্মনিয়ন্ত্রণ",  icon: "📵", activities: ["গান শুনিনি","প্রয়োজন ছাড়া ইন্টারনেট ব্যবহার করিনি","ইন্টারনেট ব্যবহার অর্ধেক কমিয়েছি","সঠিক সময়ে ঘুমিয়েছি ও সাহরি খেয়েছি"] },
]

const SUCCESS_MESSAGES = [
  "Alhamdulillah! Keep shining.", "Mashallah! May Allah accept your effort.", "Subhanallah! Great job.",
  "JazakAllah Khair! Every good deed counts.", "Barakallahu Feek! Stay consistent.",
  "MashaAllah! One step closer to Jannah.", "Excellent! Allah loves consistency.",
  "Keep going! The gates of Rayyan await.", "Fantastic! Angels are writing this down.",
  "MashaAllah! Building your palace in Jannah.", "Brilliant! May Allah increase you in goodness.",
]

type DayLog = { day: number; activities: Record<string, boolean> }

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRamadanDay(): number | null {
  const start = new Date('2026-02-19')
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff >= 1 && diff <= 30 ? diff : null
}

// ─── Main component ──────────────────────────────────────────────────────────

export function RamadanChart({ initialLogs }: { initialLogs: DayLog[] }) {
  const [currentDay, setCurrentDay] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const { isOnline, saveActionOffline } = useOfflineSync()

  useEffect(() => { setCurrentDay(getRamadanDay()) }, [])

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = selectedDay !== null ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [selectedDay])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedDay(null) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const initialDataMap = useMemo(() => {
    const map = new Map<number, Record<string, boolean>>()
    initialLogs.forEach(log => map.set(log.day, log.activities))
    return map
  }, [initialLogs])

  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    initialDataMap,
    (state, { day, activity, status }: { day: number; activity: string; status: boolean }) => {
      const next = new Map(state)
      next.set(day, { ...(next.get(day) || {}), [activity]: status })
      return next
    }
  )

  const handleToggle = useCallback(async (day: number, activity: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    startTransition(() => addOptimisticLog({ day, activity, status: newStatus }))
    if (!isOnline) { saveActionOffline(day, activity, newStatus); return }
    try {
      const result = await toggleActivity(day, activity, newStatus)
      if (result.success && newStatus) {
        toast.success(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)], {
          duration: 2500,
          className: "bg-white text-emerald-900 border-l-4 border-emerald-500 shadow-md font-medium",
          icon: <span className="text-xl">🌙</span>
        })
      } else if (!result.success) {
        toast.error("Failed to save", { className: "bg-red-50 text-red-800" })
      }
    } catch {
      saveActionOffline(day, activity, newStatus)
      toast.error("Network error. Saved offline.")
    }
  }, [isOnline, saveActionOffline, addOptimisticLog])

  const completionStats = useMemo(() => {
    const map = new Map<number, number>()
    for (let i = 1; i <= 30; i++) {
      map.set(i, Object.values(optimisticLogs.get(i) || {}).filter(Boolean).length)
    }
    return map
  }, [optimisticLogs])

  const total = ACTIVITIES.length
  const isSheetOpen = selectedDay !== null
  const sheetActs = selectedDay ? (optimisticLogs.get(selectedDay) || {}) : {}
  const sheetDone = Object.values(sheetActs).filter(Boolean).length
  const sheetPct = Math.round((sheetDone / total) * 100)

  return (
    <>
      {/* ─── MOBILE: Day Grid (hidden on md+) ─────────────────────────────── */}
      <div className="md:hidden w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">

          {/* Grid header */}
          <div className="bg-emerald-900 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">❖</span>
              <span className="text-xs text-emerald-300/80 uppercase tracking-widest font-semibold">Ramadan 2026</span>
            </div>
            <span className="text-xs text-emerald-400">
              Tap a day to log
            </span>
          </div>

          {/* 6 × 5 day grid */}
          <div className="grid grid-cols-5 gap-2 p-4">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const done = completionStats.get(day) || 0
              const pct = Math.round((done / total) * 100)
              const isToday = currentDay === day
              const isHigh = pct >= 80
              const isMed = pct >= 40

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl p-2 pt-3 pb-2 gap-1 transition-all duration-200 active:scale-95 border",
                    isToday
                      ? "bg-emerald-700 border-emerald-500 shadow-lg shadow-emerald-700/30 ring-2 ring-amber-400"
                      : done > 0
                      ? "bg-emerald-50 border-emerald-200 hover:border-emerald-400"
                      : "bg-white border-emerald-100 hover:border-emerald-300"
                  )}
                >
                  {/* TODAY badge */}
                  {isToday && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      TODAY
                    </span>
                  )}

                  {/* Day number */}
                  <span className={cn(
                    "text-base font-bold font-hind-siliguri leading-none",
                    isToday ? "text-white" : "text-emerald-900"
                  )}>
                    {day.toLocaleString("bn-BD")}
                  </span>

                  {/* Thin progress bar */}
                  <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isHigh ? "bg-amber-400" : isMed ? "bg-emerald-500" : "bg-emerald-300"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Count */}
                  <span className={cn(
                    "text-[10px] font-mono leading-none",
                    isToday ? "text-emerald-200" : done > 0 ? "text-emerald-600" : "text-emerald-300"
                  )}>
                    {done}/{total}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP: Full Table (hidden on mobile) ───────────────────────── */}
      <div className="hidden md:block w-full bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-emerald-100/50 border-separate border-spacing-0">
              <thead className="bg-emerald-900 text-emerald-50">
                <tr>
                  <th scope="col" className="sticky left-0 top-0 z-30 py-4 pl-6 pr-4 text-left text-sm font-bold bg-emerald-900 min-w-[240px] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)] border-r border-emerald-800/50 border-b border-emerald-800">
                    <span className="flex items-center gap-2.5">
                      <span className="text-amber-400 text-lg">❖</span>
                      <span className="tracking-wide uppercase text-xs text-emerald-300/80">Daily Goals</span>
                    </span>
                  </th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const isToday = currentDay === day
                    return (
                      <th
                        key={day}
                        scope="col"
                        onClick={() => setSelectedDay(day)}
                        title="Click to open day sheet"
                        className={cn(
                          "sticky top-0 z-20 px-1 py-4 text-center min-w-[55px] border-l border-emerald-800/30 transition-colors duration-300 relative group border-b border-emerald-800 cursor-pointer select-none",
                          isToday ? "bg-emerald-800" : "bg-emerald-900 hover:bg-emerald-800/50"
                        )}
                      >
                        {isToday && (
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-[9px] font-bold text-emerald-900 px-1.5 py-0.5 rounded-b-md shadow-sm z-30 ring-2 ring-emerald-900">TODAY</span>
                        )}
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={cn("text-[10px] uppercase tracking-wider font-light", isToday ? "text-amber-400 font-bold" : "text-emerald-300/70")}>Day</span>
                          <span className={cn("text-lg font-hind-siliguri leading-none", isToday ? "text-white font-bold scale-110" : "")}>{day.toLocaleString("bn-BD")}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
                <tr>
                  <th className="sticky left-0 top-[60px] z-30 py-3 pl-6 pr-4 text-right text-xs uppercase tracking-wider bg-emerald-800/95 backdrop-blur-sm sm:pl-8 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)] border-r border-emerald-700 border-b border-emerald-800/50 text-emerald-200">
                    Progress
                  </th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const count = completionStats.get(day) || 0
                    const pct = Math.round((count / total) * 100)
                    const isHigh = pct >= 80
                    const isMed = pct >= 40 && pct < 80
                    const isToday = currentDay === day
                    return (
                      <th key={`stats-${day}`} className={cn(
                        "sticky top-[60px] z-20 px-1 py-3 text-center border-l border-emerald-700/30 border-b border-emerald-800/50 bg-emerald-900/95 backdrop-blur-sm",
                        isToday ? "bg-emerald-800/95" : ""
                      )}>
                        <div className="flex flex-col items-center gap-1.5 justify-end">
                          <div className="w-1.5 h-8 bg-emerald-950/50 rounded-full overflow-hidden relative">
                            <div
                              className={cn("w-full absolute bottom-0 rounded-full transition-all duration-500",
                                isHigh ? "bg-amber-400" : isMed ? "bg-emerald-400" : "bg-emerald-600"
                              )}
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className={cn("text-[10px] font-mono leading-none",
                            isHigh ? "text-amber-400" : isMed ? "text-emerald-200" : "text-emerald-500/70"
                          )}>{count}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 bg-white">
                {ACTIVITIES.map((activity, idx) => (
                  <tr key={activity} className={cn("group transition-colors duration-200", idx % 2 === 0 ? "bg-emerald-50/30" : "bg-white", "hover:bg-amber-50/40")}>
                    <td className="sticky left-0 z-10 py-3.5 pl-6 pr-4 text-sm font-medium text-emerald-900/90 bg-inherit sm:pl-8 whitespace-nowrap shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-emerald-100 group-hover:text-emerald-800 transition-colors bg-white">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", idx % 2 === 0 ? "bg-emerald-300" : "bg-emerald-200", "group-hover:bg-amber-400")} />
                        {activity}
                      </div>
                    </td>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                      const status = optimisticLogs.get(day)?.[activity] ?? false
                      const isToday = currentDay === day
                      return (
                        <td key={`${day}-${activity}`} className={cn(
                          "px-1 py-1 text-center border-l border-emerald-50/50 relative transition-colors duration-300",
                          isToday ? "bg-amber-50/60 ring-1 ring-inset ring-amber-100/50" : ""
                        )}>
                          <label className="flex items-center justify-center w-full h-full cursor-pointer py-2">
                            <input type="checkbox" checked={status} onChange={() => handleToggle(day, activity, status)} className="peer sr-only" />
                            <div className={cn(
                              "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 sm:w-7 sm:h-7",
                              status
                                ? "bg-emerald-600 border-emerald-600 shadow-md ring-2 ring-emerald-100"
                                : cn("bg-white scale-95", isToday ? "border-emerald-300/80 hover:border-emerald-500" : "border-emerald-200 hover:border-emerald-400")
                            )}>
                              <svg className={cn("w-4 h-4 text-white transition-all duration-200 sm:w-5 sm:h-5", status ? "scale-100 opacity-100" : "scale-0 opacity-0")}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Bottom Sheet (shared by both views) ──────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setSelectedDay(null)}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isSheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out will-change-transform",
          "max-h-[90dvh]",
          isSheetOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-emerald-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-100 shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">Ramadan 2026</p>
            <h3 className="text-2xl font-bold text-emerald-900 font-hind-siliguri flex items-center gap-2">
              Day {selectedDay?.toLocaleString("bn-BD")}
              {selectedDay === currentDay && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">Today</span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Circular progress ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#d1fae5" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={sheetPct >= 80 ? "#f59e0b" : "#10b981"}
                  strokeWidth="3"
                  strokeDasharray={`${(sheetPct / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-emerald-800">
                {sheetPct}%
              </span>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center text-emerald-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header */}
        <div className="px-5 py-2 bg-emerald-50/60 border-b border-emerald-100/50 shrink-0">
          <p className="text-sm text-emerald-600 font-medium">{sheetDone} of {total} completed</p>
        </div>

        {/* Scrollable activity list */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-2 px-1 mb-2">
                <span>{section.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{section.label}</span>
              </div>
              <div className="space-y-1.5">
                {section.activities.map((activity) => {
                  const checked = selectedDay ? (optimisticLogs.get(selectedDay)?.[activity] ?? false) : false
                  return (
                    <button
                      key={activity}
                      onClick={() => selectedDay && handleToggle(selectedDay, activity, checked)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 active:scale-[0.98]",
                        checked
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white border border-emerald-100 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50/50"
                      )}
                    >
                      {checked
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                        : <Circle className="w-5 h-5 shrink-0 text-emerald-300" />
                      }
                      <span className="text-sm font-medium font-hind-siliguri leading-snug">{activity}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="h-8" />
        </div>
      </div>
    </>
  )
}
