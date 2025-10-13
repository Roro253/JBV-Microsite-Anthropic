import { Container } from "@/components/Container";
import { AnthropicExperience } from "@/components/anthropic/AnthropicExperience";
import { getAnthropicData } from "@/lib/data";
import { getAnthropicFundModel } from "@/lib/anthropicFundModel";
import { cn } from "@/lib/utils";

interface AnthropicViewProps {
  variant?: "full" | "pane";
}

export async function AnthropicView({ variant = "full" }: AnthropicViewProps) {
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

  return (
    <Container
      className={cn(
        "flex flex-1 flex-col gap-10",
        variant === "pane"
          ? "max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:px-8"
          : "py-12"
      )}
    >
      <AnthropicExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
