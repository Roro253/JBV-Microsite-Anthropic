import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { cn } from "@/lib/utils";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel } from "@/lib/xaiFundModel";
import { getIntelligenceFeed } from "@/lib/intelligence";

interface XAIViewProps {
  variant?: "full" | "pane";
}

export async function XAIView({ variant = "full" }: XAIViewProps) {
  const data = await getXaiData();
  const intelligence = getIntelligenceFeed("xai");
  let fundModel = null;

  try {
    fundModel = await getXAIFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[xai-view] unable to load fund model", error);
    }
    fundModel = null;
  }

  return (
    <Container
      className={cn(
        "flex flex-1 flex-col gap-10 py-12",
        variant === "pane" && "max-w-4xl px-4 sm:px-6"
      )}
    >
      <XaiExperience data={data} fundModel={fundModel} intelligence={intelligence} />
    </Container>
  );
}
