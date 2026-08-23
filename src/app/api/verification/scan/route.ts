import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGatePassByToken, logAuditEvent, sweepExpired } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await requireRole("security", "admin");
  if (!session) return NextResponse.json({ error: "Sign in as security to do this." }, { status: 403 });
  if (!checkRateLimit(`scan:${clientKey(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many scan attempts. Slow down." }, { status: 429 });
  }

  await sweepExpired();
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const pass = await getGatePassByToken(token);
  if (!pass) return NextResponse.json({ error: "Invalid or unknown pass token." }, { status: 404 });

  await logAuditEvent({ passId: pass.id, eventType: "QR_SCANNED", actor: session.name, details: "Token scanned at gate.", result: "SUCCESS" });

  return NextResponse.json(pass);
}
