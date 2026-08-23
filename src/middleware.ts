import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();
const SECRET = encoder.encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me");
const COOKIE_NAME = "gatepass_session";

const ROLE_FOR_PREFIX: Record<string, string> = {
  "/student": "student",
  "/mentor": "mentor",
  "/hod": "hod",
  "/security": "security",
  "/admin": "admin",
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const prefix = Object.keys(ROLE_FOR_PREFIX).find((p) => path === p || path.startsWith(`${p}/`));
  if (!prefix) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== ROLE_FOR_PREFIX[prefix]) {
      return NextResponse.redirect(new URL(`/login?error=wrong_role`, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/mentor/:path*", "/hod/:path*", "/security/:path*", "/admin/:path*"],
};
