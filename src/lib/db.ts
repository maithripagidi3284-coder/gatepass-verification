/**
 * Postgres adapter — fully wired in.
 * Requires DATABASE_URL in .env.local (see schema.sql for table setup).
 */
import postgres from "postgres";
import { AuditEvent, Mentor, User } from "./types";

let sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Add it to .env.local before using db.ts.");
    }
    sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  }
  return sql;
}

// ---------- Auth / users ----------

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getSql();
  const rows = await db<
    { id: string; name: string; email: string; password_hash: string; role: string; status: string }[]
  >`SELECT id, name, email, password_hash, role, status FROM users WHERE lower(email) = lower(${email})`;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role as User["role"],
    status: r.status as User["status"],
  };
}

export async function getLinkedIdForUser(userId: string, role: string): Promise<string | undefined> {
  const db = getSql();
  if (role === "student") {
    const rows = await db<{ id: string }[]>`SELECT id FROM students WHERE user_id = ${userId}`;
    return rows[0]?.id;
  }
  if (role === "mentor") {
    const rows = await db<{ id: string }[]>`SELECT id FROM mentors WHERE user_id = ${userId}`;
    return rows[0]?.id;
  }
  return undefined;
}

export async function emailExists(email: string): Promise<boolean> {
  const db = getSql();
  const rows = await db`SELECT 1 FROM users WHERE lower(email) = lower(${email})`;
  return rows.length > 0;
}

export async function listUsers() {
  const db = getSql();
  return db`SELECT id, name, email, role, status FROM users ORDER BY name`;
}

export async function createUserAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}) {
  const db = getSql();
  const rows = await db`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${input.name}, ${input.email}, ${input.passwordHash}, ${input.role})
    RETURNING id, name, email, role, status
  `;
  return rows[0];
}

// ---------- Students / mentors ----------

export async function getStudentByUserId(userId: string) {
  const db = getSql();
  const rows = await db<
    { id: string; name: string; roll_no: string; photo_url: string; mentor_id: string; department: string; year: number; mentor_name: string }[]
  >`
    SELECT s.id, u.name, s.roll_no, s.photo_url, s.mentor_id, s.department, s.year, m.name AS mentor_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN mentors m ON m.id = s.mentor_id
    WHERE s.user_id = ${userId}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    rollNo: r.roll_no,
    photoUrl: r.photo_url,
    mentorId: r.mentor_id,
    branch: r.department,
    year: r.year,
    mentorName: r.mentor_name,
  };
}

export async function getMentorByUserId(userId: string) {
  const db = getSql();
  const rows = await db<{ id: string; name: string }[]>`
    SELECT id, name FROM mentors WHERE user_id = ${userId}
  `;
  return rows[0] ?? null;
}

export async function getStudentById(studentId: string) {
  const db = getSql();
  const rows = await db<
    { id: string; name: string; roll_no: string; photo_url: string; mentor_id: string; parent_phone: string; department: string; year: number }[]
  >`
    SELECT s.id, u.name, s.roll_no, s.photo_url, s.mentor_id, s.parent_phone, s.department, s.year
    FROM students s JOIN users u ON u.id = s.user_id
    WHERE s.id = ${studentId}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    rollNo: r.roll_no,
    photoUrl: r.photo_url,
    mentorId: r.mentor_id,
    parentPhone: r.parent_phone,
    branch: r.department,
    year: r.year,
  };
}

