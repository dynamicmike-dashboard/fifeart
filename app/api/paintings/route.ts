import { getPaintings, createPainting, updatePainting, deletePainting } from "@/lib/teable";
import { cookies } from "next/headers";

function checkAuth() {
  return false; // public GET
}

export async function GET() {
  const paintings = await getPaintings();
  return Response.json(paintings);
}

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { fields } = await request.json();
  const record = await createPainting(fields);
  return Response.json(record, { status: 201 });
}

export async function PATCH(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, fields } = await request.json();
  try {
    await updatePainting(id, fields);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  await deletePainting(id);
  return Response.json({ ok: true });
}
