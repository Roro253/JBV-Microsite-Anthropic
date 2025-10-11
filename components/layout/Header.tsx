import Link from "next/link";

import { ModeToggle } from "@/components/ModeToggle";
import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-sky-100/80 bg-white/80 backdrop-blur-xl",
        className
      )}
    >
      <Container className="flex h-[var(--header-height)] items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-semibold tracking-[0.32em] text-slate-600 no-underline transition"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/50 bg-gradient-to-br from-sky-200/60 to-sky-400/40 text-lg font-bold text-sky-700 shadow-[0_12px_24px_-18px_rgba(32,118,199,0.6)] group-hover:border-sky-400/80">
            JB
          </span>
          <span className="text-xs uppercase text-slate-600 group-hover:text-sky-600">
            JBV Capital
          </span>
        </Link>
        <ModeToggle className="hidden items-center gap-2 text-xs text-slate-500 md:flex" />
      </Container>
    </header>
  );
}
