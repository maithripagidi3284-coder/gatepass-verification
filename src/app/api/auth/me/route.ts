import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStudentByUserId, getMentorByUserId } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let profile = null;
  if (session.role === "student") {
    profile = await getStudentByUserId(session.userId);
  } else if (session.role === "mentor") {
    profile = await getMentorByUserId(session.userId);
  }

  return NextResponse.json({ ...session, profile });
}