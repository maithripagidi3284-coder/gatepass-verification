import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSuspiciousActivity } from "@/lib/db";

export async function GET() {
  const session = await requireRole("admin", "security");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const alerts = await getSuspiciousActivity();
  return NextResponse.json(alerts);
}
