import { NextRequest, NextResponse } from "next/server";
import { requireRoleFromRequest } from "@/lib/auth";
import { verifyPassForGate } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await requireRoleFromRequest(req, "security");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const result = await verifyPassForGate(token);
  return NextResponse.json(result);
}