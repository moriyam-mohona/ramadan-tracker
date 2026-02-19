"use client"

import { useState, useOptimistic, startTransition, useMemo, useEffect } from "react"
import { toggleActivity } from "@/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Activities list
const ACTIVITIES = [
  "ফজর আদায় করেছি", "যোহর আদায় করেছি", "আসর আদায় করেছি", "মাগরিব আদায় করেছি", "ঈশা আদায় করেছি",
  "১ পৃষ্ঠা অর্থসহ কুরআন পড়েছি", "চোখের হেফাজত করেছি", "গীবত করিনি", "৫ টাকা দান করেছি", "গান শুনিনি",
  "৫ মিনিট দুআ করেছি", "বাবা-মার সাথে ভালো ব্যবহার করেছি", "সঠিক সময়ে ঘুমিয়েছি ও সাহরি খেয়েছি",
  "অর্ধপারা অর্থসহ কুরআন পড়েছি", "তারাবীহ আদায় করেছি", "সীরাত পড়েছি ১০ পৃষ্ঠা", "নেট ব্যবহার অর্ধেক কমিয়েছি",
  "তাহাজ্জুদ আদায় করেছি", "সকাল-সন্ধ্যার দুআ পড়েছি", "সীরাত পড়েছি ২০ পৃষ্ঠা", "১ পারা অর্থসহ কুরআন পড়েছি",
  "প্রয়োজন ছাড়া নেট ব্যবহার করিনি",
]

const SUCCESS_MESSAGES = [
    "Alhamdulillah! Keep shining.",
    "Mashallah! May Allah accept your effort.",
    "Subhanallah! Great job.",
    "JazakAllah Khair! Every good deed counts.",
    "Barakallahu Feek! Stay consistent.",
    "MashaAllah! One step closer to Jannah.",
    "Alhamdulillah for the ability to do good.",
    "Excellent! Allah loves consistency.",
    "Keep going! The gates of Rayyan await.",
    "Fabulous! Your record is shining.",
    "Wonderful! A beautiful deed for your scales.",
    "Subhanallah! Transforming your day, one deed at a time.",
    "Allahu Akbar! Keep the momentum going.",
    "MashaAllah! Building your palace in Jannah.",
    "Alhamdulillah! A blessed step forward.",
    "Great work! May this be a shield for you.",
    "Superb! Consistency is the key to success.",
    "Fantastic! Angels are writing this down.",
    "MashaAllah! You are doing great.",
    "Alhamdulillah! Keep your heart attached to Allah.",
    "Brilliant! May Allah increase you in goodness.",
    "Well done! Every effort is seen by Allah.",
    "MashaAllah! Striving for Ihsan.",
    "Alhamdulillah! Lighting up your grave with good deeds.",
    "Keep it up! Ramadan is fleeing fast."
]

type DayLog = {
  day: number
  activities: Record<string, boolean>
}

