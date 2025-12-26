import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {

  const cookieStore = await cookies(); 
  let anonId = cookieStore.get("anon_id")?.value;

  if (!anonId) {
    anonId = randomUUID();

    const res = NextResponse.json({ ok: true });
    res.cookies.set("anon_id", anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return res;
  }

  return NextResponse.json({ ok: false });
}
