export type PassStatus =
  | "PENDING_MENTOR"
  | "MENTOR_REJECTED"
  | "MENTOR_APPROVED" // mentor OK'd, waiting for HOD
  | "HOD_REJECTED"
  | "APPROVED" // HOD stamped, token issued, valid for exit until validUntil
  | "EXITED" // security has verified and let the student out
  | "RETURNED" // security has verified return
  | "EXPIRED" // validUntil passed without being used
  | "CANCELLED"; // student/staff cancelled after approval

export type AuditEventType =
  | "PASS_CREATED"
  | "PASS_MENTOR_APPROVED"
  | "PASS_MENTOR_REJECTED"
  | "PASS_HOD_APPROVED"
  | "PASS_HOD_REJECTED"
  | "QR_SCANNED"
  | "EXIT_VERIFIED"
  | "RETURN_VERIFIED"
  | "PASS_EXPIRED"
  | "PASS_CANCELLED"
  | "REUSE_ATTEMPT"
  | "MANUAL_OVERRIDE";

export type Role = "student" | "mentor" | "hod" | "security" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  linkedStudentId?: string; // set when role === "student"
  linkedMentorId?: string; // set when role === "mentor"
  status: "active" | "disabled";
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  photoUrl: string;
  mentorId: string;
  parentPhone: string;
  branch: string; // short code, e.g. "CSE"
  year: number; // 1-4, current year of study
}

export interface Mentor {
  id: string;
  name: string;
}

export interface GatePass {
  id: string;
  studentId: string;
  mentorId: string;
  reason: string;
  date: string; // YYYY-MM-DD
  outTime: string; // HH:MM, requested exit time
  status: PassStatus;
  createdAt: number;
  mentorActionAt?: number;
  hodActionAt?: number;

  // issued only once HOD approves — this is what the "QR code" encodes.
  // Unpredictable and unrelated to roll number/sequential IDs, per design doc.
  qrToken?: string;
  validFrom?: number; // epoch ms, pass usable from this time
  validUntil?: number; // epoch ms, pass expires after this time (campus close, 4pm)

  exitTime?: number;
  returnTime?: number;
  cancelledAt?: number;
}

export interface AuditEvent {
  id: string;
  passId: string;
  eventType: AuditEventType;
  details: string;
  actor: string; // role or name performing the action, e.g. "Security", "Mentor: Dr. Ramesh Kumar"
  timestamp: number;
  result: "SUCCESS" | "DENIED";
}
