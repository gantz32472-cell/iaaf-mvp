import { NextRequest, NextResponse } from "next/server";
import { ENABLE_AUTH } from "@/lib/constants";
const SESSION_COOKIE_NAME = "iaaf_session";

function isProtectedPath(pathname: string) {
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/api/webhooks/")) return false;
  if (pathname.startsWith("/r/")) return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/api/auth/")) return false;
  if (pathname.startsWith("/favicon")) return false;
  return true;
}

export function middleware(request: NextRequest) {
  if (!ENABLE_AUTH) return NextResponse.next();
  if (!isProtectedPath(request.nextUrl.pathname)) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Login required" } }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
