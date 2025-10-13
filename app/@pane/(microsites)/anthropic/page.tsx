import microsites from "@/data/microsites.json";
import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { AnthropicView } from "@/components/microsites/AnthropicView";
import { PaneShell } from "@/components/PaneShell";

interface AnthropicPanePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const companies = microsites as WatchlistMicrosite[];
const company = companies.find((item) => item.slug === "anthropic");

export default function AnthropicPanePage({ searchParams }: AnthropicPanePageProps) {
  const modeParam = typeof searchParams?.mode === "string" ? searchParams.mode : undefined;

  if (!company) {
    return null;
  }

  return (
    <PaneShell company={company} mode={modeParam}>
      {/* @ts-expect-error Async Server Component */}
      <AnthropicView layout="pane" />
    </PaneShell>
  );
}
