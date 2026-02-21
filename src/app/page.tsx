import { auth, signIn, signOut } from "@/auth"
import { getDayLogs } from "@/actions"
import { RamadanChart } from "@/components/RamadanChart"
import { PrayerTimes } from "@/components/PrayerTimes"
import { NavbarCountdown } from "@/components/NavbarCountdown"
import { InstallPrompt } from "@/components/InstallPrompt"
import { GuestLoginForm } from "@/components/GuestLoginForm"

export default async function Home() {
  const session = await auth()
  const logs = await getDayLogs()

  return (
    <div className="min-h-screen flex flex-col font-hind-siliguri">
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
              <span className="text-2xl text-amber-500">☪</span> Ramadan Planner
            </h1>
            <InstallPrompt />
          </div>
          
          {/* Center: Countdown (Visible on Desktop) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavbarCountdown />
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:inline-block text-emerald-900">
                  {session.user?.name}
                </span>
                 <form
                  action={async () => {
                    "use server"
                    await signOut()
                  }}
                >
                  <button type="submit" className="text-sm font-medium hover:underline text-emerald-700 hover:text-emerald-900 transition-colors">
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
                <form
                  action={async () => {
                    "use server"
                    await signIn("google")
                  }}
                >
                  <button type="submit" className="text-sm font-medium px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm">
                    Sign In with Google
                  </button>
                </form>
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
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
            
            {/* Hero Headers */}
            <div className="space-y-4 max-w-2xl mx-auto">
                <p className="text-3xl font-arabic text-emerald-800 opacity-90">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-emerald-900">
                  Ramadan <span className="text-amber-500">Journey</span>
                </h2>
                <p className="text-xl text-emerald-700/80 leading-relaxed">
                  A spiritual companion to track your prayers, Quran recitation, and daily good deeds.
                </p>
            </div>

            {/* Prayer Times for Guests */}
            <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-500">
                 <PrayerTimes />
            </div>
            
             <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-emerald-100/50 border border-emerald-50 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-amber-400"></div>
                 <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Start Your Journey
                 </h3>
                 <form
                    action={async () => {
                        "use server"
                        await signIn("google")
                    }}
                    className="w-full mb-6"
                >
                    <button type="submit" className="w-full px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .587 5.387.587 12s5.28 12 11.893 12c3.48 0 6.147-1.133 8.213-3.293 2.08-2.16 2.72-5.467 2.72-8.227 0-.8-.08-1.56-.24-2.253h-10.693z"/></svg>
                        Sign In with Google
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-emerald-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-emerald-500 font-medium tracking-wider">Or continue as guest</span>
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
