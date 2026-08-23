import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { consumeExit, getGatePassByToken, logAuditEvent, sweepExpired } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

const DENY_REASONS: Record<string, string> = {
  PENDING_MENTOR: "Pass has not been approved yet.",
  MENTOR_APPROVED: "Pass is still waiting on HOD approval.",
  MENTOR_REJECTED: "Pass was rejected by the mentor.",
  HOD_REJECTED: "Pass was rejected by the HOD.",
  EXPIRED: "Pass has expired.",
  CANCELLED: "Pass was cancelled.",
};

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

  if (pass.status === "EXITED" || pass.status === "RETURNED") {
    await logAuditEvent({ passId: pass.id, eventType: "REUSE_ATTEMPT", actor: session.name, details: "Exit scan attempted on a pass already marked exited.", result: "DENIED" });
    return NextResponse.json({ error: "This pass has already been used for exit." }, { status: 409 });
  }
  if (pass.status !== "APPROVED") {
    await logAuditEvent({ passId: pass.id, eventType: "EXIT_VERIFIED", actor: session.name, details: DENY_REASONS[pass.status] ?? "Pass not valid for exit.", result: "DENIED" });
    return NextResponse.json({ error: DENY_REASONS[pass.status] ?? "Pass not valid for exit." }, { status: 400 });
  }

  const ok = await consumeExit(token);
  if (!ok) {
    await logAuditEvent({ passId: pass.id, eventType: "REUSE_ATTEMPT", actor: session.name, details: "Concurrent exit scan lost the race.", result: "DENIED" });
    return NextResponse.json({ error: "This pass was just used by another scan." }, { status: 409 });
  }

  await logAuditEvent({ passId: pass.id, eventType: "EXIT_VERIFIED", actor: session.name, details: "Identity confirmed at gate, exit recorded.", result: "SUCCESS" });
  return NextResponse.json({ ...pass, status: "EXITED" });
}
