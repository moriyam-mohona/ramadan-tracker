import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function generatePasscode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous chars (0,O,1,I)
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters." }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    })

    if (existingUser) {
      // Username is taken — signal front-end to ask for passcode
      return NextResponse.json({ exists: true })
    }

    // New user — create account with a passcode
    const passcode = generatePasscode()

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        name: cleanUsername,
        isGuest: true,
        guestPasscode: passcode,
        email: `guest-${cleanUsername}@ramadan-diary.app`,
      },
    })

    return NextResponse.json({ exists: false, passcode, userId: newUser.id })
  } catch (error) {
    console.error("Guest API error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
