"use client"

import { useState, useOptimistic, startTransition } from "react"
import { toggleActivity } from "@/actions"
import { cn } from "@/lib/utils"

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

    await toggleActivity(day, activity, newStatus)
  }

  return (
    <div className="w-full overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th
                  scope="col"
                   className="sticky left-0 z-20 py-3 pl-4 pr-3 text-left text-sm font-semibold  bg-purple-700 sm:pl-6 min-w-[200px]"
                >
                  চ্যালেঞ্জ সমূহ
                </th>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className="px-2 py-3 text-center text-sm font-semibold  min-w-[40px]"
                  >
                    {day.toLocaleString("bn-BD")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              {ACTIVITIES.map((activity, idx) => (
                <tr key={activity} className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}>
                  <td className="sticky left-0 z-10 py-3 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 bg-inherit sm:pl-6 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {activity}
                  </td>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const status = optimisticLogs.get(day)?.[activity] ?? false
                    return (
                      <td key={`${day}-${activity}`} className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={status}
                          onChange={() => handleToggle(day, activity, status)}
                          className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600 cursor-pointer transition-transform active:scale-95"
                        />
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
