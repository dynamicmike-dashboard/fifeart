import sharp from "sharp";
import { cookies } from "next/headers";

const BASE_URL = process.env.TEABLE_API_URL;
const TABLE_ID = process.env.TEABLE_TABLE_ID;
const TOKEN = process.env.TEABLE_API_TOKEN;

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!BASE_URL || !TABLE_ID || !TOKEN) {
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const webpBuf = await sharp(buf).webp({ quality: 82 }).toBuffer();
  const filename = file.name.replace(/\.[^.]+$/, "") + ".webp";

  const teableForm = new FormData();
  teableForm.append("file", new Blob([webpBuf], { type: "image/webp" }), filename);

  const res = await fetch(
    `${BASE_URL}/api/table/${TABLE_ID}/attachment/upload`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: teableForm }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Teable upload error", res.status, text);
    return Response.json({ error: "Upload failed", detail: text, teableStatus: res.status }, { status: 502 });
  }

  const data = await res.json();
  return Response.json(data);
}