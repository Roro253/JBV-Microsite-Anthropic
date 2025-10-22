import { Suspense } from "react";

import microsites from "@/data/microsites.json";

import { PaneAnnouncement } from "@/components/PaneAnnouncement";
import { PaneShell } from "@/components/PaneShell";
import { PaneSkeleton } from "@/components/PaneSkeleton";

const COMPANY_LOOKUP = (microsites as Array<{
  name: string;
  slug: string;
  symbol?: string | null;
  logo?: string | null;
  status?: string | null;
}>).reduce<Record<string, { name: string; slug: string; symbol?: string | null; logo?: string | null; status?: string | null }>>(
  (acc, item) => {
    acc[item.slug] = {
      name: item.name,
      slug: item.slug,
      symbol: item.symbol,
      logo: item.logo,
      status: item.status
    };
    return acc;
  },
  {}
);

interface PaneRouterProps {
  paneKey?: string;
  mode?: string;
}

export function PaneRouter({ paneKey, mode }: PaneRouterProps) {
  const company = paneKey ? COMPANY_LOOKUP[paneKey] : undefined;
  const normalizedMode =
    mode === "explorer" || mode === "investor" || mode === "intelligence" ? mode : undefined;

  return (
    <>
      <PaneAnnouncement open={Boolean(company)} companyName={company?.name} />
      {company ? (
        <Suspense fallback={<PaneSkeleton />}>
          <PaneShell company={company} mode={normalizedMode}>
            <Suspense fallback={<PaneSkeleton />}>
              <PaneContent paneKey={company.slug} />
            </Suspense>
          </PaneShell>
        </Suspense>
      ) : null}
    </>
  );
}

async function PaneContent({ paneKey }: { paneKey: string }) {
  switch (paneKey) {
    case "anthropic": {
      const mod = await import("@/app/@pane/(microsites)/anthropic/page");
      const Component = mod.default;
      return <Component />;
    }
    case "openai": {
      const mod = await import("@/app/@pane/(microsites)/openai/page");
      const Component = mod.default;
      return <Component />;
    }
    case "xai": {
      const mod = await import("@/app/@pane/(microsites)/xai/page");
      const Component = mod.default;
      return <Component />;
    }
    default:
      return null;
  }
}
