"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Session {
  name: string;
  role: string;
}

export function Header({ roleLabel }: { roleLabel?: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="w-full">
      <div className="bg-[var(--cbit-maroon-dark)] text-white text-xs">
        <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span className="tracking-wide opacity-90">CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY</span>
          <span className="opacity-80 hidden sm:inline">Autonomous Institute | Affiliated to Osmania University</span>
        </div>
      </div>

      <div className="bg-white border-b-4 border-[var(--cbit-gold)] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--cbit-maroon)] text-white flex items-center justify-center font-bold text-sm">
              CBIT
            </div>
            <div className="leading-tight">
              <div className="text-[var(--cbit-maroon)] font-bold text-lg">Digital Gate Pass</div>
              <div className="text-[var(--cbit-green)] text-xs font-medium tracking-wide">CBIT HYDERABAD</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {roleLabel && (
              <span className="text-[var(--cbit-green)] font-semibold text-sm uppercase tracking-wide hidden sm:inline">
                {roleLabel}
              </span>
            )}
            {session && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{session.name}</span>
                <button
                  onClick={logout}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
