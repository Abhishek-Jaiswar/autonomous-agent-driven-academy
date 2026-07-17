"use client";

import { useState, useRef, useEffect } from "react";
import type { InterviewState } from "@/lib/types";
import { InterviewSidebar } from "./InterviewSidebar";
import { MessageBubble } from "./MessageBubble";
import { AnswerInput } from "./AnswerInput";
import { BrainCircuit } from "lucide-react";
import { useSubmitAnswerMutation } from "@/store/api/counceler/councelerApi";

export interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface Props {
  interview: InterviewState;
}

export function InterviewRoom({ interview }: Props) {
  const [submitAnswerMutation] = useSubmitAnswerMutation();

  // Seed the conversation with the first question from the server
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "q-1",
      role: "assistant",
      content: interview.currentQuestion,
      timestamp: new Date(interview.startedAt),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(interview.questionCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Optimistic: show the user's message immediately
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const result = await submitAnswerMutation({
        interviewId: interview.interviewId,
        answer: trimmed,
      });

      if ("error" in result) {
        const err = result.error as any;
        setError(err.data?.error ?? "Something went wrong. Try again.");
        return;
      }

      const res = result.data;
      if (!res || !res.success) {
        setError("Something went wrong. Try again.");
        return;
      }

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: res.data.question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setQuestionCount(res.data.questionCount);
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <InterviewSidebar
        role={interview.role}
        startedAt={interview.startedAt}
        questionCount={questionCount}
        difficultyLevel={interview.difficultyLevel}
      />

      {/* ── Main chat area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h1
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {interview.role}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Technical Interview · Question {questionCount}
            </p>
          </div>

          {/* Live status */}
          <div className="flex items-center gap-2">
            <span
              className="pulse-dot w-2 h-2 rounded-full"
              style={{ background: "var(--status-live)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--status-live)" }}
            >
              In Progress
            </span>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLatest={i === messages.length - 1 && !loading}
            />
          ))}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          {/* Error banner */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm fade-up"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Answer input */}
        <AnswerInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 fade-up">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          boxShadow: "0 0 12px rgba(124,58,237,0.35)",
        }}
      >
        <BrainCircuit className="w-4 h-4 text-white" strokeWidth={1.5} />
      </div>
      {/* Bubble */}
      <div
        className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
        style={{ border: "1px solid var(--border-subtle)" }}
      >
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent-primary)" }}
        />
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent-primary)" }}
        />
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent-primary)" }}
        />
      </div>
    </div>
  );
}