export async function getStudentByRollNo(rollNo: string) {
  const db = getSql();
  const rows = await db<
    { id: string; name: string; roll_no: string; photo_url: string; mentor_id: string; parent_phone: string; department: string; year: number }[]
  >`
    SELECT s.id, u.name, s.roll_no, s.photo_url, s.mentor_id, s.parent_phone, s.department, s.year
    FROM students s JOIN users u ON u.id = s.user_id
    WHERE s.roll_no = ${rollNo}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    rollNo: r.roll_no,
    photoUrl: r.photo_url,
    mentorId: r.mentor_id,
    parentPhone: r.parent_phone,
    branch: r.department,
    year: r.year,
  };
}

export async function listStudents(filters: { year?: number; branch?: string; rollNo?: string; prefix?: string }) {
  const db = getSql();
  const rows = await db`
    SELECT s.id, u.name, s.roll_no, s.photo_url, s.department, s.year, s.mentor_id
    FROM students s JOIN users u ON u.id = s.user_id
    WHERE (${filters.year ?? null}::int IS NULL OR s.year = ${filters.year ?? null})
      AND (${filters.branch ?? null}::text IS NULL OR s.department = ${filters.branch ?? null})
      AND (${filters.rollNo ?? null}::text IS NULL OR s.roll_no = ${filters.rollNo ?? null})
      AND (${filters.prefix ?? null}::text IS NULL OR s.roll_no LIKE ${filters.prefix ? filters.prefix + "%" : null})
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    rollNo: r.roll_no,
    photoUrl: r.photo_url,
    branch: r.department,
    year: r.year,
    mentorId: r.mentor_id,
  }));
}

export async function listMentors(): Promise<Mentor[]> {
  const db = getSql();
  const rows = await db<{ id: string; name: string }[]>`SELECT id, name FROM mentors`;
  return rows;
}

export async function createMentorRecord(name: string, userId: string) {
  const db = getSql();
  const rows = await db`INSERT INTO mentors (name, user_id) VALUES (${name}, ${userId}) RETURNING id`;
  return rows[0].id as string;
}

export async function createStudentRecord(input: {
  userId: string;
  rollNo: string;
  photoUrl: string;
  department: string;
  year: number;
  mentorId: string;
  parentPhone: string;
}) {
  const db = getSql();
  const rows = await db`
    INSERT INTO students (user_id, roll_no, photo_url, department, year, mentor_id, parent_phone)
    VALUES (${input.userId}, ${input.rollNo}, ${input.photoUrl}, ${input.department}, ${input.year}, ${input.mentorId}, ${input.parentPhone})
    RETURNING id
  `;
  return rows[0].id as string;
}

// ---------- Gate passes ----------

export async function createGatePass(input: {
  studentId: string;
  mentorId: string;
  reason: string;
  date: string;
  outTime: string;
}) {
  const db = getSql();
  try {
    const rows = await db<{ id: string; status: string; created_at: string }[]>`
      INSERT INTO gate_passes (student_id, mentor_id, purpose, requested_date, requested_out_time, status)
      VALUES (${input.studentId}, ${input.mentorId}, ${input.reason}, ${input.date}, ${input.outTime}, 'PENDING_MENTOR')
      RETURNING id, status, created_at
    `;
    const r = rows[0];
    return {
      id: r.id,
      studentId: input.studentId,
      mentorId: input.mentorId,
      reason: input.reason,
      date: input.date,
      outTime: input.outTime,
      status: r.status,
      createdAt: new Date(r.created_at).getTime(),
    };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") return null;
    throw err;
  }
}

