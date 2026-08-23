import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--cbit-maroon)]">College Gate Pass System</h1>
          <p className="text-slate-500 mt-2">Sign in with your college account to continue</p>
        </div>
        <Link
          href="/login"
          className="bg-[var(--cbit-maroon)] text-white rounded-xl px-8 py-3 font-medium hover:bg-[var(--cbit-maroon-dark)] transition"
        >
          Sign in
        </Link>
      </main>
    </>
  );
}
