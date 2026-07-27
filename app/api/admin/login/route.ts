import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (password === expected) {
    const c = await cookies();
    c.set("admin_session", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4,
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
