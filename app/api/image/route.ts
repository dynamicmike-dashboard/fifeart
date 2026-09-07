export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });
  try {
    const decoded = decodeURIComponent(url);
    // Only allow Teable/S3 hosts
    const u = new URL(decoded);
    const allowed = [
      "s3.us-west-2.amazonaws.com",
      "storage-private.teable.io",
      "app.teable.ai",
    ];
    if (!allowed.some((h) => u.hostname === h || u.hostname.endsWith("." + h) || u.hostname === "s3.us-west-2.amazonaws.com")) {
      // also allow s3 host exactly
      if (u.hostname !== "s3.us-west-2.amazonaws.com") {
        return new Response("Host not allowed", { status: 403 });
      }
    }
    const res = await fetch(decoded, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      return new Response(`Upstream ${res.status}: ${text.slice(0, 500)}`, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/webp";
    return new Response(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e: any) {
    return new Response(`Proxy error: ${e.message}`, { status: 500 });
  }
}
