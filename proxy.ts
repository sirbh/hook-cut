import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const anonId = req.cookies.get("anon_id")?.value
  const { pathname } = req.nextUrl

  // Protect upload page
  if (pathname.startsWith("/upload")) {
    if (!anonId) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect API (NO redirect)
  if (pathname.startsWith("/api/aws/s3")) {
    if (!anonId) {
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
