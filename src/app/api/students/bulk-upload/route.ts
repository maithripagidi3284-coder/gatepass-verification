import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { emailExists, createStudentWithAccount } from "@/lib/db";

// Accepted column headers, case-insensitive, tolerant of the exact wording
// mentors are likely to use in a spreadsheet.
const HEADER_ALIASES: Record<string, string> = {
  "roll number": "rollNo",
  "roll no": "rollNo",
  rollno: "rollNo",
  "student name": "name",
  name: "name",
  branch: "branch",
  department: "branch",
  year: "year",
  section: "section",
  email: "email",
  "phone number": "phone",
  phone: "phone",
  "parent phone": "phone",
};

interface ParsedRow {
  rollNo?: string;
  name?: string;
  branch?: string;
  year?: string;
  section?: string;
  email?: string;
  phone?: string;
}

function normalizeRow(raw: Record<string, unknown>): ParsedRow {
  const out: ParsedRow = {};
  for (const [key, value] of Object.entries(raw)) {
    const alias = HEADER_ALIASES[key.trim().toLowerCase()];
    if (alias) (out as Record<string, unknown>)[alias] = typeof value === "string" ? value.trim() : value;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const session = await requireRole("mentor", "admin");
  if (!session) return NextResponse.json({ error: "Sign in as a mentor to do this." }, { status: 403 });
  if (!session.linkedId && session.role === "mentor") {
    return NextResponse.json({ error: "No mentor profile linked to this account." }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: "" });
  } catch {
    return NextResponse.json({ error: "Could not read that file. Upload a .csv or .xlsx file." }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "The file has no data rows." }, { status: 400 });
  }

  const mentorId = session.linkedId as string; // mentor uploads their own advisees

  const results: { row: number; rollNo?: string; status: "created" | "skipped"; reason?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // account for header row, 1-indexed for humans
    const r = normalizeRow(rows[i]);

    if (!r.rollNo || !r.name || !r.branch || !r.year || !r.email) {
      results.push({ row: rowNum, rollNo: r.rollNo, status: "skipped", reason: "Missing required field(s)." });
      continue;
    }

    const year = Number(r.year);
    if (!Number.isInteger(year) || year < 1 || year > 4) {
      results.push({ row: rowNum, rollNo: r.rollNo, status: "skipped", reason: "Year must be a number 1–4." });
      continue;
    }

    if (await emailExists(r.email)) {
      results.push({ row: rowNum, rollNo: r.rollNo, status: "skipped", reason: "Email already registered." });
      continue;
    }

    try {
      const defaultPassword = r.rollNo; // student should be told to change this on first login
      await createStudentWithAccount({
        name: r.name,
        email: r.email,
        passwordHash: hashPassword(defaultPassword),
        rollNo: r.rollNo,
        department: r.branch,
        year,
        mentorId,
        parentPhone: r.phone ?? "",
      });

      results.push({ row: rowNum, rollNo: r.rollNo, status: "created" });
    } catch (err: unknown) {
      const reason =
        err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505"
          ? "Roll number already exists."
          : "Could not save this row.";
      results.push({ row: rowNum, rollNo: r.rollNo, status: "skipped", reason });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped");

  return NextResponse.json({
    total: rows.length,
    created,
    skippedCount: skipped.length,
    errors: skipped,
  });
}
