"use client";

import { Send, CornerDownLeft } from "lucide-react";
import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function AnswerInput({ value, onChange, onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize height as candidate types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div
      className="p-6 flex-shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="relative flex items-end rounded-xl px-4 py-3 gap-3 transition-all"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Processing..." : "Type your response here..."}
          disabled={disabled}
          rows={1}
          className="flex-1 text-sm bg-transparent outline-none resize-none pr-10 max-h-[180px] leading-relaxed"
          style={{
            color: "var(--text-primary)",
          }}
        />

        {/* Action Panel */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden md:flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            Press Enter <CornerDownLeft className="w-3 h-3" />
          </span>
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: !value.trim() || disabled ? "var(--bg-hover)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: !value.trim() || disabled ? "var(--text-muted)" : "#fff",
              opacity: !value.trim() || disabled ? 0.5 : 1,
              boxShadow: !value.trim() || disabled ? "none" : "0 0 12px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
