import { AnthropicExperience } from "@/components/anthropic/AnthropicExperience";
import { Container } from "@/components/Container";
import { getAnthropicData } from "@/lib/data";
import { getAnthropicFundModel } from "@/lib/anthropicFundModel";

interface AnthropicViewProps {
  layout?: "full" | "pane";
}

export async function AnthropicView({ layout = "full" }: AnthropicViewProps) {
  const data = getAnthropicData();
  let fundModel = null;

  try {
    fundModel = await getAnthropicFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[anthropic-view] unable to load fund model", error);
    }
    fundModel = null;
  }

  const content = (
    <div className="flex flex-1 flex-col gap-10 py-10 md:py-12">
      <AnthropicExperience data={data} fundModel={fundModel} />
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
