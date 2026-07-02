import { NextResponse } from "next/server";

// ── PROTECTED ROUTES ────────────────────────────────────────────────────────
// These routes require a valid access_token cookie to access.
// If the cookie is missing, the user is redirected to /login with
// a ?next= param so they can be sent back after authenticating.

const PROTECTED = ["/dashboard", "/admin", "/verifier"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Look for the access token cookie (set by backend as httpOnly)
  const accessToken = request.cookies.get("access_token");

  if (!accessToken) {
    // No token — redirect to login, preserve the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── MATCHER ─────────────────────────────────────────────────────────────────
// Only run middleware on protected routes — avoids overhead on public pages
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/verifier/:path*",
  ],
};