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
  onReset,
}: CounselorInterviewProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="space-y-3">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Intake Flow</h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
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
        onSubmitAnswer={onSubmitAnswer}
        onReset={onReset}
      />

      <CounselorSignalPanel
        signals={extractedSignals}
        confidence={confidence}
      />
    </div>
  );
}
