"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  photoUrl: string;
  branch: string;
  year: number;
  mentorName?: string;
}
interface Pass {
  id: string;
  status: string;
  reason: string;
  date: string;
  outTime: string;
  createdAt: number;
  qrToken?: string;
  validUntil?: number;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_MENTOR: "Waiting for mentor",
  MENTOR_APPROVED: "Mentor approved, waiting for HOD",
  MENTOR_REJECTED: "Rejected by mentor",
  HOD_REJECTED: "Rejected by HOD",
  APPROVED: "Approved, show QR at gate",
  EXITED: "Exited campus",
  RETURNED: "Returned to campus",
  EXPIRED: "Expired, unused",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_MENTOR: "bg-yellow-100 text-yellow-800",
  MENTOR_APPROVED: "bg-blue-100 text-blue-800",
  MENTOR_REJECTED: "bg-red-100 text-red-800",
  HOD_REJECTED: "bg-red-100 text-red-800",
  APPROVED: "bg-green-100 text-green-800",
  EXITED: "bg-orange-100 text-orange-800",
  RETURNED: "bg-slate-200 text-slate-600",
  EXPIRED: "bg-slate-200 text-slate-500",
  CANCELLED: "bg-slate-200 text-slate-500",
};

export default function StudentPage() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [reason, setReason] = useState("");
const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  const [outTime, setOutTime] = useState("");
  const [passes, setPasses] = useState<Pass[]>([]);
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setStudent(data.profile));
  }, []);

  useEffect(() => {
    if (!student) return;
    const load = () =>
      fetch(`/api/gatepass?studentId=${student.id}`)
        .then((r) => r.json())
        .then(setPasses);
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [student]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setMsgIsError(false);
    const res = await fetch("/api/gatepass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // studentId/mentorId are derived server-side from the session — never
      // trust the client to say who it is.
      body: JSON.stringify({ reason, date, outTime }),
    });
    if (res.ok) {
      setReason("");
      setDate("");
      setOutTime("");
      setMsg("Request sent to your mentor.");
      fetch(`/api/gatepass?studentId=${student!.id}`)
        .then((r) => r.json())
        .then(setPasses);
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg(err.error ?? "Something went wrong submitting your request.");
      setMsgIsError(true);
    }
  }

  return (
    <>
      <Header roleLabel="Student" />
      <main className="flex-1 p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Gate Pass Request</h1>

          {!student && <p className="text-sm text-slate-400">Loading your profile…</p>}

          {student && (
            <>
              <div className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)]">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={student.photoUrl} alt={student.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-slate-800">{student.name}</div>
                    <div className="text-sm text-slate-500">
                      {student.rollNo} &middot; {student.branch} &middot; Year {student.year}
                    </div>
                    <div className="text-sm text-[var(--cbit-green)] mt-0.5">
                      Mentor: <span className="font-medium">{student.mentorName}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="bg-white rounded-xl p-4 shadow space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Reason</label>
                  <textarea
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--cbit-maroon)]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Doctor appointment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                    <input
                      required
                      type="date"
                      readOnly
                      className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-600 focus:outline-none"
                      value={date}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Out time</label>
                    <input
                      required
                      type="time"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[var(--cbit-maroon)]"
                      value={outTime}
                      onChange={(e) => setOutTime(e.target.value)}
                    />
                  </div>
                </div>
                <button className="w-full bg-[var(--cbit-maroon)] text-white rounded-lg py-2 font-medium hover:bg-[var(--cbit-maroon-dark)]">
                  Submit request
                </button>
                {msg && (
                  <p className={`text-sm ${msgIsError ? "text-red-600" : "text-green-600"}`}>{msg}</p>
                )}
              </form>

              <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-3 text-[var(--cbit-green)]">My requests</h2>
                <div className="space-y-2">
                  {passes.length === 0 && <p className="text-sm text-slate-400">No requests yet.</p>}
                  {passes.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{p.reason}</div>
                          <div className="text-xs text-slate-400">
                            {p.date} &middot; {p.outTime}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </div>
                      {p.status === "APPROVED" && p.qrToken && (
                        <div className="mt-3 bg-[var(--cbit-cream)] border border-dashed border-[var(--cbit-gold)] rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">
                            Show this at the gate (in production this renders as a scannable QR code)
                          </div>
                          <div className="font-mono text-xs break-all text-[var(--cbit-maroon)]">{p.qrToken}</div>
                          {p.validUntil && (
                            <div className="text-xs text-slate-400 mt-1">
                              Valid until {new Date(p.validUntil).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
