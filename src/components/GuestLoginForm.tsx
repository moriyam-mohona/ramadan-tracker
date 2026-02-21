"use client"

import { useState, useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

const LOCAL_STORAGE_KEY = "ramadan_guest"

type Step =
  | "username"       // Step 1: enter username
  | "checking"       // API call in progress (step 1)
  | "set-pin"        // Step 2a: new user → choose a PIN
  | "enter-pin"      // Step 2b: returning user → enter saved PIN
  | "signing-in"     // Final sign-in in progress

interface SavedGuest {
  username: string
  pin: string
}

export function GuestLoginForm() {
  const [step, setStep] = useState<Step>("username")
  const [username, setUsername] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const pinRef = useRef<HTMLInputElement>(null)

  // Auto-fill from localStorage on same device
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        const { username: u, pin: p } = JSON.parse(saved) as SavedGuest
        setUsername(u)
        setPin(p)
      }
    } catch { /* ignore */ }
  }, [])

  const saveLocally = (u: string, p: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ username: u, pin: p }))
    } catch { /* ignore */ }
  }

  const doSignIn = async (u: string, p: string) => {
    setStep("signing-in")
    const result = await signIn("credentials", { username: u, passcode: p, redirect: false })
    if (result?.error) {
      toast.error("Incorrect PIN. Please try again.")
      setStep("enter-pin")
      setPin("")
    } else {
      saveLocally(u, p)
      window.location.href = "/"
    }
  }

  // ── Step 1: Check username ───────────────────────────────────────────────────
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const u = username.trim().toLowerCase()
    if (u.length < 2) { toast.error("Username must be at least 2 characters."); return }

    setStep("checking")

    try {
      const res = await fetch("/api/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Something went wrong."); setStep("username"); return }

      if (data.exists) {
        // Returning user — check localStorage first for auto-login
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (saved) {
            const { username: su, pin: sp } = JSON.parse(saved) as SavedGuest
            if (su === u && sp) {
              await doSignIn(u, sp)
              return
            }
          }
        } catch { /* ignore */ }

        // New device — ask for PIN
        setPin("")
        setStep("enter-pin")
        setTimeout(() => pinRef.current?.focus(), 100)
      } else {
        // New user — go to PIN creation
        setPin("")
        setConfirmPin("")
        setStep("set-pin")
        setTimeout(() => pinRef.current?.focus(), 100)
      }
    } catch {
      toast.error("Network error. Please try again.")
      setStep("username")
    }
  }

  // ── Step 2a: Create account with chosen PIN ──────────────────────────────────
  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length < 4) { toast.error("PIN must be at least 4 digits."); return }
    if (pin !== confirmPin) { toast.error("PINs do not match. Please try again."); return }

    setStep("signing-in")
    const u = username.trim().toLowerCase()

    try {
      const res = await fetch("/api/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, pin }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Something went wrong."); setStep("set-pin"); return }

      if (data.exists) {
        // Race condition — username was just taken
        toast.error("This username was just taken. Please choose another.")
        setStep("username")
        return
      }

      // Account created — now sign in
      await doSignIn(u, pin)
    } catch {
      toast.error("Network error. Please try again.")
      setStep("set-pin")
    }
  }

  // ── Step 2b: Sign in with existing PIN ──────────────────────────────────────
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) { toast.error("Please enter your PIN."); return }
    doSignIn(username.trim().toLowerCase(), pin)
  }

  // ─── Shared spinner ───────────────────────────────────────────────────────────
  const Spinner = ({ size = "sm" }: { size?: "sm" | "lg" }) => (
    <svg
      className={`animate-spin ${size === "lg" ? "w-10 h-10" : "w-4 h-4"} text-current`}
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  const inputClass = "w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 text-emerald-900 placeholder:text-emerald-400"
  const btnPrimary = "w-full px-4 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
  const btnSecondary = "w-full px-4 py-3 border-2 border-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
  const backBtn = "text-xs text-emerald-400 hover:text-emerald-600 transition-colors text-center"

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (step === "checking" || step === "signing-in") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 w-full">
        <Spinner size="lg" />
        <p className="text-sm text-emerald-600 animate-pulse">
          {step === "checking" ? "Checking username…" : "Signing you in…"}
        </p>
      </div>
    )
  }

  // ── Step 2a: New user — set PIN ──────────────────────────────────────────────
  if (step === "set-pin") {
    return (
      <form onSubmit={handleSetPin} className="flex flex-col gap-3 w-full">
        <div className="text-center mb-1">
          <p className="text-sm font-semibold text-emerald-800">
            Create a PIN for <span className="text-emerald-600">@{username.trim().toLowerCase()}</span>
          </p>
          <p className="text-xs text-emerald-500 mt-0.5">4–6 digits. You'll use this to sign in on any device.</p>
        </div>
        <input
          ref={pinRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Choose a PIN (4–6 digits)"
          maxLength={6}
          required
          className={`${inputClass} tracking-widest text-center text-lg`}
          autoComplete="new-password"
        />
        <input
          type="password"
          inputMode="numeric"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Confirm PIN"
          maxLength={6}
          required
          className={`${inputClass} tracking-widest text-center text-lg`}
          autoComplete="new-password"
        />
        <button type="submit" className={btnPrimary}>
          Create Account &amp; Sign In
        </button>
        <button type="button" onClick={() => { setStep("username"); setPin(""); setConfirmPin("") }} className={backBtn}>
          ← Choose a different username
        </button>
      </form>
    )
  }

  // ── Step 2b: Returning user — enter PIN ──────────────────────────────────────
  if (step === "enter-pin") {
    return (
      <form onSubmit={handlePinSubmit} className="flex flex-col gap-3 w-full">
        <div className="text-center mb-1">
          <p className="text-sm font-semibold text-emerald-800">
            Welcome back, <span className="text-emerald-600">@{username.trim().toLowerCase()}</span>!
          </p>
          <p className="text-xs text-emerald-500 mt-0.5">Enter your PIN to continue</p>
        </div>
        <input
          ref={pinRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter your PIN"
          maxLength={6}
          required
          className={`${inputClass} tracking-widest text-center text-lg`}
          autoComplete="current-password"
        />
        <button type="submit" className={btnSecondary}>
          Sign In
        </button>
        <button type="button" onClick={() => { setStep("username"); setPin("") }} className={backBtn}>
          ← Use a different username
        </button>
      </form>
    )
  }

  // ── Step 1: Username input ───────────────────────────────────────────────────
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
        autoComplete="off"
        className={inputClass}
      />
      <button type="submit" className={btnSecondary}>
        Continue
      </button>
    </form>
  )
}
