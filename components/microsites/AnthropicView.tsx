import { AnthropicExperience } from "@/components/anthropic/AnthropicExperience";
import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";
import { getAnthropicData } from "@/lib/data";
import { getAnthropicFundModel, type AnthFundModel } from "@/lib/anthropicFundModel";
import type { AnthropicData } from "@/lib/data";

type AnthropicViewVariant = "full" | "pane";

interface AnthropicViewProps {
  data: AnthropicData;
  fundModel: AnthFundModel | null;
  variant?: AnthropicViewVariant;
}

export function AnthropicView({ data, fundModel, variant = "full" }: AnthropicViewProps) {
  const content = <AnthropicExperience data={data} fundModel={fundModel} />;

  if (variant === "pane") {
    return (
      <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-8", "md:pb-20")}>{content}</div>
    );
  }

  return <Container className="flex flex-1 flex-col gap-10 py-12">{content}</Container>;
}

export async function loadAnthropicMicrosite(): Promise<{ data: AnthropicData; fundModel: AnthFundModel | null }> {
  const data = getAnthropicData();
  try {
    const fundModel = await getAnthropicFundModel();
    return { data, fundModel };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[anthropic-microsite] unable to load fund model", error);
    }
    return { data, fundModel: null };
  }
}
