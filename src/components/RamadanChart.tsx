"use client"

import { useState, useOptimistic, startTransition } from "react"
import { toggleActivity } from "@/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Activities list based on the provided image (translated/transcribed)
const ACTIVITIES = [
  "ফজর আদায় করেছি", // Fajr
  "যোহর আদায় করেছি", // Zhuhr
  "আসর আদায় করেছি", // Asr
  "মাগরিব আদায় করেছি", // Maghrib
  "ঈশা আদায় করেছি", // Isha
  "১ পৃষ্ঠা অর্থসহ কুরআন পড়েছি", // 1 page Quran with meaning
  "চোখের হেফাজত করেছি", // Gaze protection
  "গীবত করিনি", // No backbiting
  "৫ টাকা দান করেছি", // Charity (5 taka/currency)
  "গান শুনিনি", // No music
  "৫ মিনিট দুআ করেছি", // 5 mins Dua
  "বাবা-মার সাথে ভালো ব্যবহার করেছি", // Good behavior with parents
  "সঠিক সময়ে ঘুমিয়েছি ও সাহরি খেয়েছি", // Sleep/Sahri on time
  "অর্ধপারা অর্থসহ কুরআন পড়েছি", // 1/2 para Quran with meaning
  "তারাবীহ আদায় করেছি", // Taraweeh
  "সীরাত পড়েছি ১০ পৃষ্ঠা", // Seerat 10 pages
  "নেট ব্যবহার অর্ধেক কমিয়েছি", // Reduced net usage by half
  "তাহাজ্জুদ আদায় করেছি", // Tahajjud
  "সকাল-সন্ধ্যার দুআ পড়েছি", // Morning/Evening Dua
  "সীরাত পড়েছি ২০ পৃষ্ঠা", // Seerat 20 pages
  "১ পারা অর্থসহ কুরআন পড়েছি", // 1 para Quran with meaning
  "প্রয়োজন ছাড়া নেট ব্যবহার করিনি", // No useless net usage
]

type DayLog = {
  day: number
  activities: Record<string, boolean>
}

export function RamadanChart({ initialLogs }: { initialLogs: DayLog[] }) {
  // Convert array to a map for easier lookup: day -> activities
  const initialDataMap = new Map<number, Record<string, boolean>>()
  initialLogs.forEach((log) => {
    initialDataMap.set(log.day, log.activities)
  })

  // Optimistic state
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
        if (result.success) {
            toast.success("Saved", { duration: 1000, className: "bg-emerald-50 text-emerald-800 border-emerald-200" })
        } else {
            toast.error("Failed to save")
        }
    } catch (error) {
        toast.error("Network error")
    }
  }

  return (
    <div className="w-full overflow-x-auto border rounded-2xl shadow-lg bg-white border-emerald-100/50">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-2xl">
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-800 text-white">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 py-4 pl-6 pr-3 text-left text-sm font-bold bg-emerald-900 sm:pl-8 min-w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] border-r border-emerald-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400">❖</span> চ্যালেঞ্জ সমূহ
                  </span>
                </th>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className="px-2 py-4 text-center text-sm font-semibold min-w-[45px] border-l border-emerald-700/30"
                  >
                    <div className="flex flex-col items-center">
                        <span className="text-xs opacity-70 font-normal">Day</span>
                        <span>{day.toLocaleString("bn-BD")}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 bg-white">
              {ACTIVITIES.map((activity, idx) => (
                <tr key={activity} className={idx % 2 === 0 ? "bg-emerald-50/30" : "bg-white hover:bg-emerald-50/10 transition-colors"}>
                  <td className="sticky left-0 z-10 py-3 pl-6 pr-3 text-sm font-medium text-emerald-900 bg-inherit sm:pl-8 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-emerald-100">
                    {activity}
                  </td>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const status = optimisticLogs.get(day)?.[activity] ?? false
                    return (
                      <td key={`${day}-${activity}`} className="px-2 py-3 text-center border-l border-emerald-50">
                        <label className="relative flex items-center justify-center cursor-pointer group">
                            <input
                            type="checkbox"
                            checked={status}
                            onChange={() => handleToggle(day, activity, status)}
                            className="peer sr-only" 
                            />
                            <div className={`w-6 h-6 rounded-md border-2 transition-all duration-200 
                                ${status 
                                    ? "bg-emerald-600 border-emerald-600 scale-100" 
                                    : "border-gray-300 bg-white group-hover:border-emerald-300"
                                }`}
                            >
                                <svg 
                                    className={`w-full h-full text-white transition-transform duration-200 ${status ? "scale-100" : "scale-0"}`} 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
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
