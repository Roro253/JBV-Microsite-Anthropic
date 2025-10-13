import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { cn } from "@/lib/utils";
import { getOpenAIData } from "@/lib/data";
import { getOpenAIFundModel } from "@/lib/openaiFundModel";

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
        "flex flex-1 flex-col gap-10 py-12",
        variant === "pane" && "max-w-4xl px-4 sm:px-6"
      )}
    >
      <OpenAIExperience data={data} fundModel={fundModel} />
    </Container>
  );
}
