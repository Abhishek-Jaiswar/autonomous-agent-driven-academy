"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Clock, Hash, Zap } from "lucide-react";

interface Props {
  role: string;
  startedAt: string;
  questionCount: number;
  difficultyLevel: string;
}

function useElapsed(startedAt: string) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

export function InterviewSidebar({
  role,
  startedAt,
  questionCount,
  difficultyLevel,
}: Props) {
  const elapsed = useElapsed(startedAt);
  const diffColor = DIFFICULTY_COLOR[difficultyLevel] ?? "#9898b8";

  return (
    <aside
      className="flex flex-col flex-shrink-0 w-64 h-full"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Brand */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              boxShadow: "0 0 16px rgba(124,58,237,0.4)",
            }}
          >
            <BrainCircuit className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              AI Interviewer
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Adaptive Mode
            </p>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Position
        </p>
        <p
          className="text-sm font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {role}
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 space-y-4">
        {/* Timer */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-soft)" }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Elapsed
            </p>
            <p
              className="text-sm font-mono font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {elapsed}
            </p>
          </div>
        </div>

        {/* Question # */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-soft)" }}
          >
            <Hash className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Questions asked
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {questionCount}
            </p>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-soft)" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Difficulty
            </p>
            <p
              className="text-sm font-medium capitalize"
              style={{ color: diffColor }}
            >
              {difficultyLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-auto px-5 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <span
            className="pulse-dot w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "var(--status-live)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Interview in progress
          </span>
        </div>
      </div>
    </aside>
  );
}
