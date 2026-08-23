import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listStudents } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const branch = searchParams.get("branch");
  const rollNo = searchParams.get("rollNo");
  const prefix = searchParams.get("prefix");

  const students = await listStudents({
    year: year ? Number(year) : undefined,
    branch: branch ?? undefined,
    rollNo: rollNo ?? undefined,
    prefix: prefix ?? undefined,
  });

  return NextResponse.json(students);
}