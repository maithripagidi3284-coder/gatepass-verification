import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMentors } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const mentors = await listMentors();
  return NextResponse.json(mentors);
}