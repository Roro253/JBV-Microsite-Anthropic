import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel } from "@/lib/xaiFundModel";

export default async function XaiPage() {
  const [data, fundModel] = await Promise.all([
    getXaiData(),
    getXAIFundModel().catch(error => {
      console.error('[xai-page] unable to load fund model:', error);
      return null;
    })
  ]);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[xai-page] loaded fund model:', fundModel);
  }

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <XaiExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
