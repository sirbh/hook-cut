import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"



export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  // If cookie exists, verify user in DB
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { user_id:userId }
    })

    if (user) {
      return NextResponse.json({ ok: true, userId })
    }
  }

  // Create new anonymous user
  const newUserId = `anon_${randomUUID()}`

  const user = await prisma.user.create({
    data: {
      user_id: newUserId
    }
  })

  const res = NextResponse.json({
    ok: true,
    userId: user.user_id,
    isNew: true
  })

  res.cookies.set("user_id", user.user_id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  return res
}
