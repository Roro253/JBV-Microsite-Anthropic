"use client";

import { FormEvent, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "We couldn't find that email in our investor registry.",
  invalid: "Please enter a valid email address to continue.",
  registry_unavailable:
    "We couldn't reach our investor registry just now. Please try again shortly or contact your relationship manager.",
  email_failed:
    "We verified your email but couldn't send the magic link. Please try again or contact your relationship manager for help.",
  server:
    "We ran into an unexpected issue while preparing your magic link. Please try again shortly or contact your relationship manager."
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
        <label className="text-sm font-medium text-sky-900" htmlFor="email">
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
          className="w-full rounded-md border border-sky-200 bg-white px-4 py-3 text-base text-sky-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {message ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-sky-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending secure link…" : "Send me a magic link"}
      </button>
    </form>
  );
}
