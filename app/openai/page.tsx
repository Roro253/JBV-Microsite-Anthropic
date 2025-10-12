import { Container } from "@/components/Container";
import { OpenAIExperience } from "@/components/openai/OpenAIExperience";
import { getOpenAIData } from "@/lib/data";

export default function OpenAIPage() {
  const data = getOpenAIData();

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <OpenAIExperience data={data} />
    </Container>
  );
}
