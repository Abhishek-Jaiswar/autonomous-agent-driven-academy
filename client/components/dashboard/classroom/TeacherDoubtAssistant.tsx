"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  Code,
  Target,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeacherDoubtAssistantProps {
  lessonTitle: string;
  isAnswering: boolean;
  onSendDoubt: (doubtText: string) => Promise<void>;
  doubtHistory: Array<{ doubt: string; answer: string; sources?: string[] }>;
  onClearHistory?: () => void;
}

export function TeacherDoubtAssistant({
  lessonTitle,
  isAnswering,
  onSendDoubt,
  doubtHistory,
  onClearHistory,
}: TeacherDoubtAssistantProps) {
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const quickPrompts = [
    { label: "Analogy", icon: <Lightbulb className="w-3 h-3 text-amber-500" />, prompt: "Explain this concept using a simple real-world analogy." },
    { label: "Code Example", icon: <Code className="w-3 h-3 text-indigo-500" />, prompt: "Show a practical code example for this lesson." },
    { label: "Exam Traps", icon: <Target className="w-3 h-3 text-emerald-500" />, prompt: "What are the key pitfalls or exam traps on this topic?" },
  ];

  async function handleSend(promptText?: string) {
    const textToSend = (promptText || input).trim();
    if (!textToSend || isAnswering) return;
    setInput("");
    await onSendDoubt(textToSend);
  }

  function handleCopyAnswer(answer: string, idx: number) {
    navigator.clipboard.writeText(answer);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-card-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Teacher Agent Doubt Assistant
          </CardTitle>
          <CardDescription className="text-xs">
            Ask doubts grounded strictly in your verified study materials (RAG Vector Search).
          </CardDescription>
        </div>
        {doubtHistory.length > 0 && onClearHistory && (
          <Button size="sm" variant="ghost" onClick={onClearHistory} className="text-xs h-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-muted-foreground mr-1">Quick Prompts:</span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip.prompt)}
              disabled={isAnswering}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-xs font-medium text-foreground transition-all cursor-pointer disabled:opacity-50"
            >
              {chip.icon}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          {doubtHistory.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-border rounded-xl bg-muted/20">
              <Sparkles className="w-8 h-8 text-primary/60 mx-auto animate-pulse" />
              <h4 className="text-xs font-bold text-card-foreground">Teacher Agent Standing By</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Have a question about <strong>"{lessonTitle}"</strong>? Type below or pick a quick prompt to get instant verified answers.
              </p>
            </div>
          ) : (
            doubtHistory.map((item, idx) => (
              <div key={idx} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary/15 border border-primary/20 text-card-foreground text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] font-medium">
                    {item.doubt}
                  </div>
                </div>

                {/* Teacher Assistant Response */}
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-card-foreground text-xs p-4 rounded-2xl rounded-tl-sm max-w-[92%] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-primary font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> Teacher Agent (RAG Verified):
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyAnswer(item.answer, idx)}
                        className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>

                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>

                    {item.sources && item.sources.length > 0 && (
                      <div className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 mt-2">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">Cited: {item.sources.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isAnswering && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs text-primary font-mono animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Teacher Agent querying Pinecone vector index & verified sources...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <input
            type="text"
            placeholder="Ask your doubt about this lesson..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isAnswering}
            className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isAnswering || !input.trim()}
            size="sm"
            className="rounded-xl px-4"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
