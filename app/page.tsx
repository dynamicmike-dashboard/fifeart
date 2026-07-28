import { getPaintings } from "@/lib/teable";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const paintings = await getPaintings();
  return <Gallery paintings={paintings} />;
}
