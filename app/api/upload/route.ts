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
    // IMMEDIATE SYNC LOG - before any await
    console.log("UPLOAD POST handler ENTERED", new Date().toISOString());
    console.log("Request method:", request.method);
    console.log("Request url:", request.url);
    console.log("Content-Type:", request.headers.get("content-type"));
    console.log("Content-Length:", request.headers.get("content-length"));
    console.log("Origin:", request.headers.get("origin"));
    console.log("Cookie header:", request.headers.get("cookie")?.substring(0, 200));
    
    // TEST: return immediate JSON to verify route works
    // return jsonResponse({ test: "ok", timestamp: new Date().toISOString() }, 200, request);
    
    console.log("=== UPLOAD ROUTE START ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    console.log("Request origin:", request.headers.get("origin"));
    
    const c = await cookies();
    console.log("Cookies() call succeeded");
    const allCookies = c.getAll();
    console.log("All cookies:", allCookies);
    
    const cookieValue = c.get("admin_session")?.value;
    console.log("Upload auth check - cookie:", cookieValue);
    if (cookieValue !== "true") {
      console.log("Upload auth failed - cookie value:", cookieValue);
      return jsonResponse({ error: "Unauthorized", debug: { cookie: cookieValue, allCookies } }, 401, request);
    }
    if (!BASE_URL || !TABLE_ID || !TOKEN) {
      console.log("Missing env vars:", { BASE_URL: !!BASE_URL, TABLE_ID: !!TABLE_ID, TOKEN: !!TOKEN });
      return jsonResponse({ error: "Not configured" }, 500, request);
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");
    if (!recordId) {
      return jsonResponse({ error: "Missing recordId" }, 400, request);
    }

    console.log("Parsing formData...");
    const formData = await request.formData();
    console.log("formData parsed, entries:", Array.from(formData.entries()).map(([k, v]) => [k, typeof v === 'object' ? v.constructor.name : v]));
    const file = formData.get("file") as File | null;
    if (!file) {
      console.log("No file in formData");
      return jsonResponse({ error: "No file" }, 400, request);
    }
    console.log("File:", file.name, file.type, file.size);

    console.log("Reading file arrayBuffer...");
    const buf = Buffer.from(await file.arrayBuffer());
    console.log("Buffer length:", buf.length);

    console.log("Processing with sharp...");
    let webpBuf: Buffer;
    try {
      webpBuf = await sharp(buf).webp({ quality: 82 }).toBuffer();
    } catch (sharpErr: any) {
      console.error("SHARP ERROR:", sharpErr);
      console.error("SHARP STACK:", sharpErr.stack);
      return jsonResponse({ error: "Image processing failed", detail: sharpErr.message, stack: sharpErr.stack }, 500, request);
    }
    console.log("Sharp done, webpBuf length:", webpBuf.length);
    
    const filename = file.name.replace(/\.[^.]+$/, "") + ".webp";

    const teableForm = new FormData();
    teableForm.append("file", new Blob([webpBuf as unknown as ArrayBuffer], { type: "image/webp" }), filename);

    const url = `${BASE_URL}/api/table/${TABLE_ID}/record/${recordId}/${IMAGE_FIELD_ID}/uploadAttachment`;
    console.log("Posting to Teable:", url);
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: teableForm,
    });

    console.log("Teable response status:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error("Teable upload error", res.status, text);
      return jsonResponse({ error: "Upload failed", detail: text, teableStatus: res.status }, 502, request);
    }

    const data = await res.json();
    console.log("Teable response data:", data);
    return jsonResponse(data, 200, request);
  } catch (err: any) {
    console.error("Upload route error:", err);
    console.error("Stack:", err.stack);
    // Use plain Response.json to avoid any issues with corsHeaders
    return new Response(JSON.stringify({ error: "Server error", detail: err?.message, stack: err?.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(request) },
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
