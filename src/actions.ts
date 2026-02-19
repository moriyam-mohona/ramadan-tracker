"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type DayLog = {
  day: number
  activities: Record<string, boolean>
  userId?: string
  id?: string
  updatedAt?: Date
}

export async function getDayLogs(): Promise<DayLog[]> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) return []

  try {
      const logs = await prisma.activityLog.findMany({
        where: { userId },
      })
      
      // Transform relational data to Map<Day, Activities>
      const dayMap = new Map<number, Record<string, boolean>>()
      
      logs.forEach((log) => {
          const currentDayActivities = dayMap.get(log.day) || {}
          currentDayActivities[log.activity] = log.isCompleted
          dayMap.set(log.day, currentDayActivities)
      })

      // Convert Map to array of objects expected by frontend
      return Array.from(dayMap.entries()).map(([day, activities]) => ({
          day,
          activities,
          userId,
          id: `day-${day}`, // Dummy ID for frontend compatibility
          updatedAt: new Date()
      }))
  } catch (error) {
    console.error("Failed to fetch logs:", error)
    return []
  }
}

export async function toggleActivity(day: number, activity: string, status: boolean) {
  const session = await auth()
  const userId = session?.user?.id
  
  if (!userId) throw new Error("Unauthorized")

  try {
      await prisma.activityLog.upsert({
          where: {
              userId_day_activity: {
                  userId,
                  day,
                  activity
              }
          },
          update: {
              isCompleted: status
          },
          create: {
              userId,
              day,
              activity,
              isCompleted: status
          }
      })
      
      revalidatePath("/")
      return { success: true }
  } catch (error) {
      console.error("Error toggling activity:", error)
      return { success: false }
  }
}
