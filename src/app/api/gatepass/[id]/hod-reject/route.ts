import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGatePassById, hodRejectPass, logAuditEvent } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("hod");
  if (!session) return NextResponse.json({ error: "Sign in as HOD to do this." }, { status: 403 });

  const { id } = await params;
  const pass = await getGatePassById(id);
  if (!pass) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pass.status !== "MENTOR_APPROVED") {
    return NextResponse.json({ error: "Not pending HOD approval" }, { status: 400 });
  }

  const ok = await hodRejectPass(id);
  if (!ok) return NextResponse.json({ error: "Could not reject — status may have changed." }, { status: 409 });

  await logAuditEvent({
    passId: id,
    eventType: "PASS_HOD_REJECTED",
    actor: session.name,
    details: "HOD rejected the request.",
    result: "SUCCESS",
  });
  return NextResponse.json({ ...pass, status: "HOD_REJECTED" });
}
