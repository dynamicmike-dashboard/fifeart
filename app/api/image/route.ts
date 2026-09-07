export const runtime = "nodejs";

const BASE_ID = process.env.TEABLE_BASE_ID;
const TOKEN = process.env.TEABLE_API_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const path = searchParams.get("path");
  const name = searchParams.get("name") || "image.webp";
  const mimetype = searchParams.get("mimetype") || "image/webp";
  // Backward compat: old ?url= proxy (deprecated, kept for 403 diagnosis)
  const legacyUrl = searchParams.get("url");

  if (legacyUrl && !token) {
    try {
      const decoded = decodeURIComponent(legacyUrl);
      const res = await fetch(decoded, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        return new Response(`Upstream ${res.status}: ${text.slice(0, 500)}`, { status: 502 });
      }
      const buf = await res.arrayBuffer();
      const ct = res.headers.get("content-type") || "image/webp";
      return new Response(buf, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400" } });
    } catch (e: any) {
      return new Response(`Proxy error: ${e.message}`, { status: 500 });
    }
  }

  if (!token || !path) return new Response("Missing token/path", { status: 400 });
  if (!BASE_ID || !TOKEN) return new Response("Not configured", { status: 500 });

  try {
    const signRes = await fetch(`https://app.teable.ai/api/base/${BASE_ID}/sign-attachment-urls`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ attachments: [{ token, path, name, mimetype }] }),
      cache: "no-store",
    });
    if (!signRes.ok) {
      const t = await signRes.text();
      return new Response(`Sign failed ${signRes.status}: ${t.slice(0, 500)}`, { status: 502 });
    }
    const data = await signRes.json();
    const signedUrl: string | undefined = data.attachments?.[0]?.url || data.url || data.presignedUrl;
    if (!signedUrl) return new Response("No signed url", { status: 502 });
    // Redirect to fresh signed URL (302) with short cache (1h < 6d expiry)
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    return new Response(`Sign proxy error: ${e.message}`, { status: 500 });
  }
}