export async function listGatePasses(filters: { status?: string; mentorId?: string; studentId?: string }) {
  const db = getSql();
  const rows = await db`
    SELECT
      gp.id, gp.student_id, gp.mentor_id, gp.purpose AS reason,
      gp.requested_date AS date, gp.requested_out_time AS out_time,
      gp.status, gp.created_at, gp.mentor_action_at, gp.hod_action_at,
      gp.qr_token, gp.valid_from, gp.valid_until, gp.exit_time, gp.return_time,
      su.name AS student_name, s.roll_no, s.photo_url, s.department, s.year, s.parent_phone,
      m.name AS mentor_name
    FROM gate_passes gp
    JOIN students s ON s.id = gp.student_id
    JOIN users su ON su.id = s.user_id
    JOIN mentors m ON m.id = gp.mentor_id
    WHERE (${filters.status ?? null}::text IS NULL OR gp.status = ${filters.status ?? null})
      AND (${filters.mentorId ?? null}::text IS NULL OR gp.mentor_id = ${filters.mentorId ?? null})
      AND (${filters.studentId ?? null}::text IS NULL OR gp.student_id = ${filters.studentId ?? null})
    ORDER BY gp.created_at DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    studentId: r.student_id,
    mentorId: r.mentor_id,
    reason: r.reason,
    date: r.date,
    outTime: r.out_time,
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    mentorActionAt: r.mentor_action_at ? new Date(r.mentor_action_at).getTime() : undefined,
    hodActionAt: r.hod_action_at ? new Date(r.hod_action_at).getTime() : undefined,
    qrToken: r.qr_token ?? undefined,
    validFrom: r.valid_from ? new Date(r.valid_from).getTime() : undefined,
    validUntil: r.valid_until ? new Date(r.valid_until).getTime() : undefined,
    exitTime: r.exit_time ? new Date(r.exit_time).getTime() : undefined,
    returnTime: r.return_time ? new Date(r.return_time).getTime() : undefined,
    student: {
      name: r.student_name,
      rollNo: r.roll_no,
      photoUrl: r.photo_url,
      branch: r.department,
      year: r.year,
      parentPhone: r.parent_phone,
    },
    mentor: { name: r.mentor_name },
  }));
}

export async function getGatePassById(id: string) {
  const db = getSql();
  const rows = await db`
    SELECT
      gp.id, gp.student_id, gp.mentor_id, gp.purpose AS reason,
      gp.requested_date AS date, gp.requested_out_time AS out_time,
      gp.status, gp.created_at, gp.mentor_action_at, gp.hod_action_at,
      gp.qr_token, gp.valid_from, gp.valid_until, gp.exit_time, gp.return_time,
      su.name AS student_name, s.roll_no, s.photo_url, s.department, s.year, s.parent_phone,
      m.name AS mentor_name
    FROM gate_passes gp
    JOIN students s ON s.id = gp.student_id
    JOIN users su ON su.id = s.user_id
    JOIN mentors m ON m.id = gp.mentor_id
    WHERE gp.id = ${id}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    studentId: r.student_id,
    mentorId: r.mentor_id,
    reason: r.reason,
    date: r.date,
    outTime: r.out_time,
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    mentorActionAt: r.mentor_action_at ? new Date(r.mentor_action_at).getTime() : undefined,
    hodActionAt: r.hod_action_at ? new Date(r.hod_action_at).getTime() : undefined,
    qrToken: r.qr_token ?? undefined,
    validFrom: r.valid_from ? new Date(r.valid_from).getTime() : undefined,
    validUntil: r.valid_until ? new Date(r.valid_until).getTime() : undefined,
    exitTime: r.exit_time ? new Date(r.exit_time).getTime() : undefined,
    returnTime: r.return_time ? new Date(r.return_time).getTime() : undefined,
    student: {
      name: r.student_name,
      rollNo: r.roll_no,
      photoUrl: r.photo_url,
      branch: r.department,
      year: r.year,
      parentPhone: r.parent_phone,
    },
    mentor: { name: r.mentor_name },
  };
}

export async function getGatePassByToken(token: string) {
  const db = getSql();
  const rows = await db`
    SELECT
      gp.id, gp.status, gp.purpose AS reason, gp.requested_date AS date, gp.requested_out_time AS out_time,
      gp.qr_token, gp.valid_until, gp.exit_time, gp.return_time,
      su.name AS student_name, s.roll_no, s.photo_url, s.department,
      m.name AS mentor_name
    FROM gate_passes gp
    JOIN students s ON s.id = gp.student_id
    JOIN users su ON su.id = s.user_id
    JOIN mentors m ON m.id = gp.mentor_id
    WHERE gp.qr_token = ${token}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    status: r.status,
    reason: r.reason,
    date: r.date,
    outTime: r.out_time,
    validUntil: r.valid_until ? new Date(r.valid_until).getTime() : undefined,
    exitTime: r.exit_time ? new Date(r.exit_time).getTime() : undefined,
    returnTime: r.return_time ? new Date(r.return_time).getTime() : undefined,
    student: { name: r.student_name, rollNo: r.roll_no, photoUrl: r.photo_url, branch: r.department },
    mentor: { name: r.mentor_name },
  };
}

export async function mentorSetStatus(
  id: string,
  mentorId: string,
  newStatus: "MENTOR_APPROVED" | "MENTOR_REJECTED"
) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes
    SET status = ${newStatus}, mentor_action_at = now()
    WHERE id = ${id} AND mentor_id = ${mentorId} AND status = 'PENDING_MENTOR'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function hodApprovePass(id: string) {
  const db = getSql();
  const token = crypto.randomUUID().replace(/-/g, "");
  const rows = await db`
    UPDATE gate_passes
    SET status = 'APPROVED',
        hod_action_at = now(),
        qr_token = ${token},
        valid_from = now(),
         valid_until = now() + interval '2 hours'
    WHERE id = ${id} AND status = 'MENTOR_APPROVED'
    RETURNING valid_until
  `;
  if (rows.length === 0) return null;
  return { token, validUntil: new Date(rows[0].valid_until).getTime() };
}

export async function hodRejectPass(id: string) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes SET status = 'HOD_REJECTED', hod_action_at = now()
    WHERE id = ${id} AND status = 'MENTOR_APPROVED'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function consumeExit(token: string) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes SET status = 'EXITED', exit_time = now()
    WHERE qr_token = ${token} AND status = 'APPROVED'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function consumeReturn(token: string) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes SET status = 'RETURNED', return_time = now()
    WHERE qr_token = ${token} AND status = 'EXITED'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function overrideExit(rollNo: string) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes gp
    SET status = 'EXITED', exit_time = now()
    FROM students s
    WHERE gp.student_id = s.id AND s.roll_no = ${rollNo} AND gp.status = 'APPROVED'
    RETURNING gp.id
  `;
  return rows[0]?.id as string | undefined;
}

