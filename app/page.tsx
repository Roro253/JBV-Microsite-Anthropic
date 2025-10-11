import { Container } from "@/components/Container";
import { NarrativeEntryPortal } from "@/components/home/NarrativeEntryPortal";
import { getAnthropicData } from "@/lib/data";

export default function Home() {
  const data = getAnthropicData();

  return (
    <Container className="flex w-full max-w-[1400px] flex-1 items-center py-12 sm:py-16">
      <NarrativeEntryPortal subtitle={data.company.tagline} />
    </Container>
  );
}
