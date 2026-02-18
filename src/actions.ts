"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDayLogs() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
      const logs = await prisma.dayLog.findMany({
        where: { userId: session.user.id },
      })
      return logs.map(log => ({
        ...log,
        activities: (log.activities as Record<string, boolean>) || {}
      }))
  } catch (error) {
    console.error("Failed to fetch logs:", error)
    return []
  }
}

export async function toggleActivity(day: number, activity: string, status: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
      // Find existing log for this day
      const existingLog = await prisma.dayLog.findUnique({
        where: {
          userId_day: {
            userId: session.user.id,
            day: day,
          },
        },
      })

      if (existingLog) {
        // Update existing log
        const currentActivities = (existingLog.activities as Record<string, boolean>) || {}
        const newActivities = { ...currentActivities, [activity]: status }

        await prisma.dayLog.update({
          where: { id: existingLog.id },
          data: { activities: newActivities },
        })
      } else {
        // Create new log
        await prisma.dayLog.create({
          data: {
            userId: session.user.id,
            day: day,
            activities: { [activity]: status },
          },
        })
      }
      
      revalidatePath("/")
      return { success: true }
  } catch (error) {
      console.error("Error toggling activity:", error)
      // For demo purposes/optimistic UI, if DB is down, we might want to just silently fail (or return success so UI stays checked)
      // But correct behavior is to report failure. 
      // However, if we want "demo" mode to feel working, we return success: true even if DB failed?
      // No, that's misleading. Let's return false. User will see the checkmark revert if they refresh, but immediate revert is annoying.
      // Let's return success: false.
      return { success: false, error: "Failed to update (Database unavailable)" }
  }
}
