import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "./types";

const encoder = new TextEncoder();
// IMPORTANT: set a real SESSION_SECRET env var in production. This fallback
// only exists so the prototype runs out of the box in dev.
const SECRET = encoder.encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me");
export const SESSION_COOKIE_NAME = "gatepass_session";

export interface SessionPayload {
  userId: string;
  name: string;
  role: Role;
  linkedId?: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Returns the session only if its role is one of `roles`, otherwise null. Use in every protected route handler. */
export async function requireRole(...roles: Role[]): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
// ---------- Mobile support: Authorization header, alongside the cookie ----------

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifySessionToken(token);
  }
  return getSession();
}

export async function requireRoleFromRequest(req: Request, ...roles: Role[]): Promise<SessionPayload | null> {
  const session = await getSessionFromRequest(req);
  if (!session || !roles.includes(session.role)) return null;
  return session;
}
