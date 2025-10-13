import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { getOpenAIData } from "@/lib/data";
import { getOpenAIFundModel } from "@/lib/openaiFundModel";
import { cn } from "@/lib/utils";

interface OpenAIViewProps {
  variant?: "full" | "pane";
}

export async function OpenAIView({ variant = "full" }: OpenAIViewProps) {
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

  return (
    <Container
      className={cn(
        "flex flex-1 flex-col gap-10",
        variant === "pane"
          ? "max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:px-8"
          : "py-12"
      )}
    >
      <OpenAIExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
