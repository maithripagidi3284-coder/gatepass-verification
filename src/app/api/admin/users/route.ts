import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createMentorRecord, createStudentRecord, createUserAccount, emailExists, listUsers } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { buildPrefix } from "@/lib/rollPrefixes";

export async function GET() {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, email, password, role } = body;
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Name, email, password, and role are required." }, { status: 400 });
  }
  if (await emailExists(email)) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const user = await createUserAccount({ name, email, passwordHash: hashPassword(password), role });

  if (role === "student") {
    const { rollLastDigits, yearLevel, branchCode, branchShort, mentorId, parentPhone, photoUrl } = body;
    if (!rollLastDigits || !yearLevel || !branchCode || !mentorId || !parentPhone) {
      return NextResponse.json({ error: "Student accounts need roll digits, year, branch, mentor, and parent phone." }, { status: 400 });
    }
    const rollNo = `${buildPrefix(Number(yearLevel), branchCode)}${rollLastDigits}`;
    await createStudentRecord({
      userId: user.id,
      rollNo,
      photoUrl: photoUrl || "https://i.pravatar.cc/150",
      department: branchShort ?? branchCode,
      year: Number(yearLevel),
      mentorId,
      parentPhone,
    });
  } else if (role === "mentor") {
    await createMentorRecord(name, user.id);
  }

  return NextResponse.json(user, { status: 201 });
}