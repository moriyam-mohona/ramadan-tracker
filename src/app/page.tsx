import { auth, signIn, signOut } from "@/auth"
import { getDayLogs } from "@/actions"
import { RamadanChart } from "@/components/RamadanChart"

export default async function Home() {
  const session = await auth()
  const logs = await getDayLogs()

  return (
    <div className="min-h-screen flex flex-col font-hind-siliguri">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ramadan Planner
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {session.user?.name}
                </span>
                 <form
                  action={async () => {
                    "use server"
                    await signOut()
                  }}
                >
                  <button type="submit" className="text-sm font-medium hover:underline text-gray-600">
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
                <div className="flex gap-2">
                     <form
                      action={async () => {
                        "use server"
                        await signIn("google")
                      }}
                    >
                      <button type="submit" className="text-sm font-medium px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                        Sign In with Google
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server"
                        await signIn("credentials")
                      }}
                    >
                      <button type="submit" className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                        Guest Access
                      </button>
                    </form>
                </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {session ? (
           <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h2 className="text-2xl font-bold">Daily Progress</h2>
                        <p className="text-gray-500">Track your daily acts of worship.</p>
                     </div>
                </div>
                <RamadanChart initialLogs={logs} />
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Track your Ramadan Journey</h2>
            <p className="text-xl text-gray-500 max-w-lg">
              A simple, distraction-free planner to keep track of your daily prayers, Quran recitation, and good deeds.
            </p>
             <form
                action={async () => {
                    "use server"
                    await signIn("credentials")
                }}
            >
                <button type="submit" className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl">
                    Get Started as Guest
                </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
