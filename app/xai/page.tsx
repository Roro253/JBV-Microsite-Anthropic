import { Container } from "@/components/Container";
import { XaiExperience } from "@/components/xai/XaiExperience";
import { getXaiData } from "@/lib/data";

export default function XaiPage() {
  const data = getXaiData();

  return (
    <Container className="flex flex-1 flex-col gap-10 py-12">
      <XaiExperience data={data} />
    </Container>
  );
}
