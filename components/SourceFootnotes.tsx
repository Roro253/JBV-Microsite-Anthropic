import Link from "next/link";

import { cn } from "@/lib/utils";

interface SourceItem {
  claim: string;
  url: string;
}

interface SourceFootnotesProps {
  sources: SourceItem[];
  className?: string;
}

export function SourceFootnotes({ sources, className }: SourceFootnotesProps) {
  if (!sources?.length) return null;

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-sky-200 bg-white/85 p-6 text-xs text-slate-600",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
        Source footnotes
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        {sources.map((source, index) => (
          <li key={source.url} className="leading-relaxed">
            <span className="text-slate-600">{source.claim} </span>
            <Link
              href={source.url}
              target="_blank"
              rel="noopener"
              className="text-sky-600 hover:text-sky-500"
            >
              [{index + 1}]
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
