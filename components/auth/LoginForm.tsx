"use client";

import { FormEvent, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "We couldn't find that email in our investor registry.",
  invalid: "Please enter a valid email address to continue.",
  server: "Something went wrong while preparing your magic link. Please try again shortly."
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage(ERROR_MESSAGES.invalid);
      return;
    }

    try {
      setStatus("loading");
      setMessage(null);

      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const errorKey = payload?.code ?? "server";
        setStatus("error");
        setMessage(ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.server);
        return;
      }

      setStatus("success");
      setMessage("We've emailed you a secure magic link. Please check your inbox.");
    } catch (error) {
      console.error("Failed to request magic link", error);
      setStatus("error");
      setMessage(ERROR_MESSAGES.server);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Work email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-base text-white shadow-sm outline-none transition focus:border-sky-400 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/60"
        />
      </div>

      {message ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            status === "success"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
              : "border-rose-400/40 bg-rose-400/10 text-rose-100"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-sky-500 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending secure link…" : "Send me a magic link"}
      </button>
    </form>
  );
}
