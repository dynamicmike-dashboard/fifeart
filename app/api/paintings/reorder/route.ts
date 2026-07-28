import { updateOrder } from "@/lib/teable";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { updates } = await request.json();
  try {
    await updateOrder(updates);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || "Reorder failed" }, { status: 502 });
  }
}