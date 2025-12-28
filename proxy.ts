import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const userId = req.cookies.get("user_id")?.value
  const { pathname } = req.nextUrl

  // Protect upload page (redirect)
  if (pathname.startsWith("/upload")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect API (no redirect, just 401)
  if (pathname.startsWith("/api/aws/s3")) {
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/api/aws/s3"
  ]
}
