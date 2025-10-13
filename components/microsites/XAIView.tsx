import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel } from "@/lib/xaiFundModel";
import { cn } from "@/lib/utils";

interface XaiViewProps {
  variant?: "full" | "pane";
}

export async function XAIView({ variant = "full" }: XaiViewProps) {
  const data = await getXaiData();
  let fundModel = null;
  try {
    fundModel = await getXAIFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[xai-view] unable to load fund model", error);
    }
    fundModel = null;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[xai-view] loaded fund model:", fundModel);
  }

  return (
    <Container
      className={cn(
        "flex flex-1 flex-col gap-10",
        variant === "pane"
          ? "max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:px-8"
          : "py-12"
      )}
    >
      <XaiExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
