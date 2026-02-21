import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json()

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters." }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()

    // ── Mode 1: just check if username exists ───────────────────────────────
    if (!pin) {
      const existing = await prisma.user.findUnique({ where: { username: cleanUsername } })
      return NextResponse.json({ exists: !!existing })
    }

    // ── Mode 2: create new user with chosen PIN ──────────────────────────────
    if (typeof pin !== "string" || pin.length < 4 || pin.length > 6) {
      return NextResponse.json({ error: "PIN must be 4–6 digits." }, { status: 400 })
    }

    // Guard: don't create if username was just taken between steps
    const alreadyExists = await prisma.user.findUnique({ where: { username: cleanUsername } })
    if (alreadyExists) {
      return NextResponse.json({ exists: true })
    }

    await prisma.user.create({
      data: {
        username: cleanUsername,
        name: cleanUsername,
        isGuest: true,
        guestPasscode: pin,
        email: `guest-${cleanUsername}@ramadan-diary.app`,
      },
    })

    return NextResponse.json({ created: true })
  } catch (error) {
    console.error("Guest API error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
