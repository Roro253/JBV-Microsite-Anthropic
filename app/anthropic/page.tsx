import { AnthropicExperience } from "@/components/anthropic/AnthropicExperience";
import { Container } from "@/components/Container";
import { getAnthropicData } from "@/lib/data";

export default function AnthropicPage() {
  const data = getAnthropicData();

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <AnthropicExperience data={data} />
    </Container>
  );
}
