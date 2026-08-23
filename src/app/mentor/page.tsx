"use client";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  photoUrl: string;
  parentPhone: string;
  branch: string;
}
interface Pass {
  id: string;
  status: string;
  reason: string;
  date: string;
  outTime: string;
  student?: Student;
  createdAt: number;
}

export default function MentorPage() {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pass[]>([]);
  const [history, setHistory] = useState<Pass[]>([]);
  const [popupPass, setPopupPass] = useState<Pass | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMentorId(data.linkedId ?? null));
  }, []);

  useEffect(() => {
    if (!mentorId) return;
    const load = async () => {
      const pend: Pass[] = await fetch(`/api/gatepass?status=PENDING_MENTOR`).then((r) => r.json());
      setPending(pend);

      const newOne = pend.find((p) => !seenIds.current.has(p.id));
      if (newOne) {
        setPopupPass((current) => current ?? newOne);
      }
      pend.forEach((p) => seenIds.current.add(p.id));

      const hist: Pass[] = await fetch(`/api/gatepass`).then((r) => r.json());
      setHistory(hist.filter((p) => p.status !== "PENDING_MENTOR"));
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [mentorId]);

  async function act(id: string, action: "mentor-approve" | "mentor-reject") {
    await fetch(`/api/gatepass/${id}/${action}`, { method: "POST" });
    setPopupPass(null);
    setPending((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <Header roleLabel="Mentor" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Mentor Dashboard</h1>

          {!mentorId && <p className="text-sm text-slate-400">Loading…</p>}

          {mentorId && (
            <>
              <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-3">Pending requests ({pending.length})</h2>
                {pending.length === 0 && <p className="text-sm text-slate-400">No pending requests.</p>}
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                      onClick={() => setPopupPass(p)}
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.student?.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-medium">
                            {p.student?.name} &middot; {p.student?.rollNo}
                          </div>
                          <div className="text-xs text-slate-400">{p.reason}</div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-[var(--cbit-gold)]/20 text-[var(--cbit-maroon)] font-medium">Review</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="font-semibold mb-3">History</h2>
                <div className="space-y-2">
                  {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
                  {history.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div className="text-sm">
                        {p.student?.name} &middot; {p.reason}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {popupPass && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-semibold">New gate pass request</div>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={popupPass.student?.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold">{popupPass.student?.name}</div>
                    <div className="text-sm text-slate-500">
                      {popupPass.student?.rollNo} &middot; {popupPass.student?.branch}
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-slate-500">Reason:</span> {popupPass.reason}
                  </div>
                  <div>
                    <span className="text-slate-500">Date / time:</span> {popupPass.date} at {popupPass.outTime}
                  </div>
                  <div>
                    <span className="text-slate-500">Parent phone:</span> {popupPass.student?.parentPhone}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Call the parent to confirm before approving.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(popupPass.id, "mentor-reject")}
                    className="flex-1 border border-red-300 text-red-600 rounded-lg py-2 font-medium hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => act(popupPass.id, "mentor-approve")}
                    className="flex-1 bg-[var(--cbit-maroon)] text-white rounded-lg py-2 font-medium hover:bg-[var(--cbit-maroon-dark)]"
                  >
                    Confirm &amp; Approve
                  </button>
                </div>
                <button onClick={() => setPopupPass(null)} className="w-full text-xs text-slate-400 hover:underline">
                  Review later
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
