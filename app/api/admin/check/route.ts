import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  if (c.get("admin_session")?.value === "true") {
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
