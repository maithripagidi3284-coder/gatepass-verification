import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGatePassById, logAuditEvent, mentorSetStatus } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("mentor");
  if (!session || !session.linkedId) return NextResponse.json({ error: "Sign in as a mentor to do this." }, { status: 403 });

  const { id } = await params;
  const pass = await getGatePassById(id);
  if (!pass) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pass.mentorId !== session.linkedId) {
    return NextResponse.json({ error: "This request is not assigned to you." }, { status: 403 });
  }
  if (pass.status !== "PENDING_MENTOR") {
    return NextResponse.json({ error: "Not pending mentor approval" }, { status: 400 });
  }

  const ok = await mentorSetStatus(id, session.linkedId, "MENTOR_APPROVED");
  if (!ok) return NextResponse.json({ error: "Could not approve — status may have changed." }, { status: 409 });

  await logAuditEvent({
    passId: id,
    eventType: "PASS_MENTOR_APPROVED",
    actor: session.name,
    details: "Mentor confirmed with parent and approved.",
    result: "SUCCESS",
  });
  return NextResponse.json({ ...pass, status: "MENTOR_APPROVED" });
}