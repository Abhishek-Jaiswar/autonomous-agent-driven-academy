"use client";

import type {
  ConversationMessage,
  CounselorSignals,
  CounselorStage,
} from "@/lib/types";
import { CounselorChatPanel } from "./counselor/CounselorChatPanel";
import { CounselorSignalPanel } from "./counselor/CounselorSignalPanel";
import { CounselorStageRail } from "./counselor/CounselorStageRail";

interface CounselorInterviewProps {
  conversation: ConversationMessage[];
  currentStage: CounselorStage;
  stageLabel: string;
  confidence: number;
  extractedSignals: CounselorSignals;
  quickReplies: string[];
  onSubmitAnswer: (answer: string) => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onReset: () => void;
}

export function CounselorInterview({
  conversation,
  currentStage,
  stageLabel,
  confidence,
  extractedSignals,
  quickReplies,
  onSubmitAnswer,
  isSubmitting,
  errorMessage,
  onRetry,
  onReset,
}: CounselorInterviewProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="space-y-3">
        <div>
          <h1 className="text-lg font-bold">Intake Flow</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The counselor adapts each turn until the learner model is ready.
          </p>
        </div>
        <CounselorStageRail currentStage={currentStage} />
      </aside>

      <CounselorChatPanel
        conversation={conversation}
        quickReplies={quickReplies}
        stageLabel={stageLabel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmitAnswer={onSubmitAnswer}
        onRetry={onRetry}
        onReset={onReset}
      />

      <CounselorSignalPanel
        signals={extractedSignals}
        confidence={confidence}
      />
    </div>
  );
}
