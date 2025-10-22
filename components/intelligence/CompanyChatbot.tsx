"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface CompanyChatbotProps {
  companySlug: string;
  config: {
    name: string;
    tagline: string;
    welcome: string;
    sampleQuestions: string[];
  };
}

export function CompanyChatbot({ companySlug, config }: CompanyChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: config.welcome }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: config.welcome }]);
  }, [config.welcome]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const assistantLabel = useMemo(() => config.name ?? "AI Concierge", [config.name]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/intelligence/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companySlug,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to fetch response");
      }

      const payload = (await response.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: payload.reply }]);
    } catch (err) {
      const fallback = err instanceof Error ? err.message : "Unexpected error";
      setError(fallback);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I hit a snag reaching the intelligence engine. Try again in a moment."
        }
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_52px_-40px_rgba(15,23,42,0.5)]">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Live Concierge
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{assistantLabel}</h2>
        <p className="text-sm text-slate-600">{config.tagline}</p>
      </header>

      <div
        ref={scrollContainerRef}
        className="mt-4 max-h-[360px] space-y-4 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} message={message} assistantLabel={assistantLabel} />
        ))}
      </div>

      {config.sampleQuestions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {config.sampleQuestions.map((question) => (
            <Button
              key={question}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInput(question)}
              className="border-slate-200 text-xs text-slate-600 hover:border-slate-300"
            >
              {question}
            </Button>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything about this company..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-sky-600 text-white hover:bg-sky-500"
            disabled={isLoading}
            aria-label="Send question"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        <p className="text-[11px] text-slate-400">
          Responses blend company data, recent milestones, and AI-generated analysis. Always double-check before making investment decisions.
        </p>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  assistantLabel
}: {
  message: ChatMessage;
  assistantLabel: string;
}) {
  const isAssistant = message.role === "assistant";
  return (
    <div
      className={cn(
        "flex",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isAssistant
            ? "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700"
            : "rounded-br-md bg-sky-600 text-white"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em]">
          {isAssistant ? assistantLabel : "You"}
        </p>
        <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
