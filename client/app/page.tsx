"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, ArrowRight, Loader2, Zap, Target, BarChart3 } from "lucide-react";
import { startInterview } from "@/lib/api";

const ROLE_SUGGESTIONS = [
  "Senior React Developer",
  "Backend Node.js Engineer",
  "Full Stack Engineer",
  "DevOps / Cloud Engineer",
  "Machine Learning Engineer",
  "Product Manager",
];

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) {
      setError("Please enter the role you're interviewing for.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await startInterview(role.trim(), intro.trim() || undefined);

      if (!res.success) {
        setError(res.error ?? "Failed to start interview. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/interview/${res.data.interviewId}`);
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-16"
      style={{ background: "var(--bg-base)" }}>

      {/* ── Ambient background blobs ─────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #5b21b6 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 60%)", filter: "blur(40px)" }} />
      </div>

      {/* ── Hero content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-lg fade-up">

        {/* Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)", boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}>
            <BrainCircuit className="w-8 h-8" style={{ color: "#fff" }} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            AI Interviewer
          </h1>
          <p className="text-base leading-relaxed max-w-sm"
            style={{ color: "var(--text-secondary)" }}>
            An adaptive technical interviewer that generates questions based on your answers —
            never the same interview twice.
          </p>
        </div>

        {/* Form card */}
        <form
          id="start-interview-form"
          onSubmit={handleStart}
          className="glass rounded-2xl p-7 space-y-5"
          style={{ border: "1px solid var(--border-subtle)" }}>

          {/* Role field */}
          <div className="space-y-2">
            <label htmlFor="role-input" className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}>
              Role you&apos;re interviewing for *
            </label>
            <input
              id="role-input"
              ref={inputRef}
              type="text"
              value={role}
              onChange={(e) => { setRole(e.target.value); setError(""); }}
              placeholder="e.g. Senior React Developer"
              className="w-full rounded-xl px-4 py-3 text-sm transition-all focus-ring"
              style={{
                background: "var(--bg-elevated)",
                border: `1px solid ${error ? "#ef4444" : "var(--border-subtle)"}`,
                color: "var(--text-primary)",
                outline: "none",
              }}
              disabled={loading}
              autoComplete="off"
              maxLength={150}
            />
            {/* Quick-pick suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ROLE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRole(s)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer"
                  style={{
                    background: role === s ? "var(--accent-soft)" : "var(--bg-hover)",
                    border: `1px solid ${role === s ? "var(--border-strong)" : "transparent"}`,
                    color: role === s ? "#a78bfa" : "var(--text-muted)",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Optional intro */}
          <div className="space-y-2">
            <label htmlFor="intro-input" className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}>
              Brief intro{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="intro-input"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Share a bit about your background, experience or recent projects..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all focus-ring"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              disabled={loading}
              maxLength={2000}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="start-interview-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: loading ? "var(--accent-secondary)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: "#fff",
              boxShadow: loading ? "none" : "0 0 24px rgba(124,58,237,0.4)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
            }}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Starting interview...</>
            ) : (
              <>Begin Interview <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Feature chips */}
        <div className="flex justify-center gap-6 mt-8 flex-wrap">
          {[
            { icon: Zap, label: "Adaptive Questions" },
            { icon: Target, label: "Answer Evaluation" },
            { icon: BarChart3, label: "Detailed Report" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
