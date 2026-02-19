"use client"

import { useEffect, useState } from "react"
import { Download, Share, PlusSquare, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  // Initially true to show button, then we check status
  const [isInstallable, setIsInstallable] = useState(false) 
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if standalone (already installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);
    
    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // If not installed and on iOS, it IS installable (manually)
    if (ios && !isInStandaloneMode) {
        setIsInstallable(true);
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    // 1. Native Prompt (Android / Chrome Desktop)
    if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        setDeferredPrompt(null)
        if (outcome === 'accepted') {
             setIsStandalone(true);
        }
        return
    }

    // 2. iOS Instruction
    if (isIOS) {
        toast.custom((t) => (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-emerald-100 w-full max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Share className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-emerald-900">Install App</h3>
                        <p className="text-sm text-emerald-700/80">
                            Tap the <span className="font-bold">Share</span> button below, then scroll down and tap <span className="font-bold inline-flex items-center gap-1"><PlusSquare className="w-3 h-3"/> Add to Home Screen</span>.
                        </p>
                    </div>
                    <button onClick={() => toast.dismiss(t)} className="text-emerald-400 hover:text-emerald-600">×</button>
                </div>
            </div>
        ), { duration: 8000, position: 'bottom-center' })
        return
    }

    // 3. Fallback (Chrome/General)
    toast.message("Install App", {
        description: "Click the 'Install' icon in your browser's address bar, or use the menu (⋮) > Install App.",
        icon: <MoreVertical className="w-4 h-4" />
    })
  }

  // Hide if already installed
  if (isStandalone) return null

  // Always show button if we think it's possible to install (even if manual)
  // For debugging/user clarity: Let's show it always unless standalone, 
  // but maybe handle the 'useless' case effectively.
  // Actually, if we haven't detected iOS and no prompt event fired, it might be Firefox or desktop Safari or 'Already Installed' but not detected.
  // Let's safe guard: Show if deferredPrompt OR iOS OR just fallback (let user try).
  
  return (
    <button
      onClick={handleInstallClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-sm ml-2",
        // Previously: "hidden md:flex" - Removing this to show on Mobile
      )}
    >
      <Download className="w-3 h-3" />
      <span className="hidden xs:inline">Install</span>
      <span className="xs:hidden">App</span>
    </button>
  )
}