export function RamadanChart({ initialLogs }: { initialLogs: DayLog[] }) {
  const [currentDay, setCurrentDay] = useState<number | null>(null)

  // Determine current day of Ramadan (Approximate logic for 2026/1447)
  // Assuming Ramadan 2026 starts approx Feb 18. 
  // Adjust this logic as per actual moon sighting or generic "Day X"
  useEffect(() => {
    // Simple logic: just highlighting the day that matches today's date number for now
    // Or better: Assume Start Date and calc diff.
    const start = new Date('2026-02-19') // Approx start
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    // If within 1-30 range
    if (diffDays >= 1 && diffDays <= 30) {
        setCurrentDay(diffDays)
    }
  }, [])

  const initialDataMap = new Map<number, Record<string, boolean>>()
  initialLogs.forEach((log) => {
    initialDataMap.set(log.day, log.activities)
  })

  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    initialDataMap,
    (state, newLog: { day: number; activity: string; status: boolean }) => {
      const newState = new Map(state)
      const dayActivities = newState.get(newLog.day) || {}
      newState.set(newLog.day, { ...dayActivities, [newLog.activity]: newLog.status })
      return newState
    }
  )

  const handleToggle = async (day: number, activity: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    
    startTransition(() => {
      addOptimisticLog({ day, activity, status: newStatus })
    })

    try {
        const result = await toggleActivity(day, activity, newStatus)
        if (result.success && newStatus) {
            const randomMsg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]
            toast.success(randomMsg, { 
                duration: 2500, 
                className: "bg-white text-emerald-900 border-l-4 border-emerald-500 shadow-md font-medium flex items-center gap-2",
                icon: <span className="text-xl">🌙</span>
            })
        } else if (!result.success) {
            toast.error("Failed to save", { className: "bg-red-50 text-red-800" })
        }
    } catch (error) {
        toast.error("Network error")
    }
  }

  // Calculate stats
  const completionStats = useMemo(() => {
    const Stats = new Map<number, number>()
    for (let i = 1; i <= 30; i++) {
        const activities = optimisticLogs.get(i) || {}
        const count = Object.values(activities).filter(Boolean).length
        Stats.set(i, count)
    }
    return Stats
  }, [optimisticLogs])

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-emerald-100/50 border-separate border-spacing-0">
            <thead className="bg-emerald-900 text-emerald-50">
              {/* Day Headers */}
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 top-0 z-30 py-4 pl-6 pr-4 text-left text-sm font-bold bg-emerald-900 min-w-[240px] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)] border-r border-emerald-800/50 border-b border-emerald-800"
                >
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
                      className={cn(
                        "sticky top-0 z-20 px-1 py-4 text-center min-w-[55px] border-l border-emerald-800/30 transition-colors duration-300 relative group border-b border-emerald-800",
                        isToday ? "bg-emerald-800" : "bg-emerald-900 hover:bg-emerald-800/50"
                      )}
                    >
                      {isToday && (
                         <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-amber-500 text-[9px] font-bold text-emerald-900 px-1.5 py-0.5 rounded-b-md shadow-sm z-30 ring-2 ring-emerald-900">TODAY</span>
                      )}
                      <div className="flex flex-col items-center gap-0.5 z-0 relative">
                          <span className={cn("text-[10px] uppercase tracking-wider font-light", isToday ? "text-amber-400 font-bold" : "text-emerald-300/70")}>Day</span>
                          <span className={cn("text-lg font-hind-siliguri leading-none", isToday ? "text-white font-bold scale-110" : "")}>{day.toLocaleString("bn-BD")}</span>
                      </div>
                    </th>
                  )
                })}
              </tr>
              
              {/* Stats Summary Row (Moved to Header) */}
              <tr>
                 <th className="sticky left-0 top-[60px] z-30 py-3 pl-6 pr-4 text-right text-xs uppercase tracking-wider bg-emerald-800/95 backdrop-blur-sm sm:pl-8 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)] border-r border-emerald-700 border-b border-emerald-800/50 text-emerald-200">
                      Progress
                  </th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                      const count = completionStats.get(day) || 0
                      const total = ACTIVITIES.length
                      const percentage = Math.round((count / total) * 100)
                      const isHigh = percentage >= 80
                      const isMed = percentage >= 40 && percentage < 80
                      const isToday = currentDay === day

                      return (
                        <th key={`stats-${day}`} className={cn(
                            "sticky top-[60px] z-20 px-1 py-3 text-center border-l border-emerald-700/30 border-b border-emerald-800/50 bg-emerald-900/95 backdrop-blur-sm",
                             isToday ? "bg-emerald-800/95" : ""
                        )}>
                            <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                                {/* Mini Progress Bar */}
                                <div className="w-1.5 h-8 bg-emerald-950/50 rounded-full overflow-hidden relative">
                                    <div 
                                        className={cn("w-full absolute bottom-0 rounded-full transition-all duration-500", 
                                            isHigh ? "bg-amber-400" : isMed ? "bg-emerald-400" : "bg-emerald-600"
                                        )}
                                        style={{ height: `${percentage}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-mono leading-none",
                                    isHigh ? "text-amber-400" : isMed ? "text-emerald-200" : "text-emerald-500/70"
                                )}>
                                    {count}
                                </span>
                            </div>
                        </th>
                      )
                  })}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 bg-white">
              {ACTIVITIES.map((activity, idx) => (
                <tr key={activity} className={cn(
                    "group transition-colors duration-200", 
                    idx % 2 === 0 ? "bg-emerald-50/30" : "bg-white",
                    "hover:bg-amber-50/40"
                )}>
                  <td className="sticky left-0 z-10 py-3.5 pl-6 pr-4 text-sm font-medium text-emerald-900/90 bg-inherit sm:pl-8 whitespace-nowrap shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] border-r border-emerald-100 group-hover:text-emerald-800 transition-colors bg-white">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            idx % 2 === 0 ? "bg-emerald-300" : "bg-emerald-200",
                            "group-hover:bg-amber-400"
                        )}></span>
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
                            <input
                                type="checkbox"
                                checked={status}
                                onChange={() => handleToggle(day, activity, status)}
                                className="peer sr-only" 
                            />
                            {/* Custom Checkbox Design */}
                            <div className={cn(
                                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 sm:w-7 sm:h-7",
                                // Checked State
                                status 
                                    ? "bg-emerald-600 border-emerald-600 shadow-md scale-100 rotate-0 ring-2 ring-emerald-100" 
                                    : cn(
                                        // Unchecked State - Enhanced Visibility
                                        "bg-white scale-95",
                                        isToday 
                                            ? "border-emerald-300/80 hover:border-emerald-500" 
                                            : "border-emerald-200 hover:border-emerald-400"
                                    )
                            )}>
                                <svg 
                                    className={cn(
                                        "w-4 h-4 text-white transition-all duration-200 ease-out sm:w-5 sm:h-5",
                                        status ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                    )}
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
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
  )
}
