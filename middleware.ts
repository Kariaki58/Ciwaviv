import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log({ pathname })

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Retrieve the NextAuth token (from cookie/JWT)
  const token = await getToken({
    req,
    secret,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  console.log({ token })

  // Not logged in → redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Logged in but not admin → redirect to home
  if (token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // User is admin → allow access
  return NextResponse.next();
}

// Apply only to /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
