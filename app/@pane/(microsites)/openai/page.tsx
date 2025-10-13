import { OpenAIView, loadOpenAIMicrosite } from "@/components/microsites/OpenAIView";
import { PaneShell } from "@/components/PaneShell";
import { getMicrositeMeta } from "@/lib/micrositeMeta";

export default async function OpenAIPanePage() {
  const { data, fundModel } = await loadOpenAIMicrosite();
  const meta = getMicrositeMeta("openai");
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
      <OpenAIView data={data} fundModel={fundModel} variant="pane" />
    </PaneShell>
  );
}
