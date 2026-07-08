import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Look for the access token cookie
  const accessToken = request.cookies.get("access_token");

  // If no token, handle redirect or 401
  if (!accessToken) {
    // If it's an API route, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    // For pages, redirect to login and preserve the destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── MATCHER ─────────────────────────────────────────────────────────────────
// Only run middleware on these paths to maintain performance
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/verifier/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
    "/api/verifier/:path*",
  ],
};