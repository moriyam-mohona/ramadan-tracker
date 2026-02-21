import { auth, signIn, signOut } from "@/auth"
import { getDayLogs } from "@/actions"
import { RamadanChart } from "@/components/RamadanChart"
import { PrayerTimes } from "@/components/PrayerTimes"
import { NavbarCountdown } from "@/components/NavbarCountdown"
import { InstallPrompt } from "@/components/InstallPrompt"
import { GuestLoginForm } from "@/components/GuestLoginForm"
// import { GoogleSignInButton } from "@/components/GoogleSignInButton"

export default async function Home() {
  const session = await auth()
  const logs = await getDayLogs()

  // Format display name: capitalise first letter, prefix "Guest ·" for guest accounts
  const rawName = session?.user?.name ?? ""
  const isGuest = !session?.user?.email?.includes("@gmail.com") && session?.user?.email?.startsWith("guest-")
  const displayName = isGuest
    ? `Guest · ${rawName.charAt(0).toUpperCase() + rawName.slice(1)}`
    : rawName

  return (
    <div className="min-h-screen flex flex-col font-hind-siliguri">
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">

          {/* Logo — full text on sm+, icon-only on xs */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="text-2xl text-amber-500">☪</span>
              <span className="hidden sm:inline text-xl">Ramadan Planner</span>
            </h1>
            <InstallPrompt />
          </div>

          {/* Center countdow — grows to fill space, hidden on mobile */}
          <div className="flex flex-1 justify-center ">
            <NavbarCountdown />
          </div>

          {/* Spacer on mobile so right section stays right */}
          <div className="flex-1 md:hidden" />

          {/* Right section */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <>
                {/* Name: guest gets a pill badge, Google users get plain text */}
                {isGuest ? (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {displayName}
                  </span>
                ) : (
                  <span className="hidden sm:inline-block text-sm font-medium text-emerald-900 max-w-[140px] truncate">
                    {displayName}
                  </span>
                )}
                <form action={async () => { "use server"; await signOut() }}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline transition-colors whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                                  <div className="w-60 h-10 rounded-full hidden md:flex"/>   

              {/* <GoogleSignInButton size="sm" /> */}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {session ? (
           <div className="space-y-8">
                {/* Prayer Times Section */}
                <div className="w-full">
                     <PrayerTimes />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-100 pb-4">
                     <div>
                        <h2 className="text-2xl font-bold text-emerald-900">Daily Progress</h2>
                        <p className="text-emerald-600/80">Track your daily acts of worship.</p>
                     </div>
                </div>
                <RamadanChart initialLogs={logs} />
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 md:space-y-12 py-8 md:py-0">
            
            {/* Hero Headers */}
            <div className="space-y-3 max-w-2xl mx-auto px-2">
                <p className="text-xl sm:text-3xl font-arabic text-emerald-800 opacity-90">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-emerald-900">
                  Ramadan <span className="text-amber-500">Journey</span>
                </h2>
                <p className="text-base sm:text-xl text-emerald-700/80 leading-relaxed">
                  A spiritual companion to track your prayers, Quran recitation, and daily good deeds.
                </p>
            </div>

            {/* Prayer Times for Guests */}
            <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-500">
                 <PrayerTimes />
            </div>
            
             <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-50 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-amber-400"></div>
                 <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Start Your Journey
                 </h3>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-emerald-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-emerald-500 font-medium tracking-wider">Continue as guest</span>
                    </div>
                </div>

                <GuestLoginForm />
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
