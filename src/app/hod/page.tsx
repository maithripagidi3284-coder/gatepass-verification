"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  photoUrl: string;
  branch: string;
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
  student?: Student;
  mentor?: Mentor;
  createdAt: number;
}

export default function HodPage() {
  const [pending, setPending] = useState<Pass[]>([]);
  const [history, setHistory] = useState<Pass[]>([]);

  useEffect(() => {
    const load = async () => {
      const all: Pass[] = await fetch("/api/gatepass").then((r) => r.json());
      setPending(all.filter((p) => p.status === "MENTOR_APPROVED"));
      setHistory(all.filter((p) => ["APPROVED", "HOD_REJECTED", "EXITED", "RETURNED", "EXPIRED", "CANCELLED"].includes(p.status)));
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  async function act(id: string, action: "hod-approve" | "hod-reject") {
    await fetch(`/api/gatepass/${id}/${action}`, { method: "POST" });
    setPending((p) => p.filter((x) => x.id !== id));
  }

  return (
    <>
      <Header roleLabel="HOD" />
      <main className="flex-1 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">HOD Dashboard</h1>
        <div className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)]">
          <h2 className="font-semibold mb-3 text-[var(--cbit-green)]">Awaiting final stamp ({pending.length})</h2>
          {pending.length === 0 && <p className="text-sm text-slate-400">Nothing pending.</p>}
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.student?.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-medium">
                      {p.student?.name} &middot; {p.student?.rollNo}
                    </div>
                    <div className="text-xs text-slate-400">Mentor: {p.mentor?.name} &middot; approved</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  {p.reason} &mdash; {p.date} at {p.outTime}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(p.id, "hod-reject")}
                    className="flex-1 border border-red-300 text-red-600 rounded-lg py-1.5 text-sm hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => act(p.id, "hod-approve")}
                    className="flex-1 bg-[var(--cbit-gold)] text-white rounded-lg py-1.5 text-sm font-medium hover:opacity-90"
                  >
                    Stamp &amp; Approve
                  </button>
                </div>
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
      </div>
      </main>
    </>
  );
}
