import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { getLinkedIdForUser } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Slow down credential-stuffing / brute force attempts.
  if (!checkRateLimit(`login:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many login attempts. Try again in a minute." }, { status: 429 });
  }

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await findUserByEmail(email);

  // Same error for "no such user" and "wrong password" — don't leak which one it was.
  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
const linkedId = await getLinkedIdForUser(user.id, user.role);
const token = await createSessionToken({
  userId: user.id,
  name: user.name,
  role: user.role,
  linkedId,
});
  await setSessionCookie(token);

  return NextResponse.json({ role: user.role, name: user.name });
}
