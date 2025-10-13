import { OpenAIView, loadOpenAIMicrosite } from "@/components/microsites/OpenAIView";

export default async function OpenAIPage() {
  const { data, fundModel } = await loadOpenAIMicrosite();

  return <OpenAIView data={data} fundModel={fundModel} variant="full" />;
}
