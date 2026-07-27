import { PaintingRecord } from "./types";

export function getThumbUrl(painting: PaintingRecord): string {
  const img = painting.fields.image?.[0];
  return img?.lgThumbnailUrl || img?.smThumbnailUrl || img?.presignedUrl || "";
}

export function getFullImageUrl(painting: PaintingRecord): string {
  const img = painting.fields.image?.[0];
  return img?.presignedUrl || img?.lgThumbnailUrl || "";
}

export function getImageProps(painting: PaintingRecord): {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
} | null {
  const img = painting.fields.image?.[0];
  if (!img?.presignedUrl) return null;
  const w = img.width || 1200;
  const h = img.height || 900;
  return {
    src: img.lgThumbnailUrl || img.presignedUrl,
    width: w,
    height: h,
    blurDataURL: img.smThumbnailUrl || img.presignedUrl,
  };
}

export function getImageDimensions(painting: PaintingRecord): { w: number; h: number } | null {
  const img = painting.fields.image?.[0];
  return img?.width && img?.height ? { w: img.width, h: img.height } : null;
}

export function getStatusDisplay(status?: string): { label: string; className: string } {
  switch (status) {
    case "sold": return { label: "Sold", className: "badge-sold" };
    case "not_for_sale": return { label: "Not for sale", className: "badge-nfs" };
    default: return { label: "", className: "" };
  }
}

export function uniqueSubjects(paintings: PaintingRecord[]): string[] {
  const set = new Set<string>();
  paintings.forEach((p) => (p.fields.subjects || []).forEach((s) => set.add(s)));
  return Array.from(set).sort();
}

export function sortByOrder(paintings: PaintingRecord[]): PaintingRecord[] {
  return [...paintings].sort((a, b) => (a.fields.order ?? 999) - (b.fields.order ?? 999));
}

export function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