export async function overrideReturn(rollNo: string) {
  const db = getSql();
  const rows = await db`
    UPDATE gate_passes gp
    SET status = 'RETURNED', return_time = now()
    FROM students s
    WHERE gp.student_id = s.id AND s.roll_no = ${rollNo} AND gp.status = 'EXITED'
    RETURNING gp.id
  `;
  return rows[0]?.id as string | undefined;
}

export async function sweepExpired() {
  const db = getSql();
  const expired = await db<{ id: string }[]>`
    UPDATE gate_passes SET status = 'EXPIRED'
    WHERE status = 'APPROVED' AND valid_until < now()
    RETURNING id
  `;
  for (const row of expired) {
    await logAuditEvent({
      passId: row.id,
      eventType: "PASS_EXPIRED",
      actor: "System",
      details: "Pass validity window elapsed before use.",
      result: "SUCCESS",
    });
  }
}

// ---------- Audit log ----------

export async function logAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">): Promise<void> {
  const db = getSql();
  await db`
    INSERT INTO verification_logs (pass_id, event_type, actor_label, details, result)
    VALUES (${event.passId}, ${event.eventType}, ${event.actor}, ${event.details}, ${event.result})
  `;
}

export async function listAuditHistory(limit = 50) {
  const db = getSql();
  const rows = await db`
    SELECT vl.id, vl.pass_id, vl.event_type, vl.details, vl.actor_label AS actor, vl.timestamp, vl.result,
           su.name AS student_name, s.roll_no
    FROM verification_logs vl
    LEFT JOIN gate_passes gp ON gp.id = vl.pass_id
    LEFT JOIN students s ON s.id = gp.student_id
    LEFT JOIN users su ON su.id = s.user_id
    ORDER BY vl.timestamp DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    passId: r.pass_id,
    eventType: r.event_type,
    details: r.details,
    actor: r.actor,
    timestamp: new Date(r.timestamp).getTime(),
    result: r.result,
    studentName: r.student_name ?? undefined,
    rollNo: r.roll_no ?? undefined,
  }));
}

/** Always compute "today" in IST, regardless of server/DB timezone. */
export async function getSuspiciousActivity() {
  const db = getSql();
  const rows = await db`
    SELECT s.id AS student_id, su.name, s.roll_no,
      COUNT(*) FILTER (WHERE vl.event_type = 'REUSE_ATTEMPT') AS reuse_attempts,
      COUNT(*) FILTER (WHERE vl.result = 'DENIED') AS denied_events,
      COUNT(*) FILTER (WHERE vl.event_type = 'PASS_EXPIRED') AS expired_passes,
      COUNT(*) FILTER (WHERE vl.event_type = 'MANUAL_OVERRIDE') AS overrides
    FROM verification_logs vl
    JOIN gate_passes gp ON gp.id = vl.pass_id
    JOIN students s ON s.id = gp.student_id
    JOIN users su ON su.id = s.user_id
    WHERE vl.timestamp > now() - interval '24 hours'
    GROUP BY s.id, su.name, s.roll_no
    HAVING COUNT(*) FILTER (WHERE vl.event_type = 'REUSE_ATTEMPT') > 0
        OR COUNT(*) FILTER (WHERE vl.result = 'DENIED') > 1
        OR COUNT(*) FILTER (WHERE vl.event_type = 'MANUAL_OVERRIDE') > 0
    ORDER BY reuse_attempts + denied_events DESC
  `;
  return rows.map((r) => ({
    studentId: r.student_id,
    name: r.name,
    rollNo: r.roll_no,
    reuseAttempts: Number(r.reuse_attempts),
    deniedEvents: Number(r.denied_events),
    expiredPasses: Number(r.expired_passes),
    overrides: Number(r.overrides),
  }));
  
}
export type VerifyResult =
  | {
      ok: true;
      pass: {
        id: string;
        studentName: string;
        rollNo: string;
        purpose: string;
        status: string;
        outTime: string;
        validUntil: number | null;
        exitTime: number | null;
      };
    }
  | {
      ok: false;
      reason: "QR_INVALID" | "NOT_APPROVED" | "EXPIRED" | "ALREADY_USED" | "CANCELLED";
    };

export async function verifyPassForGate(token: string): Promise<VerifyResult> {
  const db = getSql();
  const rows = await db`
    SELECT gp.id, gp.status, gp.purpose, gp.requested_out_time AS out_time,
           gp.valid_until, gp.exit_time, su.name AS student_name, s.roll_no
    FROM gate_passes gp
    JOIN students s ON s.id = gp.student_id
    JOIN users su ON su.id = s.user_id
    WHERE gp.qr_token = ${token}
  `;
  if (rows.length === 0) return { ok: false, reason: "QR_INVALID" };
  const r = rows[0];

  if (r.status === "HOD_REJECTED" || r.status === "CANCELLED") return { ok: false, reason: "CANCELLED" };
  if (r.status === "PENDING_MENTOR" || r.status === "MENTOR_APPROVED" || r.status === "MENTOR_REJECTED")
    return { ok: false, reason: "NOT_APPROVED" };
  if (r.status === "EXPIRED") return { ok: false, reason: "EXPIRED" };
  if (r.status === "RETURNED") return { ok: false, reason: "ALREADY_USED" };
  if (r.status === "APPROVED" && r.valid_until && new Date(r.valid_until) < new Date())
    return { ok: false, reason: "EXPIRED" };

  return {
    ok: true,
    pass: {
      id: r.id,
      studentName: r.student_name,
      rollNo: r.roll_no,
      purpose: r.purpose,
      status: r.status,
      outTime: r.out_time ? new Date(r.out_time).toISOString() : "",
      validUntil: r.valid_until ? new Date(r.valid_until).getTime() : null,
      exitTime: r.exit_time ? new Date(r.exit_time).getTime() : null,
    },
  };
}

export async function confirmExit(token: string, gateId: string | null, actorId: string) {
  const db = getSql();
  const rows = await db<{ id: string }[]>`
    UPDATE gate_passes SET status = 'EXITED', exit_time = now()
    WHERE qr_token = ${token} AND status = 'APPROVED'
    RETURNING id
  `;
  if (rows.length === 0) return false;
  await logAuditEvent({
    passId: rows[0].id,
    eventType: "EXIT_VERIFIED",
    actor: actorId,
    details: gateId ? `Gate: ${gateId}` : "",
    result: "SUCCESS",
  });
  return true;
}

export async function confirmReturn(token: string, gateId: string | null, actorId: string) {
  const db = getSql();
  const rows = await db<{ id: string }[]>`
    UPDATE gate_passes SET status = 'RETURNED', return_time = now()
    WHERE qr_token = ${token} AND status = 'EXITED'
    RETURNING id
  `;
  if (rows.length === 0) return false;
  await logAuditEvent({
    passId: rows[0].id,
    eventType: "RETURN_VERIFIED",
    actor: actorId,
    details: gateId ? `Gate: ${gateId}` : "",
    result: "SUCCESS",
  });
  return true;
}