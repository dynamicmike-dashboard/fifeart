export interface TeableAttachment {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  presignedUrl: string;
  smThumbnailUrl?: string;
  lgThumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface PaintingRecord {
  id: string;
  autoNumber?: number;
  fields: {
    title: string;
    image?: TeableAttachment[];
    medium?: string;
    dimensions?: string;
    priceGBP?: number;
    status?: "available" | "sold" | "not_for_sale";
    orientation?: "landscape" | "portrait" | "square";
    subjects?: string[];
    tags?: string;
    order?: number;
    id?: number;
  };
  createdTime?: string;
}

export const SUBJECT_OPTIONS = [
  "pets", "animals", "birds", "insects", "portrait", "landscape", "group"
] as const;

export const STATUS_OPTIONS = [
  "available", "sold", "not_for_sale"
] as const;

export const ORIENTATION_OPTIONS = [
  "landscape", "portrait", "square"
] as const;
