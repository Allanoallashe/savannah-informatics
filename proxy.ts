import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const refreshCookieName = "clinic_refresh_token";

export function proxy(request: NextRequest) {
  const hasRefreshCookie = Boolean(request.cookies.get(refreshCookieName)?.value);
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" || pathname.startsWith("/stock")) {
    if (!hasRefreshCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/stock", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/stock/:path*"],
};
