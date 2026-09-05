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
    return jsonResponse({ 
      test: "ok", 
      timestamp: new Date().toISOString(), 
      method: request.method, 
      url: request.url,
      hasContentLength: !!request.headers.get("content-length"),
      hasCookie: !!request.headers.get("cookie")
    }, 200, request);
  } catch (err: any) {
    console.error("Upload route error:", err);
    console.error("Stack:", err.stack);
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
