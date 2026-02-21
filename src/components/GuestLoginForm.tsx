"use client"

import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

const LOCAL_STORAGE_KEY = "ramadan_guest"

type Step = "idle" | "checking" | "returning-passcode" | "signing-in"

interface SavedGuest {
  username: string
  passcode: string
}

interface GuestLoginFormProps {
  /** Renders a compact single-row layout for the navbar */
  compact?: boolean
}

export function GuestLoginForm({ compact = false }: GuestLoginFormProps) {
  const [step, setStep] = useState<Step>("idle")
  const [username, setUsername] = useState("")
  const [passcode, setPasscode] = useState("")
  const passcodeRef = useRef<HTMLInputElement>(null)

  // Auto-fill from localStorage on same device
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        const { username: u, passcode: p } = JSON.parse(saved) as SavedGuest
        setUsername(u)
        setPasscode(p)
      }
    } catch { /* ignore */ }
  }, [])

  const saveLocally = (u: string, p: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ username: u, passcode: p }))
    } catch { /* ignore */ }
  }

  /** After credentials are ready (username + passcode), sign in */
  const doSignIn = async (u: string, p: string) => {
    setStep("signing-in")
    const result = await signIn("credentials", { username: u, passcode: p, redirect: false })
    if (result?.error) {
      toast.error("Incorrect passcode. Please try again.")
      setStep("returning-passcode")
    } else {
      saveLocally(u, p)
      window.location.href = "/"
    }
  }

  /** Step 1: submit username — check if new or returning */
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const u = username.trim().toLowerCase()
    if (!u || u.length < 2) {
      toast.error("Username must be at least 2 characters.")
      return
    }

    setStep("checking")

    try {
      const res = await fetch("/api/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Something went wrong.")
        setStep("idle")
        return
      }

      if (data.exists) {
        // Returning user — need their passcode
        // Check if we have it saved locally
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (saved) {
            const { username: su, passcode: sp } = JSON.parse(saved) as SavedGuest
            if (su === u && sp) {
              // Auto sign-in with saved passcode
              await doSignIn(u, sp)
              return
            }
          }
        } catch { /* ignore */ }

        toast.info(`Welcome back, ${u}! Please enter your passcode.`)
        setStep("returning-passcode")
        setTimeout(() => passcodeRef.current?.focus(), 100)
      } else {
        // New user — passcode returned, save silently, sign in
        const { passcode: p } = data
        saveLocally(u, p)
        await doSignIn(u, p)
      }
    } catch {
      toast.error("Network error. Please try again.")
      setStep("idle")
    }
  }

  /** Step 2 (returning): submit passcode */
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = passcode.trim()
    if (!p) { toast.error("Please enter your passcode."); return }
    doSignIn(username.trim().toLowerCase(), p)
  }

  const isLoading = step === "checking" || step === "signing-in"

  // ─── Spinner ─────────────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  // ─── Returning user: passcode input ──────────────────────────────────────────
  if (step === "returning-passcode") {
    if (compact) {
      return (
        <form onSubmit={handlePasscodeSubmit} className="flex items-center gap-1">
          <input
            ref={passcodeRef}
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
            placeholder="Passcode"
            maxLength={6}
            className="w-24 px-2 py-1.5 text-xs border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50/50 text-emerald-900 font-mono tracking-widest uppercase text-center"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="text-xs font-medium px-3 py-1.5 border border-emerald-200 text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isLoading ? <Spinner /> : "Go"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("idle"); setPasscode("") }}
            className="text-xs text-emerald-400 hover:text-emerald-600"
            title="Back"
          >
            ✕
          </button>
        </form>
      )
    }

    return (
      <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-3 w-full">
        <p className="text-sm text-center text-emerald-700">
          Welcome back, <span className="font-bold">{username.trim().toLowerCase()}</span>!
          <br />
          <span className="text-xs text-emerald-500">Enter your 6-character passcode</span>
        </p>
        <input
          ref={passcodeRef}
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.toUpperCase())}
          placeholder="_ _ _ _ _ _"
          maxLength={6}
          autoComplete="off"
          className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-900 font-mono tracking-[0.4em] text-center text-lg uppercase"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 border-2 border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? <><Spinner /> Signing in…</> : "Sign In"}
        </button>
        <button
          type="button"
          onClick={() => { setStep("idle"); setPasscode("") }}
          className="text-xs text-emerald-400 hover:text-emerald-600 transition-colors text-center"
        >
          ← Use a different username
        </button>
      </form>
    )
  }

  // ─── Loading overlay (checking / signing-in) when not in passcode step ───────
  if (isLoading && !compact) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4 w-full">
        <div className="relative w-10 h-10">
          <svg className="animate-spin w-10 h-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <p className="text-sm text-emerald-600 animate-pulse">
          {step === "checking" ? "Checking username…" : "Signing you in…"}
        </p>
      </div>
    )
  }

  // ─── Default: Username input ──────────────────────────────────────────────────
  if (compact) {
    return (
      <form onSubmit={handleUsernameSubmit} className="flex items-center gap-1">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          minLength={2}
          maxLength={20}
          required
          disabled={isLoading}
          className="w-28 px-2 py-1.5 text-xs border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-emerald-50/50 text-emerald-900 disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="text-xs font-medium px-3 py-1.5 border border-emerald-200 text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isLoading ? <Spinner /> : "Guest"}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-3 w-full">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose a username…"
        minLength={2}
        maxLength={20}
        required
        disabled={isLoading}
        autoComplete="off"
        className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-900 placeholder:text-emerald-400 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 border-2 border-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? <><Spinner /> Checking…</> : "Begin as Guest"}
      </button>
    </form>
  )
}
