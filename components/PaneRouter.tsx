import microsites from "@/data/microsites.json";
import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import AnthropicPane from "@/app/@pane/(microsites)/anthropic/page";
import OpenAIPane from "@/app/@pane/(microsites)/openai/page";
import XaiPane from "@/app/@pane/(microsites)/xai/page";
import { PaneAnnouncement } from "@/components/PaneAnnouncement";

interface PaneRouterProps {
  pane?: string | null;
  mode?: string | null;
}

const companies = microsites as WatchlistMicrosite[];

export function PaneRouter({ pane, mode }: PaneRouterProps) {
  const normalizedPane = typeof pane === "string" ? pane.toLowerCase() : null;
  const normalizedMode = typeof mode === "string" ? mode.toLowerCase() : undefined;

  if (!normalizedPane) {
    return <PaneAnnouncement message="Company details closed" />;
  }

  const company = companies.find((item) => item.slug === normalizedPane);
  const message = company ? `${company.name} details opened` : "Company details updated";
  const searchParams = normalizedMode ? { mode: normalizedMode } : undefined;

  switch (normalizedPane) {
    case "anthropic":
      return (
        <>
          <PaneAnnouncement message={message} />
          <AnthropicPane searchParams={searchParams} />
        </>
      );
    case "openai":
      return (
        <>
          <PaneAnnouncement message={message} />
          <OpenAIPane searchParams={searchParams} />
        </>
      );
    case "xai":
      return (
        <>
          <PaneAnnouncement message={message} />
          <XaiPane searchParams={searchParams} />
        </>
      );
    default:
      return <PaneAnnouncement message="Selected company is unavailable" />;
  }
}
