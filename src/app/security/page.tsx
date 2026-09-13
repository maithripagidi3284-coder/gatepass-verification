import Link from "next/link";
import { Header } from "@/components/Header";

export default function SecurityMovedPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--cbit-maroon)]">Security verification has moved</h1>
        <p className="text-slate-500 max-w-md">
          Gate pass scanning and verification for Security staff is now handled by the dedicated Security
          mobile app, not this website. Please use the mobile app to scan and verify passes at the gate.
        </p>
        <Link href="/" className="text-[var(--cbit-maroon)] font-medium hover:underline">
          Back to home
        </Link>
      </main>
    </>
  );
}