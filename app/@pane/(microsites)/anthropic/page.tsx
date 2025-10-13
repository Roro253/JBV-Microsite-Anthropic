import { AnthropicView, loadAnthropicMicrosite } from "@/components/microsites/AnthropicView";
import { PaneShell } from "@/components/PaneShell";
import { getMicrositeMeta } from "@/lib/micrositeMeta";

export default async function AnthropicPanePage() {
  const { data, fundModel } = await loadAnthropicMicrosite();
  const meta = getMicrositeMeta("anthropic");
  if (!meta) {
    return null;
  }

  return (
    <PaneShell
      companyName={meta.name}
      companySlug={meta.slug}
      logoSrc={meta.logo ?? "/logos/placeholder.svg"}
      symbol={meta.symbol ?? "—"}
      statusLabel={meta.status === "active" ? "Active" : meta.status === "coming_soon" ? "Coming Soon" : "Closed"}
      valuationLabel={meta.valuationLabel ?? undefined}
      thesisLine={meta.notes ?? null}
    >
      <AnthropicView data={data} fundModel={fundModel} variant="pane" />
    </PaneShell>
  );
}
