import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGatePassById, hodApprovePass, logAuditEvent } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("hod");
  if (!session) return NextResponse.json({ error: "Sign in as HOD to do this." }, { status: 403 });

  const { id } = await params;
  const pass = await getGatePassById(id);
  if (!pass) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pass.status !== "MENTOR_APPROVED") {
    return NextResponse.json({ error: "Not pending HOD approval" }, { status: 400 });
  }

  const result = await hodApprovePass(id);
  if (!result) return NextResponse.json({ error: "Could not approve — status may have changed." }, { status: 409 });

  await logAuditEvent({
    passId: id,
    eventType: "PASS_HOD_APPROVED",
    actor: session.name,
    details: `HOD stamped approval. Pass token issued, valid until ${new Date(result.validUntil).toLocaleString()}.`,
    result: "SUCCESS",
  });

  return NextResponse.json({ ...pass, status: "APPROVED", qrToken: result.token, validUntil: result.validUntil });
}