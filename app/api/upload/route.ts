import sharp from "sharp";
import { cookies } from "next/headers";

const BASE_URL = process.env.TEABLE_API_URL;
const TABLE_ID = process.env.TEABLE_TABLE_ID;
const TOKEN = process.env.TEABLE_API_TOKEN;
const IMAGE_FIELD_ID = "fld3Qxe2JyFvjD5x42U";

export async function POST(request: Request) {
  try {
    console.log("=== UPLOAD ROUTE START ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const c = await cookies();
    const allCookies = c.getAll();
    console.log("All cookies:", allCookies);
    
    const cookieValue = c.get("admin_session")?.value;
    console.log("Upload auth check - cookie:", cookieValue);
    if (cookieValue !== "true") {
      console.log("Upload auth failed - cookie value:", cookieValue);
      return Response.json({ error: "Unauthorized", debug: { cookie: cookieValue, allCookies } }, { status: 401 });
    }
    if (!BASE_URL || !TABLE_ID || !TOKEN) {
      return Response.json({ error: "Not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");
    if (!recordId) {
      return Response.json({ error: "Missing recordId" }, { status: 400 });
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

    const url = `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}/${IMAGE_FIELD_ID}/uploadAttachment`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: teableForm,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Teable upload error", res.status, text);
      return Response.json({ error: "Upload failed", detail: text, teableStatus: res.status }, { status: 502 });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err: any) {
    console.error("Upload route error:", err);
    console.error("Stack:", err.stack);
    return Response.json({ error: "Server error", detail: err.message, stack: err.stack }, { status: 500 });
  }
}
