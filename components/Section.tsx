import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col gap-6 rounded-2xl border border-sky-100/80 bg-white/85 px-6 py-8 shadow-[0_30px_80px_-50px_rgba(32,118,199,0.45)] backdrop-blur",
        "sm:px-10 sm:py-10",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-balance text-2xl font-semibold text-slate-800 sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-slate-600 sm:text-base">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
