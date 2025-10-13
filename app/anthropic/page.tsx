import { AnthropicExperience } from "@/components/anthropic/AnthropicExperience";
import { Container } from "@/components/Container";
import { getAnthropicData } from "@/lib/data";
import { getAnthropicFundModel } from "@/lib/anthropicFundModel";

export default async function AnthropicPage() {
  const data = getAnthropicData();
  let fundModel = null;
  try {
    fundModel = await getAnthropicFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[anthropic-page] unable to load fund model", error);
    }
    fundModel = null;
  }

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <AnthropicExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
