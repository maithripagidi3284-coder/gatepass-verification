"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";

const ROLE_HOME: Record<string, string> = {
  student: "/student",
  mentor: "/mentor",
  hod: "/hod",
  security: "/security",
  admin: "/admin",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const wrongRole = params.get("error") === "wrong_role";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }
    router.push(next || ROLE_HOME[data.role] || "/");
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Sign in</h1>
      {wrongRole && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          That account isn&apos;t authorized for the page you tried to open.
        </p>
      )}
      <form onSubmit={submit} className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)] space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">College email</label>
          <input
            required
            type="email"
            className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--cbit-maroon)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cbit.ac.in"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
          <input
            required
            type="password"
            className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--cbit-maroon)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-[var(--cbit-maroon)] text-white rounded-lg py-2 font-medium hover:bg-[var(--cbit-maroon-dark)] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="bg-white rounded-xl p-4 shadow text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-600 mb-1">Demo accounts (change these before real use):</div>
        <div>Student: maithri@cbit.ac.in / student123</div>
        <div>Mentor: ramesh.kumar@cbit.ac.in / mentor123</div>
        <div>HOD: hod.cse@cbit.ac.in / hod123</div>
        <div>Security: security@cbit.ac.in / security123</div>
        <div>Admin: admin@cbit.ac.in / admin123</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
