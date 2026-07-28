import { updatePainting } from "@/lib/teable";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { updates } = await request.json();
  const errors: string[] = [];
  for (const u of updates) {
    try {
      await updatePainting(u.id, { order: u.order });
    } catch (e) {
      errors.push(u.id);
    }
  }
  if (errors.length > 0) {
    return Response.json({ ok: false, errors }, { status: 207 });
  }
  return Response.json({ ok: true });
}