import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { getOpenAIData } from "@/lib/data";
import { getOpenAIFundModel } from "@/lib/openaiFundModel";

interface OpenAIViewProps {
  layout?: "full" | "pane";
}

export async function OpenAIView({ layout = "full" }: OpenAIViewProps) {
  const data = getOpenAIData();
  let fundModel = null;

  try {
    fundModel = await getOpenAIFundModel();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[openai-view] unable to load fund model", error);
    }
    fundModel = null;
  }

  const content = (
    <div className="flex flex-1 flex-col gap-10 py-10 md:py-12">
      <OpenAIExperience data={data} fundModel={fundModel} />
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
