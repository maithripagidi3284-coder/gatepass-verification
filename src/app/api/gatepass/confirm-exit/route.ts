import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { confirmExit } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await requireRoleFromRequest(req, "security");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, gateId } = await req.json();
  const ok = await confirmExit(token, gateId ?? null, session.userId);
  if (!ok) return NextResponse.json({ error: "Could not confirm exit" }, { status: 409 });
  return NextResponse.json({ ok: true });
}