"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

interface ScanResult {
  id: string;
  status: string;
  reason: string;
  date: string;
  outTime: string;
  validUntil?: number;
  exitTime?: number;
  returnTime?: number;
  student: { name: string; rollNo: string; photoUrl: string; branch: string } | null;
  mentor: { name: string } | null;
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

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Approved — ready for exit",
  EXITED: "Already exited — ready for return",
  RETURNED: "Return already recorded",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  PENDING_MENTOR: "Not yet approved",
  MENTOR_APPROVED: "Waiting on HOD",
  MENTOR_REJECTED: "Rejected by mentor",
  HOD_REJECTED: "Rejected by HOD",
};

export default function SecurityPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [outsideCount, setOutsideCount] = useState<number | null>(null);

  const [showOverride, setShowOverride] = useState(false);
  const [ovRollNo, setOvRollNo] = useState("");
  const [ovAction, setOvAction] = useState<"exit" | "return">("exit");
  const [ovReason, setOvReason] = useState("");
  const [ovMsg, setOvMsg] = useState("");

  const [history, setHistory] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    const load = () => fetch("/api/verification/history").then((r) => r.json()).then(setHistory);
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = () =>
      fetch("/api/gatepass?status=EXITED")
        .then((r) => r.json())
        .then((list) => setOutsideCount(Array.isArray(list) ? list.length : 0));
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function scan() {
    setError("");
    setResult(null);
    setActionMsg("");
    const res = await fetch("/api/verification/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Scan failed.");
      return;
    }
    setResult(data);
  }

  async function doAction(action: "exit" | "return") {
    setActionMsg("");
    const res = await fetch(`/api/verification/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionMsg(data.error ?? "Action failed.");
      return;
    }
    setActionMsg(action === "exit" ? "Exit recorded. Student may proceed." : "Return recorded.");
    scan();
  }

  async function submitOverride(e: React.FormEvent) {
    e.preventDefault();
    setOvMsg("");
    const res = await fetch("/api/verification/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollNo: ovRollNo.trim(), action: ovAction, reason: ovReason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setOvMsg(data.error ?? "Override failed.");
      return;
    }
    setOvMsg(`Manual ${ovAction} recorded for ${data.student?.name}. This has been logged.`);
    setOvReason("");
  }

  return (
    <>
      <Header roleLabel="Security" />
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Verify Gate Pass</h1>

          {outsideCount !== null && (
            <div className="bg-white rounded-xl p-3 shadow flex items-center justify-between">
              <span className="text-sm text-slate-500">Currently outside campus</span>
              <span className="text-2xl font-bold text-[var(--cbit-maroon)]">{outsideCount}</span>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)] space-y-3">
            <label className="block text-sm font-medium text-slate-600">Pass token (scan / paste)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-slate-300 rounded-lg p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cbit-maroon)]"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste scanned token"
                onKeyDown={(e) => e.key === "Enter" && scan()}
              />
              <button
                onClick={scan}
                className="bg-[var(--cbit-maroon)] text-white rounded-lg px-4 hover:bg-[var(--cbit-maroon-dark)]"
              >
                Scan
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {result && (
            <div className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-gold)] space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.student?.photoUrl}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-4 border-[var(--cbit-gold)]/30"
                />
                <div>
                  <div className="font-semibold text-lg">{result.student?.name}</div>
                  <div className="text-sm text-slate-500">
                    {result.student?.rollNo} &middot; {result.student?.branch}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div>Reason: {result.reason}</div>
                <div>
                  Date / time: {result.date} at {result.outTime}
                </div>
                <div>Mentor: {result.mentor?.name}</div>
                <div className="font-medium text-[var(--cbit-maroon)]">{STATUS_LABEL[result.status] ?? result.status}</div>
              </div>
              <p className="text-xs text-slate-400">
                Match this photo and roll number against the student&apos;s ID card before allowing exit.
              </p>

              {actionMsg && <p className="text-sm text-[var(--cbit-green)] font-medium">{actionMsg}</p>}

              {result.status === "APPROVED" && (
                <button
                  onClick={() => doAction("exit")}
                  className="w-full bg-[var(--cbit-green)] text-white rounded-lg py-2 font-medium hover:opacity-90"
                >
                  Photo &amp; ID match &mdash; Verify Exit
                </button>
              )}
              {result.status === "EXITED" && (
                <button
                  onClick={() => doAction("return")}
                  className="w-full bg-[var(--cbit-green)] text-white rounded-lg py-2 font-medium hover:opacity-90"
                >
                  Verify Return
                </button>
              )}
              {["RETURNED", "EXPIRED", "CANCELLED", "PENDING_MENTOR", "MENTOR_APPROVED", "MENTOR_REJECTED", "HOD_REJECTED"].includes(
                result.status
              ) && (
                <div className="text-center bg-slate-100 rounded-lg py-2 text-sm font-medium text-slate-600">
                  No gate action available for this status.
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl p-4 shadow">
            <button
              onClick={() => setShowOverride((s) => !s)}
              className="text-sm text-[var(--cbit-maroon)] font-medium hover:underline"
            >
              {showOverride ? "Hide manual override" : "No token available? Manual override"}
            </button>
            {showOverride && (
              <form onSubmit={submitOverride} className="mt-3 space-y-3">
                <p className="text-xs text-slate-400">
                  Use only when the student cannot show their token. This is logged with your action and reason.
                </p>
                <input
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  placeholder="Roll number"
                  value={ovRollNo}
                  onChange={(e) => setOvRollNo(e.target.value)}
                />
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={ovAction}
                  onChange={(e) => setOvAction(e.target.value as "exit" | "return")}
                >
                  <option value="exit">Record exit</option>
                  <option value="return">Record return</option>
                </select>
                <textarea
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  placeholder="Reason override was needed"
                  value={ovReason}
                  onChange={(e) => setOvReason(e.target.value)}
                />
                <button className="w-full bg-slate-700 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-800">
                  Submit override
                </button>
                {ovMsg && <p className="text-xs text-[var(--cbit-green)]">{ovMsg}</p>}
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="font-semibold mb-3 text-[var(--cbit-green)] text-sm">Recent verification history</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length === 0 && <p className="text-sm text-slate-400">No events yet.</p>}
              {history.map((e) => (
                <div key={e.id} className="text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{e.eventType.replace(/_/g, " ")}</span>
                    <span className={e.result === "DENIED" ? "text-red-500" : "text-slate-400"}>
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {e.studentName ? `${e.studentName} (${e.rollNo}) — ` : ""}
                    {e.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
