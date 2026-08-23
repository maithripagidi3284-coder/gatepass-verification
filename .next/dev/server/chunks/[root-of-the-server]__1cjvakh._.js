module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/gatepass/src/app/api/gatepass/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/src/lib/store.ts [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Sign in required."
    }, {
        status: 401
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sweepExpired"])();
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    let mentorId = searchParams.get("mentorId");
    let studentId = searchParams.get("studentId");
    // Resource-level authorization: students only ever see their own passes,
    // mentors only ever see passes assigned to them — regardless of what the
    // query string says.
    if (session.role === "student") studentId = session.linkedId ?? "__none__";
    if (session.role === "mentor") mentorId = session.linkedId ?? "__none__";
    let passes = store.passes;
    if (status) passes = passes.filter((p)=>p.status === status);
    if (mentorId) passes = passes.filter((p)=>p.mentorId === mentorId);
    if (studentId) passes = passes.filter((p)=>p.studentId === studentId);
    const enriched = passes.slice().sort((a, b)=>b.createdAt - a.createdAt).map((p)=>({
            ...p,
            student: store.students.find((s)=>s.id === p.studentId),
            mentor: store.mentors.find((m)=>m.id === p.mentorId)
        }));
    return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enriched);
}
async function POST(req) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session || session.role !== "student" || !session.linkedId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Sign in as a student to request a gate pass."
        }, {
            status: 403
        });
    }
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStore"])();
    const studentId = session.linkedId; // never trust an identity supplied by the client
    const student = store.students.find((s)=>s.id === studentId);
    if (!student) return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Student record not found."
    }, {
        status: 404
    });
    const body = await req.json();
    const { reason, date, outTime } = body;
    if (!reason || !date || !outTime) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing fields"
        }, {
            status: 400
        });
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasActivePass"])(studentId)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "You already have an active or pending gate pass. Wait for it to complete before requesting another."
        }, {
            status: 409
        });
    }
    const pass = {
        id: crypto.randomUUID(),
        studentId,
        mentorId: student.mentorId,
        reason,
        date,
        outTime,
        status: "PENDING_MENTOR",
        createdAt: Date.now()
    };
    store.passes.push(pass);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logEvent"])("PASS_CREATED", pass.id, student.name, `Requested exit for "${reason}" on ${date} at ${outTime}.`);
    return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(pass, {
        status: 201
    });
}
}),
"[project]/gatepass/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SESSION_COOKIE_NAME",
    ()=>SESSION_COOKIE_NAME,
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "createSessionToken",
    ()=>createSessionToken,
    "getSession",
    ()=>getSession,
    "requireRole",
    ()=>requireRole,
    "setSessionCookie",
    ()=>setSessionCookie,
    "verifySessionToken",
    ()=>verifySessionToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const encoder = new TextEncoder();
