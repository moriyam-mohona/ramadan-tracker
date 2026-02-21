import { signIn } from "@/auth";
import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "Unknown";

  const title = error === "AccessDenied" ? "Access denied" : "Sign-in error";

  const hint =
    error === "AccessDenied"
      ? "Google refused the sign-in. Common causes: the OAuth consent screen is in Testing and your account isn’t listed as a Test user, the app is Internal (Workspace-only), or you used a different Google account than expected."
      : "Authentication failed. Check server logs for the underlying provider error.";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-linear-to-b from-emerald-50 to-white">
      <div className="w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/50">
        <h1 className="text-2xl font-bold text-emerald-900">{title}</h1>
        <p className="mt-3 text-emerald-800/80">{hint}</p>

        <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
          <p className="text-sm text-emerald-900">
            Error code: <span className="font-mono">{error}</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Try Google again
            </button>
          </form>

          <Link
            href="/"
            className="w-full text-center rounded-lg border border-emerald-200 px-4 py-3 font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-xs text-emerald-700/70">
          If this happens only on Vercel, confirm these env vars are set:
          AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL.
        </p>
      </div>
    </div>
  );
}
