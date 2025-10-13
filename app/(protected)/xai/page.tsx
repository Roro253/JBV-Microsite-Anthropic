import { XAIView, loadXAIMicrosite } from "@/components/microsites/XAIView";

export default async function XaiPage() {
  const { data, fundModel } = await loadXAIMicrosite();

  return <XAIView data={data} fundModel={fundModel} variant="full" />;
}
