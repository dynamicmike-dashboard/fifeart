import { getAboutContent } from "@/lib/teable";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const record = await getAboutContent();
  const title = record?.fields?.title || "About the Artist";
  const story = record?.fields?.story || "";
  const img = record?.fields?.image?.[0];

  return (
    <main className="about-page">
      <Link href="/" className="back-link">&larr; Back to Gallery</Link>
      <h1>{title}</h1>
      {img && (
        <div className="about-image">
          <Image
            src={img.lgThumbnailUrl || img.presignedUrl}
            alt={title}
            width={img.width || 400}
            height={img.height || 500}
            style={{ objectFit: "cover", borderRadius: "0.5rem", maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}
      {story ? (
        story.split("\n").map((p: string, i: number) => <p key={i} className="about-story">{p}</p>)
      ) : (
        <p className="about-story">Artist biography coming soon.</p>
      )}
    </main>
  );
}
