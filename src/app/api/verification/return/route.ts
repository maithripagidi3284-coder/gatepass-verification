import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { consumeReturn, getGatePassByToken, logAuditEvent, sweepExpired } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await requireRole("security", "admin");
  if (!session) return NextResponse.json({ error: "Sign in as security to do this." }, { status: 403 });
  if (!checkRateLimit(`verify:${clientKey(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Slow down." }, { status: 429 });
  }

  await sweepExpired();
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const pass = await getGatePassByToken(token);
  if (!pass) return NextResponse.json({ error: "Invalid or unknown pass token." }, { status: 404 });

  if (pass.status === "RETURNED") {
    await logAuditEvent({ passId: pass.id, eventType: "REUSE_ATTEMPT", actor: session.name, details: "Return scan attempted on a pass already marked returned.", result: "DENIED" });
    return NextResponse.json({ error: "Return has already been recorded for this pass." }, { status: 409 });
  }
  if (pass.status !== "EXITED") {
    await logAuditEvent({ passId: pass.id, eventType: "RETURN_VERIFIED", actor: session.name, details: "Return scan attempted before exit was recorded.", result: "DENIED" });
    return NextResponse.json({ error: "Student has not been recorded as exited yet." }, { status: 400 });
  }

  const ok = await consumeReturn(token);
  if (!ok) return NextResponse.json({ error: "This pass was just updated by another scan." }, { status: 409 });

  await logAuditEvent({ passId: pass.id, eventType: "RETURN_VERIFIED", actor: session.name, details: "Identity confirmed at gate, return recorded.", result: "SUCCESS" });
  return NextResponse.json({ ...pass, status: "RETURNED" });
}
