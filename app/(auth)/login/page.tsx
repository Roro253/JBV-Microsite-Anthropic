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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("jbv_session");
  if (sessionCookie) {
    const session = await verifySessionToken(sessionCookie.value);
    if (session) {
      redirect("/");
    }
  }

  const statusKey =
    typeof resolvedSearchParams?.status === "string"
      ? resolvedSearchParams.status
      : undefined;
  const banner = statusKey ? STATUS_MESSAGES[statusKey] : undefined;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-sky-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(125,211,252,0.2),_transparent_55%)]" />
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-600">JBV Capital</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Investor portal access</h1>
          <p className="text-sm text-slate-600">
            Enter the email address associated with your investor profile. We&apos;ll confirm it against our registry and send you a
            secure, one-time magic link.
          </p>
        </div>

        {banner ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              banner.tone === "info"
                ? "border-sky-500/30 bg-sky-50 text-sky-700"
                : "border-rose-500/30 bg-rose-50 text-rose-700"
            }`}
          >
            {banner.message}
          </div>
        ) : null}

        <div className="rounded-xl border border-sky-100 bg-white/90 p-8 shadow-xl shadow-sky-100 backdrop-blur">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-500">
          Need help? Contact your JBV Capital relationship manager for assistance.
        </p>
      </div>
    </div>
  );
}
