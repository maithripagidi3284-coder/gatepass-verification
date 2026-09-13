import Link from "next/link";
import { Header } from "@/components/Header";

const ROLES = [
  { role: "student", label: "Student", blurb: "Apply for a gate pass and track approvals" },
  { role: "mentor", label: "Mentor", blurb: "Review and approve student requests" },
  { role: "hod", label: "HOD", blurb: "Give final approval and issue the pass" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--cbit-maroon)]">College Gate Pass System</h1>
          <p className="text-slate-500 mt-2">Select your role to continue</p>
        </div>

        <div className="grid gap-4 w-full max-w-sm">
          {ROLES.map((r) => (
            <Link
              key={r.role}
              href={`/login?role=${r.role}`}
              className="bg-white rounded-xl p-4 shadow border-t-4 border-[var(--cbit-maroon)] hover:shadow-md transition flex flex-col"
            >
              <span className="font-semibold text-[var(--cbit-maroon)] text-lg">{r.label}</span>
              <span className="text-sm text-slate-500">{r.blurb}</span>
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center max-w-sm">
          Security personnel: gate verification is handled by the dedicated Security mobile app, not this website.
        </p>
      </main>
    </>
  );
}