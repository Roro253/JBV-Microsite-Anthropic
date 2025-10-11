"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CallToActionProps {
  reserveUrl: string;
  diligenceUrl: string;
  animate?: boolean;
  className?: string;
}

type ActionKey = "reserve" | "diligence" | null;

export function CallToAction({
  reserveUrl,
  diligenceUrl,
  animate = true,
  className
}: CallToActionProps) {
  const [active, setActive] = useState<ActionKey>(null);

  const trigger = (key: Exclude<ActionKey, null>, url: string) => {
    setActive(key);
    setTimeout(() => {
      if (url === "#" || !url) {
        setActive(null);
        return;
      }
      window.open(url, "_blank", "noopener");
      setActive(null);
    }, 1200);
  };

  const renderButton = (
    key: Exclude<ActionKey, null>,
    label: string,
    icon: React.ReactNode,
    url: string
  ) => (
    <Button
      key={key}
      size="lg"
      variant="default"
      className="relative w-full overflow-hidden"
      onClick={() => trigger(key, url)}
    >
      <span className="inline-flex items-center gap-2">
      {icon}
      {label}
    </span>
    {active === key ? (
      <motion.span
        className="absolute inset-0 bg-sky-300/30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: animate ? 1.2 : 0,
          ease: [0.16, 1, 0.3, 1]
          }}
          style={{ originX: 0 }}
        />
      ) : null}
    </Button>
  );

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl border border-sky-200 bg-white/85 p-6 shadow-[0_30px_60px_-45px_rgba(32,118,199,0.35)]",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Diligence runway
        </p>
        <h3 className="text-2xl font-semibold text-slate-800">Allocate time</h3>
        <p className="text-sm text-slate-600">
          Quick Typeform intake or book a 15-minute diligence block with the JBV Capital team.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {renderButton("reserve", "Reserve interest", <Sparkles className="h-4 w-4" />, reserveUrl)}
        {renderButton("diligence", "15-min diligence", <Calendar className="h-4 w-4" />, diligenceUrl)}
      </div>
      {active ? (
        <div className="text-xs text-sky-600">Allocating compute…</div>
      ) : null}
    </div>
  );
}
