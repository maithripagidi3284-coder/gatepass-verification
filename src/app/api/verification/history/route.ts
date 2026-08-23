
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { listAuditHistory } from "@/lib/db";

export async function GET() {
  const session = await requireRole("security", "admin");
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const history = await listAuditHistory(50);
  return NextResponse.json(history);
}