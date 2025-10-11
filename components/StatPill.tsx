import { type ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: string;
  icon?: ReactNode;
  animate?: boolean;
  className?: string;
}

export function StatPill({
  label,
  value,
  icon,
  animate = true,
  className
}: StatPillProps) {
  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/70 px-4 py-2 text-sm text-sky-700 shadow-[inset_0_2px_6px_rgba(32,118,199,0.08)]",
        className
      )}
    >
      {icon ? <span className="text-sky-500">{icon}</span> : null}
      <span className="text-xs uppercase tracking-[0.3em] text-sky-500/80">
        {label}
      </span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
