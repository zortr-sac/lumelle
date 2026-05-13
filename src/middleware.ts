import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildSecurityHeaders } from "@/lib/security/headers";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const AUTH_ONLY = ["/login", "/signup", "/forgot", "/reset"];

const SECURITY_HEADERS = buildSecurityHeaders();

function withSecurityHeaders<T extends NextResponse>(response: T): T {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (isAuthOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // Hint the browser to start TLS handshake with Supabase early on protected
  // routes that will trigger the auth client.
  if (isProtected || pathname.startsWith("/b/")) {
    response.headers.set(
      "Link",
      `<${process.env.NEXT_PUBLIC_SUPABASE_URL}>; rel=preconnect; crossorigin`,
    );
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$).*)",
  ],
};
