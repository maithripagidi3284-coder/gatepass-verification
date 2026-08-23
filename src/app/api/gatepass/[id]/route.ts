import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const pass = store.passes.find((p) => p.id === id);
  if (!pass) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...pass,
    student: store.students.find((s) => s.id === pass.studentId),
    mentor: store.mentors.find((m) => m.id === pass.mentorId),
  });
}
