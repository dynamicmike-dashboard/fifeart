import { getAboutContent, upsertAboutContent } from "@/lib/teable";
import { cookies } from "next/headers";

export async function GET() {
  const content = await getAboutContent();
  return Response.json(content);
}

export async function POST(request: Request) {
  const c = await cookies();
  if (c.get("admin_session")?.value !== "true") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, fields } = await request.json();
  try {
    const result = await upsertAboutContent(id, fields);
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}
