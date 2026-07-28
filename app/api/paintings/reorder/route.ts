import { updatePainting } from "@/lib/teable";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { updates } = await request.json();
  for (const u of updates) {
    await updatePainting(u.id, { order: u.order });
  }
  return Response.json({ ok: true });
}