# CBIT Digital Gate Pass System

A Next.js prototype implementing the full gate-pass workflow (Student -> Mentor ->
HOD -> Security) plus the security architecture from the design doc: real
auth, RBAC, unpredictable QR tokens, atomic single-use verification, audit
logging, rate limiting, and an admin dashboard.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo accounts

All seeded in src/lib/store.ts -- change these before any real use.

| Role     | Email                     | Password    |
|----------|----------------------------|-------------|
| Student  | maithri@cbit.ac.in         | student123  |
| Student  | rahul@cbit.ac.in           | student123  |
| Mentor   | ramesh.kumar@cbit.ac.in    | mentor123   |
| Mentor   | anitha.reddy@cbit.ac.in    | mentor123   |
| HOD      | hod.cse@cbit.ac.in         | hod123      |
| Security | security@cbit.ac.in        | security123 |
| Admin    | admin@cbit.ac.in           | admin123    |

## What's implemented and tested (verified with curl against a real running build)

- Real authentication -- bcrypt-hashed passwords, JWT session in an httpOnly cookie (src/lib/auth.ts)
- Route protection -- src/middleware.ts redirects unauthenticated or wrong-role visitors away from /student, /mentor, /hod, /security, /admin
- Server-derived identity -- a student's ID always comes from their session, never the request body. Tested: sending a spoofed studentId in the request is silently ignored in favor of the real session identity.
- Resource-level authorization -- mentors can only act on passes assigned to them (tested: wrong mentor gets 403 "This request is not assigned to you"); HOD/security actions are role-gated server-side, not just hidden in the UI
- Pass state machine -- PENDING_MENTOR -> MENTOR_APPROVED -> APPROVED -> EXITED -> RETURNED, with rejection/expiry/cancellation branches
- Unpredictable QR tokens -- issued only at HOD approval, 32-char random hex, never derived from roll number or sequential IDs
- Atomic single-use verification -- tested: scanning an already-exited token for exit again is rejected with 409 and logged as REUSE_ATTEMPT
- Automatic expiry -- passes expire at 4:00 PM same day; tested with a past date, correctly flipped to EXPIRED and surfaced in the admin's Suspicious Activity tab
- One active pass per student -- tested: creating a second request while one is in flight is blocked with 409
- Append-only audit log -- every event (creation, approvals, scans, exits, reuse attempts, overrides) logged with actor, timestamp, and result; no delete capability exists anywhere in the API
- Rate limiting -- login and all verification endpoints are throttled per IP (in-memory, single-instance -- see note below)
- Manual override -- fallback for a lost/unscannable token, requires a typed reason, logged distinctly as MANUAL_OVERRIDE
- Admin dashboard (/admin) -- create user accounts (including onboarding new students/mentors), view all passes, browse the audit log, see auto-flagged suspicious activity
- Minimal data exposure -- general student lookup (/api/students) never returns parent phone; that's only included when a mentor legitimately needs it via an active gate-pass request

## What's NOT done / not testable here

- Real Postgres -- schema.sql (full table design) and src/lib/db.ts (a
  matching query-function reference implementation using the postgres npm
  package) are written and type-check cleanly, but NOT wired into the app
  and NOT tested against a live database -- this sandbox has no network
  access to Neon or any external Postgres. The app still runs on the
  in-memory store in src/lib/store.ts (data resets on server restart).
  See the comment at the top of db.ts for how to switch over.
- HTTPS -- not application code, just a deployment setting. Automatic on
  Vercel or most managed hosts.
- Gates management, notifications (email/SMS) -- not built.
- Distributed rate limiting -- the current limiter is in-memory and only
  works correctly with a single server instance. For multiple instances,
  swap src/lib/rateLimit.ts for a shared store (e.g. Upstash Redis).

## Project structure

```
src/
  lib/
    types.ts        - PassStatus state machine, User/Student/Mentor/GatePass types
    store.ts         - in-memory data store (swap for db.ts + Postgres later)
    auth.ts           - session creation/verification, requireRole()
    password.ts       - bcrypt hash/verify
    rateLimit.ts       - in-memory sliding-window limiter
    rollPrefixes.ts     - roll-number scheme config (edit with your real codes)
    db.ts                - reference Postgres adapter, NOT wired in, see comment
  middleware.ts          - route protection by role
  app/
    api/
      auth/               - login, logout, me
      gatepass/            - create/list + mentor/hod approve/reject actions
      verification/         - scan, exit, return, override, history (security)
      admin/                 - users, alerts
      students/, mentors/     - lookups
    student/, mentor/, hod/, security/, admin/, login/   - pages
schema.sql               - Postgres schema matching the design doc
```
