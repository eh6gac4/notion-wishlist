import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/env";

const isDevAuthBypass =
  process.env.NODE_ENV !== "production" &&
  (isMockMode() || process.env.DISABLE_AUTH === "1");

export default auth((req) => {
  if (isDevAuthBypass) return;

  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|api/login|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|sw\\.js\\.map|swe-worker-.*\\.js|workbox-.*\\.js|icon\\.svg|icon-192\\.png|icon-512\\.png|maskable-icon-512\\.png|apple-touch-icon\\.png|offline|\\.well-known).*)",
  ],
};
