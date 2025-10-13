import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { getXaiData } from "@/lib/data";
import { getXAIFundModel } from "@/lib/xaiFundModel";

interface XAIViewProps {
  layout?: "full" | "pane";
}

export async function XAIView({ layout = "full" }: XAIViewProps) {
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

  const content = (
    <div className="flex flex-1 flex-col gap-10 py-10 md:py-12">
      <XaiExperience data={data} fundModel={fundModel} />
    </div>
  );

  if (layout === "pane") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {content}
      </div>
    );
  }

  return <Container className="flex flex-1 flex-col gap-10 py-12">{content}</Container>;
}
