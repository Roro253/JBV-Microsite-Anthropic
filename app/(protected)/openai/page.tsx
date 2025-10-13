import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { getOpenAIData } from "@/lib/data";
import { getOpenAIFundModel } from "@/lib/openaiFundModel";

export default async function OpenAIPage() {
  const data = getOpenAIData();
  let fundModel = null;
  try {
    fundModel = await getOpenAIFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[openai-page] unable to load fund model", error);
    }
    fundModel = null;
  }

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <OpenAIExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
