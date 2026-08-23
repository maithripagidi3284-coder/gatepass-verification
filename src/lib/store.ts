import { AuditEvent, GatePass, Mentor, Student, User } from "./types";
import { hashPassword } from "./password";

declare global {
  // eslint-disable-next-line no-var
  var __gatepassStore:
    | { mentors: Mentor[]; students: Student[]; passes: GatePass[]; auditLog: AuditEvent[]; users: User[] }
    | undefined;
}

function seed() {
  const mentors: Mentor[] = [
    { id: "m1", name: "Dr. Ramesh Kumar" },
    { id: "m2", name: "Prof. Anitha Reddy" },
    { id: "m3", name: "Dr. Suresh Babu" },
  ];

  const students: Student[] = [
    {
      id: "s1",
      name: "Maithri",
      rollNo: "160124733047",
      photoUrl: "https://i.pravatar.cc/150?img=47",
      mentorId: "m1",
      parentPhone: "+91 90000 00001",
      branch: "CSE",
      year: 1,
    },
    {
      id: "s2",
      name: "Rahul Varma",
      rollNo: "160123733015",
      photoUrl: "https://i.pravatar.cc/150?img=12",
      mentorId: "m2",
      parentPhone: "+91 90000 00002",
      branch: "CSE",
      year: 2,
    },
    {
      id: "s3",
      name: "Sneha Iyer",
      rollNo: "160124734008",
      photoUrl: "https://i.pravatar.cc/150?img=32",
      mentorId: "m1",
      parentPhone: "+91 90000 00003",
      branch: "ECE",
      year: 1,
    },
    {
      id: "s4",
      name: "Karthik Reddy",
      rollNo: "160122733112",
      photoUrl: "https://i.pravatar.cc/150?img=14",
      mentorId: "m3",
      parentPhone: "+91 90000 00004",
      branch: "CSE",
      year: 3,
    },
  ];

  const users: User[] = [
    {
      id: "u_admin",
      name: "System Admin",
      email: "admin@cbit.ac.in",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      status: "active",
    },
    {
      id: "u_security",
      name: "Gate Security",
      email: "security@cbit.ac.in",
      passwordHash: hashPassword("security123"),
      role: "security",
      status: "active",
    },
    {
      id: "u_hod",
      name: "HOD, CSE",
      email: "hod.cse@cbit.ac.in",
      passwordHash: hashPassword("hod123"),
      role: "hod",
      status: "active",
    },
    {
      id: "u_m1",
      name: "Dr. Ramesh Kumar",
      email: "ramesh.kumar@cbit.ac.in",
      passwordHash: hashPassword("mentor123"),
      role: "mentor",
      linkedMentorId: "m1",
      status: "active",
    },
    {
      id: "u_m2",
      name: "Prof. Anitha Reddy",
      email: "anitha.reddy@cbit.ac.in",
      passwordHash: hashPassword("mentor123"),
      role: "mentor",
      linkedMentorId: "m2",
      status: "active",
    },
    {
      id: "u_m3",
      name: "Dr. Suresh Babu",
      email: "suresh.babu@cbit.ac.in",
      passwordHash: hashPassword("mentor123"),
      role: "mentor",
      linkedMentorId: "m3",
      status: "active",
    },
    {
      id: "u_s1",
      name: "Maithri",
      email: "maithri@cbit.ac.in",
      passwordHash: hashPassword("student123"),
      role: "student",
      linkedStudentId: "s1",
      status: "active",
    },
    {
      id: "u_s2",
      name: "Rahul Varma",
      email: "rahul@cbit.ac.in",
      passwordHash: hashPassword("student123"),
      role: "student",
      linkedStudentId: "s2",
      status: "active",
    },
    {
      id: "u_s3",
      name: "Sneha Iyer",
      email: "sneha@cbit.ac.in",
      passwordHash: hashPassword("student123"),
      role: "student",
      linkedStudentId: "s3",
      status: "active",
    },
    {
      id: "u_s4",
      name: "Karthik Reddy",
      email: "karthik@cbit.ac.in",
      passwordHash: hashPassword("student123"),
      role: "student",
      linkedStudentId: "s4",
      status: "active",
    },
  ];

  return { mentors, students, passes: [] as GatePass[], auditLog: [] as AuditEvent[], users };
}

export function getStore() {
  if (!global.__gatepassStore) {
    global.__gatepassStore = seed();
  }
  return global.__gatepassStore;
}

/**
 * High-entropy, unpredictable token. In a real deployment this should be
 * generated with crypto.randomBytes(32) server-side and never derived from
 * the roll number, pass id, or any guessable sequence — this is what the
 * "QR code" actually encodes; the QR image itself carries no trust.
 */
export function generateQrToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function logEvent(
  eventType: AuditEvent["eventType"],
  passId: string,
  actor: string,
  details: string,
  result: AuditEvent["result"] = "SUCCESS"
) {
  const store = getStore();
  store.auditLog.unshift({
    id: crypto.randomUUID(),
    passId,
    eventType,
    details,
    actor,
    timestamp: Date.now(),
    result,
  });
}

/** A student may only have one pass "in flight" at a time. */
export function hasActivePass(studentId: string): boolean {
  const store = getStore();
  return store.passes.some(
    (p) =>
      p.studentId === studentId &&
      ["PENDING_MENTOR", "MENTOR_APPROVED", "APPROVED", "EXITED"].includes(p.status)
  );
}

/** Lazily flips any past-due APPROVED pass to EXPIRED and logs it. Call before reading pass state. */
export function sweepExpired() {
  const store = getStore();
  const now = Date.now();
  for (const p of store.passes) {
    if (p.status === "APPROVED" && p.validUntil && now > p.validUntil) {
      p.status = "EXPIRED";
      logEvent("PASS_EXPIRED", p.id, "System", "Pass validity window elapsed before use.");
    }
  }
}
