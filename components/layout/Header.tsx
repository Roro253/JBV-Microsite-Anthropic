import Image from "next/image";
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
        <Link href="/" aria-label="JBV Capital home" className="inline-flex items-center">
          <Image
            src="/images/jbv-logo.svg"
            alt="JBV Capital logo"
            width={140}
            height={60}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <ModeToggle className="flex items-center gap-2 text-xs text-slate-500" />
      </Container>
    </header>
  );
}
