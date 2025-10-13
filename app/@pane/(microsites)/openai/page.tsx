import microsites from "@/data/microsites.json";
import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { PaneShell } from "@/components/PaneShell";
import { OpenAIView } from "@/components/microsites/OpenAIView";

interface OpenAIPanePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const companies = microsites as WatchlistMicrosite[];
const company = companies.find((item) => item.slug === "openai");

export default function OpenAIPanePage({ searchParams }: OpenAIPanePageProps) {
  const modeParam = typeof searchParams?.mode === "string" ? searchParams.mode : undefined;

  if (!company) {
    return null;
  }

  return (
    <PaneShell company={company} mode={modeParam}>
      {/* @ts-expect-error Async Server Component */}
      <OpenAIView layout="pane" />
    </PaneShell>
  );
}
