"use client";

import { BrainCircuit, User } from "lucide-react";
import type { Message } from "./InterviewRoom";

interface Props {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: Props) {
  const isAI = message.role === "assistant";

  return (
    <div className={`flex items-start gap-3 fade-up ${isAI ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
        style={{
          background: isAI
            ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
            : "var(--bg-hover)",
          boxShadow: isAI ? "0 0 12px rgba(124, 58, 237, 0.35)" : "none",
          border: isAI ? "none" : "1px solid var(--border-subtle)",
        }}
      >
        {isAI ? (
          <BrainCircuit className="w-4 h-4 text-white" strokeWidth={1.5} />
        ) : (
          <User className="w-4 h-4 text-white" strokeWidth={1.5} />
        )}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[70%] space-y-1 ${!isAI ? "text-right" : ""}`}>
        {/* Name and time */}
        <div className="flex items-center gap-2 text-xs px-1" style={{ color: "var(--text-muted)", justifyContent: isAI ? "flex-start" : "flex-end" }}>
          <span className="font-medium" style={{ color: isAI ? "var(--text-primary)" : "var(--text-secondary)" }}>
            {isAI ? "Interviewer" : "You"}
          </span>
          <span>•</span>
          <span>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed text-left`}
          style={{
            background: isAI ? "var(--bg-surface)" : "var(--bg-elevated)",
            border: `1px solid ${isAI ? "var(--border-subtle)" : "var(--border-strong)"}`,
            color: "var(--text-primary)",
            boxShadow: isLatest && isAI ? "0 0 16px var(--accent-soft)" : "none",
            borderRadius: isAI ? "16px 16px 16px 2px" : "16px 16px 2px 16px",
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
