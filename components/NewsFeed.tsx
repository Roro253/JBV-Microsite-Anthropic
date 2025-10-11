import Link from "next/link";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NewsItem {
  title: string;
  publisher: string;
  date: string;
  whyItMatters: string;
  url: string;
  icon?: ReactNode;
}

interface NewsFeedProps {
  items: NewsItem[];
  animate?: boolean;
  className?: string;
}

export function NewsFeed({ items, animate = true, className }: NewsFeedProps) {
  return (
    <aside
      className={cn(
        "space-y-4 rounded-3xl border border-sky-200 bg-white/85 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Research publications</h3>
        <span className="text-xs uppercase tracking-[0.28em] text-sky-600">
          Anthropic research
        </span>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={item.url}
            initial={animate ? { opacity: 0, y: 12 } : false}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.35, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-[0_20px_50px_-40px_rgba(32,118,199,0.35)]"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-[0.2em] text-sky-500/80">
                {item.publisher}
              </span>
              <span>{item.date}</span>
            </div>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-sky-600"
            >
              {item.icon ? <span>{item.icon}</span> : null}
              <span className="text-left">{item.title}</span>
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-sm text-slate-600">{item.whyItMatters}</p>
          </motion.li>
        ))}
      </ul>
    </aside>
  );
}
