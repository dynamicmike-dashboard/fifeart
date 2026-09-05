import sharp from "sharp";
import { cookies } from "next/headers";

const BASE_URL = process.env.TEABLE_API_URL;
const TABLE_ID = process.env.TEABLE_TABLE_ID;
const TOKEN = process.env.TEABLE_API_TOKEN;
const IMAGE_FIELD_ID = "fld3Qxe2JyFvjD5x42U";

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Vary": "Origin",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

function jsonResponse(data: any, status: number, request: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

export async function POST(request: Request) {
  try {
    console.log("=== UPLOAD ROUTE START ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    console.log("Request origin:", request.headers.get("origin"));
    
    const c = await cookies();
    const allCookies = c.getAll();
    console.log("All cookies:", allCookies);
    
    const cookieValue = c.get("admin_session")?.value;
    console.log("Upload auth check - cookie:", cookieValue);
    if (cookieValue !== "true") {
      console.log("Upload auth failed - cookie value:", cookieValue);
      return jsonResponse({ error: "Unauthorized", debug: { cookie: cookieValue, allCookies } }, 401, request);
    }
    if (!BASE_URL || !TABLE_ID || !TOKEN) {
      return jsonResponse({ error: "Not configured" }, 500, request);
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");
    if (!recordId) {
      return jsonResponse({ error: "Missing recordId" }, 400, request);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return jsonResponse({ error: "No file" }, 400, request);
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
      return jsonResponse({ error: "Upload failed", detail: text, teableStatus: res.status }, 502, request);
    }

    const data = await res.json();
    return jsonResponse(data, 200, request);
  } catch (err: any) {
    console.error("Upload route error:", err);
    console.error("Stack:", err.stack);
    return jsonResponse({ error: "Server error", detail: err.message, stack: err.stack }, 500, request);
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
