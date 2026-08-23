(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0kavxm6._.js",
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/gatepass/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/gatepass/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/gatepass/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
;
;
const encoder = new TextEncoder();
const SECRET = encoder.encode(process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me");
const COOKIE_NAME = "gatepass_session";
const ROLE_FOR_PREFIX = {
    "/student": "student",
    "/mentor": "mentor",
    "/hod": "hod",
    "/security": "security",
    "/admin": "admin"
};
async function middleware(req) {
    const path = req.nextUrl.pathname;
    const prefix = Object.keys(ROLE_FOR_PREFIX).find((p)=>path === p || path.startsWith(`${p}/`));
    if (!prefix) return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/login?next=${encodeURIComponent(path)}`, req.url));
    }
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, SECRET);
        if (payload.role !== ROLE_FOR_PREFIX[prefix]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/login?error=wrong_role`, req.url));
        }
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/login?next=${encodeURIComponent(path)}`, req.url));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$gatepass$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/student/:path*",
        "/mentor/:path*",
        "/hod/:path*",
        "/security/:path*",
        "/admin/:path*"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0kavxm6._.js.map