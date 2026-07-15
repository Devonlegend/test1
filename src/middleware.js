import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/admin", "/verifier"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // After OTP verify, the backend sets both cookies in one response. The browser
  // may not have flushed access_token to the cookie jar yet when the client-side
  // router.replace fires, but refresh_token arrives in the same Set-Cookie header.
  // Checking for either cookie prevents the 307 loop — the layout's own auth
  // guard (with retries) handles the case where only refresh_token is readable.
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── MATCHER ─────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/verifier/:path*",
  ],
};