"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BRANCHES, YEAR_LEVELS } from "@/lib/rollPrefixes";

type Tab = "users" | "passes" | "audit" | "alerts";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}
interface Mentor {
  id: string;
  name: string;
}
interface Pass {
  id: string;
  status: string;
  reason: string;
  date: string;
  outTime: string;
  student?: { name: string; rollNo: string };
  mentor?: { name: string };
}
interface HistoryEvent {
  id: string;
  eventType: string;
  details: string;
  actor: string;
  timestamp: number;
  result: "SUCCESS" | "DENIED";
  studentName?: string;
  rollNo?: string;
}
interface Alert {
  studentId: string;
  name: string;
  rollNo: string;
  reuseAttempts: number;
  deniedEvents: number;
  expiredPasses: number;
  overrides: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "passes", label: "All Passes" },
  { key: "audit", label: "Audit Log" },
  { key: "alerts", label: "Suspicious Activity" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollLastDigits, setRollLastDigits] = useState("");
  const [yearLevel, setYearLevel] = useState<number | "">("");
  const [branchCode, setBranchCode] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [formMsg, setFormMsg] = useState("");

  function reload() {
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
    fetch("/api/mentors").then((r) => r.json()).then(setMentors);
    fetch("/api/gatepass").then((r) => r.json()).then(setPasses);
    fetch("/api/verification/history").then((r) => r.json()).then(setHistory);
    fetch("/api/admin/alerts").then((r) => r.json()).then(setAlerts);
  }

  useEffect(() => {
    reload();
    const t = setInterval(reload, 8000);
    return () => clearInterval(t);
  }, []);

  async function submitUser(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg("");
    const branch = BRANCHES.find((b) => b.code === branchCode);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        rollLastDigits,
        yearLevel,
        branchCode,
        branchShort: branch?.short,
        mentorId,
        parentPhone,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormMsg(data.error ?? "Failed to create user.");
      return;
    }
    setFormMsg(`Created ${data.name} (${data.role}).`);
    setName(""); setEmail(""); setPassword(""); setRollLastDigits(""); setParentPhone("");
    reload();
  }

  return (
    <>
      <Header roleLabel="Admin" />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Admin Dashboard</h1>

          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  tab === t.key
                    ? "bg-[var(--cbit-maroon)] text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "users" && (
            <div className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[var(--cbit-green)]">Users ({users.length})</h2>
                <button
                  onClick={() => setShowAddUser((s) => !s)}
                  className="text-sm bg-[var(--cbit-maroon)] text-white rounded-lg px-3 py-1.5 hover:bg-[var(--cbit-maroon-dark)]"
                >
                  {showAddUser ? "Cancel" : "Add user"}
                </button>
              </div>

              {showAddUser && (
                <form onSubmit={submitUser} className="border rounded-lg p-3 space-y-2 bg-slate-50">
                  <div className="grid grid-cols-2 gap-2">
                    <input required placeholder="Name" className="border rounded-lg p-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                    <select className="border rounded-lg p-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="hod">HOD</option>
                      <option value="security">Security</option>
                      <option value="admin">Admin</option>
                    </select>
                    <input required type="email" placeholder="Email" className="border rounded-lg p-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input required type="password" placeholder="Temp password" className="border rounded-lg p-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  {role === "student" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <select required className="border rounded-lg p-2 text-sm" value={yearLevel} onChange={(e) => setYearLevel(e.target.value ? Number(e.target.value) : "")}>
                        <option value="">Year</option>
                        {YEAR_LEVELS.map((y) => (
                          <option key={y} value={y}>{y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year</option>
                        ))}
                      </select>
                      <select required className="border rounded-lg p-2 text-sm" value={branchCode} onChange={(e) => setBranchCode(e.target.value)}>
                        <option value="">Branch</option>
                        {BRANCHES.map((b) => (
                          <option key={b.code} value={b.code}>{b.short}</option>
                        ))}
                      </select>
                      <input required placeholder="Last 3 digits of roll no" maxLength={3} className="border rounded-lg p-2 text-sm" value={rollLastDigits} onChange={(e) => setRollLastDigits(e.target.value.replace(/\D/g, "").slice(0, 3))} />
                      <select required className="border rounded-lg p-2 text-sm" value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
                        <option value="">Mentor</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <input required placeholder="Parent phone" className="border rounded-lg p-2 text-sm col-span-2" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                    </div>
                  )}

                  <button className="w-full bg-[var(--cbit-green)] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90">
                    Create account
                  </button>
                  {formMsg && <p className="text-xs text-slate-600">{formMsg}</p>}
                </form>
              )}

              <div className="space-y-1">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm border-b border-slate-100 py-1.5">
                    <div>
                      <span className="font-medium">{u.name}</span>{" "}
                      <span className="text-slate-400">{u.email}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--cbit-gold)]/20 text-[var(--cbit-maroon)] font-medium uppercase">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "passes" && (
            <div className="bg-white rounded-xl p-4 shadow">
              <h2 className="font-semibold mb-3 text-[var(--cbit-green)]">All gate passes ({passes.length})</h2>
              <div className="space-y-2">
                {passes.length === 0 && <p className="text-sm text-slate-400">No passes yet.</p>}
                {passes.map((p) => (
                  <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{p.student?.name} &middot; {p.student?.rollNo}</div>
                      <div className="text-xs text-slate-400">{p.reason} &middot; {p.date} {p.outTime}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "audit" && (
            <div className="bg-white rounded-xl p-4 shadow">
              <h2 className="font-semibold mb-3 text-[var(--cbit-green)]">Audit log (last 50 events)</h2>
              <div className="space-y-2 max-h-[32rem] overflow-y-auto">
                {history.length === 0 && <p className="text-sm text-slate-400">No events yet.</p>}
                {history.map((e) => (
                  <div key={e.id} className="text-xs border-b border-slate-100 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{e.eventType.replace(/_/g, " ")}</span>
                      <span className={e.result === "DENIED" ? "text-red-500" : "text-slate-400"}>
                        {new Date(e.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {e.studentName ? `${e.studentName} (${e.rollNo}) — ` : ""}
                      {e.details} <span className="text-slate-400">by {e.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "alerts" && (
            <div className="bg-white rounded-xl p-4 shadow">
              <h2 className="font-semibold mb-3 text-[var(--cbit-green)]">Suspicious activity (last 24h)</h2>
              {alerts.length === 0 && <p className="text-sm text-slate-400">Nothing flagged. All clear.</p>}
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.studentId} className="border border-red-200 bg-red-50 rounded-lg p-3 text-sm">
                    <div className="font-medium">{a.name} &middot; {a.rollNo}</div>
                    <div className="text-xs text-red-700 mt-1 flex gap-3 flex-wrap">
                      {a.reuseAttempts > 0 && <span>{a.reuseAttempts} reuse attempt(s)</span>}
                      {a.deniedEvents > 0 && <span>{a.deniedEvents} denied event(s)</span>}
                      {a.expiredPasses > 0 && <span>{a.expiredPasses} expired pass(es)</span>}
                      {a.overrides > 0 && <span>{a.overrides} manual override(s)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
