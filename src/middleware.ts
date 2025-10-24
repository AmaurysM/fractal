import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Public routes (unauthenticated allowed)
  const publicPaths = ["/landing", "/auth/signin"]

  // 🔒 If no token and trying to access a protected page → redirect to /landing
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/landing", req.url))
  }

  // 🔐 If user IS authenticated and tries to go to public routes → redirect to /
  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // ✅ Otherwise, allow the request
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/landing", "/auth/:path*"], // apply to these routes
}
