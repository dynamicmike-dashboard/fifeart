import { notFound } from "next/navigation";
import Image from "next/image";
import { getPaintings, getPaintingById } from "@/lib/teable";
import { getFullImageUrl, getStatusDisplay } from "@/lib/utils";
import type { Metadata } from "next";
import ShareButtons from "./ShareButtons";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const paintings = await getPaintings();
  return paintings.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const art = await getPaintingById(id);
  if (!art) return { title: "Not Found" };

  const img = art.fields.image?.[0];
  const title = `${art.fields.title} — FifeArt`;

  return {
    title,
    description: `${art.fields.title} by Nancy Berry. ${art.fields.medium || "Original painting"}${art.fields.dimensions ? `, ${art.fields.dimensions}` : ""}. ${art.fields.status === "available" ? `£${art.fields.priceGBP}` : art.fields.status === "sold" ? "Sold" : "Not for sale"}.`,
    openGraph: {
      title,
      description: `Original painting by Nancy Berry. ${art.fields.medium || ""} ${art.fields.dimensions || ""}`.trim(),
      images: img?.lgThumbnailUrl ? [{ url: img.lgThumbnailUrl, width: img.width, height: img.height }] : [],
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { id } = await params;
  const art = await getPaintingById(id);
  if (!art) notFound();

  const dims = art.fields.image?.[0];
  const status = getStatusDisplay(art.fields.status);

  return (
    <div className="artwork-page">
      <a href="/" className="back-link">&larr; Back to Gallery</a>

      <div className="artwork-img-wrap" style={{ aspectRatio: `${dims?.width || 1200}/${dims?.height || 900}` }}>
        <Image
          src={getFullImageUrl(art)}
          alt={art.fields.title}
          fill
          className="artwork-main"
          priority
        />
      </div>

      <h1>{art.fields.title}</h1>

      {art.fields.medium && (
        <p className="artwork-detail">{art.fields.medium}</p>
      )}
      {art.fields.dimensions && (
        <p className="artwork-detail">{art.fields.dimensions}</p>
      )}

      {status.label && (
        <p style={{ marginTop: "0.5rem" }}>
          <span className={`status-badge ${status.className}`} style={{ fontSize: "0.85rem" }}>
            {status.label}
          </span>
        </p>
      )}

      {art.fields.status === "available" ? (
        <p className="artwork-price">£{art.fields.priceGBP}</p>
      ) : null}

      <p className="artwork-note">
        Available in the UK only. Please{" "}
        <a href="mailto:nancyberrykdy@gmail.com">email Nancy</a> to enquire or purchase.
      </p>

      <ShareButtons title={art.fields.title} url={id} />
    </div>
  );
}
