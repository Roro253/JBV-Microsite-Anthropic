import { AnthropicView, loadAnthropicMicrosite } from "@/components/microsites/AnthropicView";

export default async function AnthropicPage() {
  const { data, fundModel } = await loadAnthropicMicrosite();

  return <AnthropicView data={data} fundModel={fundModel} variant="full" />;
}
