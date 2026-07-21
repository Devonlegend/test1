import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
const PROTECTED = ["/dashboard", "/admin", "/verifier"];

export async function proxy(request) {
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
  let backendPath = (pathname.replace(/^\/api/, '') || '/').replace(/^\//, '');

  // Django requires trailing slashes on API endpoints. Without them, Django
  // returns a 301 redirect, which turns POST/PUT/PATCH into GET — breaking
  // mutations.  Ensure every path that does not look like a static file has one.
  if (backendPath && !backendPath.endsWith('/') && !/\.[a-z0-9]+$/i.test(backendPath)) {
    backendPath += '/';
  }

  const target = new URL(backendPath, `${BACKEND_URL}/`);
  target.search = search;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase();
    if (['host', 'connection', 'content-length', 'transfer-encoding'].includes(lower)) continue;
    headers.set(key, value);
  }

  let body = null;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  });

  const resHeaders = new Headers();
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'set-cookie') continue;
    if (key.toLowerCase() === 'location') {
      resHeaders.set(key, `/api${value}`);
      continue;
    }
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
