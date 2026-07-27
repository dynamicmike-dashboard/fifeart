import { getPaintings } from "@/lib/teable";
import Gallery from "@/components/Gallery";

export default async function HomePage() {
  const paintings = await getPaintings();
  return <Gallery paintings={paintings} />;
}
