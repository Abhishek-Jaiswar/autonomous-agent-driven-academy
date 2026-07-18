"use client";

import { useState } from "react";
import { ArrowRight, BrainCircuit, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ConversationMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CounselorChatPanelProps {
  conversation: ConversationMessage[];
  quickReplies: string[];
  stageLabel: string;
  isSubmitting: boolean;
  onSubmitAnswer: (answer: string) => void;
  onReset: () => void;
}

export function CounselorChatPanel({
  conversation,
  quickReplies,
  stageLabel,
  isSubmitting,
  onSubmitAnswer,
  onReset,
}: CounselorChatPanelProps) {
  const [answer, setAnswer] = useState("");

  function submit() {
    const trimmed = answer.trim();
    if (!trimmed || isSubmitting) return;
    onSubmitAnswer(trimmed);
    setAnswer("");
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <Badge className="text-[9px] ">{stageLabel}</Badge>
          <CardTitle className="mt-2 flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4" />
            Counselor Interview
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 p-4 relative">
        <div className="max-h-107.5 space-y-3 overflow-y-auto pr-1">
          {conversation.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={cn(
                "rounded-lg border p-3",
                message.role === "assistant"
                  ? "mr-8 border-secondary-foreground"
                  : "ml-8 border-primary bg-secondary",
              )}
            >
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {message.role === "assistant" ? "Counselor Agent" : "You"}
                {/* <Badge>{message.timestamp}</Badge> */}
              </div>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          ))}
          {isSubmitting && (
            <div className="mr-8 rounded-lg border bg-primary p-3 text-sm text-slate-400">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-violet-400" />
              Thinking through your intake signals...
            </div>
          )}
        </div>

        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => setAnswer(reply)}
                className="rounded-md border border-primary/40 bg-primary-30 px-3 py-1.5 text-xs  transition-colors hover:border-primary/50 hover:text-primary"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            disabled={isSubmitting}
            placeholder="Answer in your own words..."
          />
          <Button
            onClick={submit}
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
