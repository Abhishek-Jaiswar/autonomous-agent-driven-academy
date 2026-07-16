import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          boxShadow: "0 0 30px rgba(124,58,237,0.4)",
        }}
      >
        <BrainCircuit className="w-7 h-7 text-white" strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-2">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Interview not found
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          This session may have expired or never existed.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          color: "#fff",
          boxShadow: "0 0 20px rgba(124,58,237,0.3)",
        }}
      >
        Start a new interview
      </Link>
    </div>
  );
}
