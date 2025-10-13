import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { cn } from "@/lib/utils";
import { getOpenAIData } from "@/lib/data";
import { getOpenAIFundModel, type OpenAIFundModel } from "@/lib/openaiFundModel";
import type { OpenAIData } from "@/lib/data";

type OpenAIViewVariant = "full" | "pane";

interface OpenAIViewProps {
  data: OpenAIData;
  fundModel: OpenAIFundModel | null;
  variant?: OpenAIViewVariant;
}

export function OpenAIView({ data, fundModel, variant = "full" }: OpenAIViewProps) {
  const content = <OpenAIExperience data={data} fundModel={fundModel} />;

  if (variant === "pane") {
    return (
      <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-8", "md:pb-20")}>{content}</div>
    );
  }

  return <Container className="flex flex-1 flex-col gap-10 py-12">{content}</Container>;
}

export async function loadOpenAIMicrosite(): Promise<{ data: OpenAIData; fundModel: OpenAIFundModel | null }> {
  const data = getOpenAIData();
  try {
    const fundModel = await getOpenAIFundModel();
    return { data, fundModel };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[openai-microsite] unable to load fund model", error);
    }
    return { data, fundModel: null };
  }
}
