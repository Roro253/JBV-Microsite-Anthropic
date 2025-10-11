import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

interface FooterProps {
  lastUpdated?: string;
  className?: string;
}

export function Footer({ lastUpdated, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-sky-100/80 bg-white/85 backdrop-blur-xl",
        className
      )}
    >
      <Container className="flex flex-col gap-3 py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-balance">
          This microsite is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy securities. Forward-looking statements are illustrative and subject to change.
        </p>
        <p className="text-right text-slate-500">
          Last updated: <span className="text-sky-600">{lastUpdated ?? "—"}</span>
        </p>
      </Container>
    </footer>
  );
}
