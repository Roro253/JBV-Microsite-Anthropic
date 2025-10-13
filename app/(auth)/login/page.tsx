import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { verifySessionToken } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Secure Login — JBV Capital"
};

const STATUS_MESSAGES: Record<string, { tone: "error" | "info"; message: string }> = {
  "invalid-token": {
    tone: "error",
    message: "That magic link has expired or was already used. Please request a new link."
  },
  "missing-token": {
    tone: "error",
    message: "We couldn't verify your request. Please use the link sent to your email or request another one."
  },
  signedOut: {
    tone: "info",
    message: "You've been signed out. Enter your email below for a fresh magic link."
  }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("jbv_session");
  if (sessionCookie) {
    const session = await verifySessionToken(sessionCookie.value);
    if (session) {
      redirect("/");
    }
  }

  const statusKey = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const banner = statusKey ? STATUS_MESSAGES[statusKey] : undefined;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.25),_transparent_55%)]" />
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-300">JBV Capital</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Investor portal access</h1>
          <p className="text-sm text-slate-300">
            Enter the email address associated with your investor profile. We&apos;ll confirm it against our registry and send you a
            secure, one-time magic link.
          </p>
        </div>

        {banner ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              banner.tone === "info"
                ? "border-sky-400/40 bg-sky-400/10 text-sky-100"
                : "border-rose-400/40 bg-rose-400/10 text-rose-100"
            }`}
          >
            {banner.message}
          </div>
        ) : null}

        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-900/40 backdrop-blur">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-400">
          Need help? Contact your JBV Capital relationship manager for assistance.
        </p>
      </div>
    </div>
  );
}
