import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
const PROTECTED = ["/dashboard", "/admin", "/verifier"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return proxyApi(request);
  }

  const isProtected = PROTECTED.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

async function proxyApi(request) {
  const { pathname, search } = request.nextUrl;
  const target = new URL(pathname.replace(/^\/api/, ''), `${BACKEND_URL}/`);
  target.search = search;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase();
    if (['host', 'connection', 'content-length', 'transfer-encoding'].includes(lower)) continue;
    headers.set(key, value);
  }

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    duplex: 'half',
  });

  const resHeaders = new Headers();
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'set-cookie') continue;
    resHeaders.set(key, value);
  }
  for (const cookie of (response.headers.getSetCookie?.() || [])) {
    resHeaders.append('set-cookie', cookie);
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  });
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/verifier/:path*",
  ],
};
