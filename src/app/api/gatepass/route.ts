import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createGatePass, getStudentByUserId, listGatePasses, logAuditEvent, sweepExpired } from "@/lib/db";
import { todayIST } from "@/lib/date";
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  await sweepExpired();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  let mentorId = searchParams.get("mentorId") ?? undefined;
  let studentId = searchParams.get("studentId") ?? undefined;

  // Resource-level authorization: students only ever see their own passes,
  // mentors only ever see passes assigned to them — regardless of what the
  // query string says.
  if (session.role === "student") studentId = session.linkedId ?? "__none__";
  if (session.role === "mentor") mentorId = session.linkedId ?? "__none__";

  const passes = await listGatePasses({ status, mentorId, studentId });
  return NextResponse.json(passes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Sign in as a student to request a gate pass." }, { status: 403 });
  }

  // Look up by userId (from /me), not linkedId — avoids stale-session
  // issues if linkedId wasn't populated at login time.
  const student = await getStudentByUserId(session.userId);
  if (!student) return NextResponse.json({ error: "Student record not found." }, { status: 404 });

  const body = await req.json();
  const { reason, date, outTime } = body;
  if (!reason || !date || !outTime) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
    if (date !== todayIST()) {
    return NextResponse.json(
      { error: "Gate passes can only be requested for today's date." },
      { status: 400 }
    );
  }

  const pass = await createGatePass({
    studentId: student.id,
    mentorId: student.mentorId,
    reason,
    date,
    outTime,
  });

  if (!pass) {
    return NextResponse.json(
      { error: "You already have an active or pending gate pass. Wait for it to complete before requesting another." },
      { status: 409 }
    );
  }

  await logAuditEvent({
    passId: pass.id,
    eventType: "PASS_CREATED",
    actor: student.name,
    details: `Requested exit for "${reason}" on ${date} at ${outTime}.`,
    result: "SUCCESS",
  });

  return NextResponse.json(pass, { status: 201 });
}