// IMPORTANT: set a real SESSION_SECRET env var in production. This fallback
// only exists so the prototype runs out of the box in dev.
const SECRET = encoder.encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me");
const SESSION_COOKIE_NAME = "gatepass_session";
async function createSessionToken(payload) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
        ...payload
    }).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime("12h").sign(SECRET);
}
async function verifySessionToken(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, SECRET);
        return payload;
    } catch  {
        return null;
    }
}
async function setSessionCookie(token) {
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    store.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12
    });
}
async function clearSessionCookie() {
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    store.delete(SESSION_COOKIE_NAME);
}
async function getSession() {
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = store.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}
async function requireRole(...roles) {
    const session = await getSession();
    if (!session || !roles.includes(session.role)) return null;
    return session;
}
}),
"[project]/gatepass/src/lib/password.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
function hashPassword(plain) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hashSync(plain, 10);
}
function verifyPassword(plain, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compareSync(plain, hash);
}
}),
"[project]/gatepass/src/lib/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateQrToken",
    ()=>generateQrToken,
    "getStore",
    ()=>getStore,
    "hasActivePass",
    ()=>hasActivePass,
    "logEvent",
    ()=>logEvent,
    "sweepExpired",
    ()=>sweepExpired
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/src/lib/password.ts [app-route] (ecmascript)");
;
function seed() {
    const mentors = [
        {
            id: "m1",
            name: "Dr. Ramesh Kumar"
        },
        {
            id: "m2",
            name: "Prof. Anitha Reddy"
        },
        {
            id: "m3",
            name: "Dr. Suresh Babu"
        }
    ];
    const students = [
        {
            id: "s1",
            name: "Maithri",
            rollNo: "160124733047",
            photoUrl: "https://i.pravatar.cc/150?img=47",
            mentorId: "m1",
            parentPhone: "+91 90000 00001",
            branch: "CSE",
            year: 1
        },
        {
            id: "s2",
            name: "Rahul Varma",
            rollNo: "160123733015",
            photoUrl: "https://i.pravatar.cc/150?img=12",
            mentorId: "m2",
            parentPhone: "+91 90000 00002",
            branch: "CSE",
            year: 2
        },
        {
            id: "s3",
            name: "Sneha Iyer",
            rollNo: "160124734008",
            photoUrl: "https://i.pravatar.cc/150?img=32",
            mentorId: "m1",
            parentPhone: "+91 90000 00003",
            branch: "ECE",
            year: 1
        },
        {
            id: "s4",
            name: "Karthik Reddy",
            rollNo: "160122733112",
            photoUrl: "https://i.pravatar.cc/150?img=14",
            mentorId: "m3",
            parentPhone: "+91 90000 00004",
            branch: "CSE",
            year: 3
        }
    ];
    const users = [
        {
            id: "u_admin",
            name: "System Admin",
            email: "admin@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("admin123"),
            role: "admin",
            status: "active"
        },
        {
            id: "u_security",
            name: "Gate Security",
            email: "security@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("security123"),
            role: "security",
            status: "active"
        },
        {
            id: "u_hod",
            name: "HOD, CSE",
            email: "hod.cse@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("hod123"),
            role: "hod",
            status: "active"
        },
        {
            id: "u_m1",
            name: "Dr. Ramesh Kumar",
            email: "ramesh.kumar@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("mentor123"),
            role: "mentor",
            linkedMentorId: "m1",
            status: "active"
        },
        {
            id: "u_m2",
            name: "Prof. Anitha Reddy",
            email: "anitha.reddy@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("mentor123"),
            role: "mentor",
            linkedMentorId: "m2",
            status: "active"
        },
        {
            id: "u_m3",
            name: "Dr. Suresh Babu",
            email: "suresh.babu@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("mentor123"),
            role: "mentor",
            linkedMentorId: "m3",
            status: "active"
        },
        {
            id: "u_s1",
            name: "Maithri",
            email: "maithri@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("student123"),
            role: "student",
            linkedStudentId: "s1",
            status: "active"
        },
        {
            id: "u_s2",
            name: "Rahul Varma",
            email: "rahul@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("student123"),
            role: "student",
            linkedStudentId: "s2",
            status: "active"
        },
        {
            id: "u_s3",
            name: "Sneha Iyer",
            email: "sneha@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("student123"),
            role: "student",
            linkedStudentId: "s3",
            status: "active"
        },
        {
            id: "u_s4",
            name: "Karthik Reddy",
            email: "karthik@cbit.ac.in",
            passwordHash: (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$src$2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])("student123"),
            role: "student",
            linkedStudentId: "s4",
            status: "active"
        }
    ];
    return {
        mentors,
        students,
        passes: [],
        auditLog: [],
        users
    };
}
function getStore() {
    if (!/*TURBOPACK member replacement*/ __turbopack_context__.g.__gatepassStore) {
        /*TURBOPACK member replacement*/ __turbopack_context__.g.__gatepassStore = seed();
    }
    return /*TURBOPACK member replacement*/ __turbopack_context__.g.__gatepassStore;
}
function generateQrToken() {
    return crypto.randomUUID().replace(/-/g, "");
}
function logEvent(eventType, passId, actor, details, result = "SUCCESS") {
    const store = getStore();
    store.auditLog.unshift({
        id: crypto.randomUUID(),
        passId,
        eventType,
        details,
        actor,
        timestamp: Date.now(),
        result
    });
}
function hasActivePass(studentId) {
    const store = getStore();
    return store.passes.some((p)=>p.studentId === studentId && [
            "PENDING_MENTOR",
            "MENTOR_APPROVED",
            "APPROVED",
            "EXITED"
        ].includes(p.status));
}
function sweepExpired() {
    const store = getStore();
    const now = Date.now();
    for (const p of store.passes){
        if (p.status === "APPROVED" && p.validUntil && now > p.validUntil) {
            p.status = "EXPIRED";
            logEvent("PASS_EXPIRED", p.id, "System", "Pass validity window elapsed before use.");
        }
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1cjvakh._.js.map