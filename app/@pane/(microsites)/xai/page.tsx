import { XAIView, loadXAIMicrosite } from "@/components/microsites/XAIView";
import { PaneShell } from "@/components/PaneShell";
import { getMicrositeMeta } from "@/lib/micrositeMeta";

export default async function XAIPanePage() {
  const { data, fundModel } = await loadXAIMicrosite();
  const meta = getMicrositeMeta("xai");
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
      <XAIView data={data} fundModel={fundModel} variant="pane" />
    </PaneShell>
  );
}
