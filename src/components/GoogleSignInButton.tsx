"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

interface GoogleSignInButtonProps {
  size?: "sm" | "default"
}

export function GoogleSignInButton({ size = "default" }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await signIn("google")
  }

  const isSmall = size === "sm"

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        isSmall
          ? "text-sm font-medium px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          : "w-full px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      }
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {isSmall ? "..." : "Redirecting to Google…"}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .587 5.387.587 12s5.28 12 11.893 12c3.48 0 6.147-1.133 8.213-3.293 2.08-2.16 2.72-5.467 2.72-8.227 0-.8-.08-1.56-.24-2.253h-10.693z" />
          </svg>
          Sign In with Google
        </>
      )}
    </button>
  )
}

