import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGatePassById, logAuditEvent, overrideExit, overrideReturn, sweepExpired } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await requireRole("security", "admin");
  if (!session) return NextResponse.json({ error: "Sign in as security to do this." }, { status: 403 });
  if (!checkRateLimit(`override:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many override attempts. Slow down." }, { status: 429 });
  }

  await sweepExpired();
  const { rollNo, action, reason } = await req.json();
  if (!rollNo || !action || !reason || !reason.trim()) {
    return NextResponse.json({ error: "Roll number, action, and a reason are all required for a manual override." }, { status: 400 });
  }

  const passId = action === "exit" ? await overrideExit(rollNo) : await overrideReturn(rollNo);
  if (!passId) {
    return NextResponse.json(
      { error: action === "exit" ? "No approved pass ready for exit." : "Student has not exited, nothing to return." },
      { status: 400 }
    );
  }

  await logAuditEvent({
    passId,
    eventType: "MANUAL_OVERRIDE",
    actor: `${session.name} (manual override)`,
    details: `${action === "exit" ? "Exit" : "Return"} recorded without QR token. Reason: ${reason.trim()}`,
    result: "SUCCESS",
  });

  const pass = await getGatePassById(passId);
  return NextResponse.json(pass);
}
