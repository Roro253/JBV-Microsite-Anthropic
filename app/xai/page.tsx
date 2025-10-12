import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel } from "@/lib/xaiFundModel";

export default async function XaiPage() {
  const data = getXaiData();
  let fundModel = null;

  try {
    fundModel = await getXAIFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[xai-page] unable to load fund model", error);
    }
    fundModel = null;
  }

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <XaiExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
