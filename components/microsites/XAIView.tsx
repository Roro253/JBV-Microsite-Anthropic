import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { cn } from "@/lib/utils";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel, type XAIFundModel } from "@/lib/xaiFundModel";
import type { XaiData } from "@/lib/data";

type XaiViewVariant = "full" | "pane";

interface XAIViewProps {
  data: XaiData;
  fundModel: XAIFundModel | null;
  variant?: XaiViewVariant;
}

export function XAIView({ data, fundModel, variant = "full" }: XAIViewProps) {
  const content = <XaiExperience data={data} fundModel={fundModel} />;

  if (variant === "pane") {
    return (
      <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-8", "md:pb-20")}>{content}</div>
    );
  }

  return <Container className="flex flex-1 flex-col gap-10 py-12">{content}</Container>;
}

export async function loadXAIMicrosite(): Promise<{ data: XaiData; fundModel: XAIFundModel | null }> {
  const [data, fundModel] = await Promise.all([
    getXaiData(),
    getXAIFundModel().catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[xai-microsite] unable to load fund model", error);
      }
      return null;
    })
  ]);

  return { data, fundModel };
}
