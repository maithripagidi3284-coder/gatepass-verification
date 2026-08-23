-- Gate Pass System — PostgreSQL schema (for Neon or any Postgres instance)
-- Run this against your database before wiring src/lib/db.ts into the app.
-- This is NOT auto-applied — see db.ts header comment for how to switch over.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('student','mentor','hod','security','admin')),
  college_id     TEXT,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mentors (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  user_id UUID REFERENCES users(id)
);

CREATE TABLE students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  roll_no       TEXT NOT NULL UNIQUE,
  photo_url     TEXT,
  department    TEXT NOT NULL,
  year          INT NOT NULL,
  mentor_id     UUID NOT NULL REFERENCES mentors(id),
  parent_phone  TEXT NOT NULL
);

CREATE TABLE gates (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_name TEXT NOT NULL,
  location  TEXT,
  status    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled'))
);

CREATE TABLE gate_passes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES students(id),
  mentor_id     UUID NOT NULL REFERENCES mentors(id),
  purpose       TEXT NOT NULL,
  destination   TEXT,
  requested_date DATE NOT NULL,
  requested_out_time TIME NOT NULL,
  valid_from    TIMESTAMPTZ,
  valid_until   TIMESTAMPTZ,

  -- Unpredictable, high-entropy token. Never sequential, never derived from
  -- roll number or pass id. Generate with crypto.randomBytes(32) server-side.
  qr_token      TEXT UNIQUE,

  status        TEXT NOT NULL DEFAULT 'PENDING_MENTOR' CHECK (
                  status IN (
                    'PENDING_MENTOR','MENTOR_REJECTED','MENTOR_APPROVED',
                    'HOD_REJECTED','APPROVED','EXITED','RETURNED',
                    'EXPIRED','CANCELLED'
                  )
                ),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  mentor_action_at  TIMESTAMPTZ,
  hod_action_at     TIMESTAMPTZ,
  approved_by       UUID REFERENCES users(id),
  exit_time         TIMESTAMPTZ,
  return_time       TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ
);

CREATE INDEX idx_gate_passes_student ON gate_passes(student_id);
CREATE INDEX idx_gate_passes_mentor ON gate_passes(mentor_id);
CREATE INDEX idx_gate_passes_status ON gate_passes(status);
CREATE UNIQUE INDEX idx_gate_passes_one_active_per_student
  ON gate_passes(student_id)
  WHERE status IN ('PENDING_MENTOR','MENTOR_APPROVED','APPROVED','EXITED');

-- Append-only verification/audit trail. No UPDATE or DELETE should ever be
-- granted on this table to the application role that students/mentors use —
-- only INSERT and SELECT. Enforce with a Postgres role + GRANT, not just
-- application logic.
CREATE TABLE verification_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id     UUID NOT NULL REFERENCES gate_passes(id),
  event_type  TEXT NOT NULL CHECK (
                event_type IN (
                  'PASS_CREATED','PASS_MENTOR_APPROVED','PASS_MENTOR_REJECTED',
                  'PASS_HOD_APPROVED','PASS_HOD_REJECTED','QR_SCANNED',
                  'EXIT_VERIFIED','RETURN_VERIFIED','PASS_EXPIRED',
                  'PASS_CANCELLED','REUSE_ATTEMPT','MANUAL_OVERRIDE'
                )
              ),
  actor_id    UUID REFERENCES users(id),
  actor_label TEXT NOT NULL, -- denormalized name/role for fast display even if user is later removed
  details     TEXT,
  result      TEXT NOT NULL CHECK (result IN ('SUCCESS','DENIED')),
  gate_id     UUID REFERENCES gates(id),
  device_id   TEXT,
  ip_address  TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_logs_pass ON verification_logs(pass_id);
CREATE INDEX idx_verification_logs_timestamp ON verification_logs(timestamp);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  pass_id    UUID REFERENCES gate_passes(id),
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed a default gate so the app has at least one to reference.
INSERT INTO gates (gate_name, location) VALUES ('Main Gate', 'Front entrance');
