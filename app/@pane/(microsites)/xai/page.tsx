import microsites from "@/data/microsites.json";
import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { PaneShell } from "@/components/PaneShell";
import { XAIView } from "@/components/microsites/XAIView";

interface XaiPanePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const companies = microsites as WatchlistMicrosite[];
const company = companies.find((item) => item.slug === "xai");

export default function XaiPanePage({ searchParams }: XaiPanePageProps) {
  const modeParam = typeof searchParams?.mode === "string" ? searchParams.mode : undefined;

  if (!company) {
    return null;
  }

  return (
    <PaneShell company={company} mode={modeParam}>
      {/* @ts-expect-error Async Server Component */}
      <XAIView layout="pane" />
    </PaneShell>
  );
}
