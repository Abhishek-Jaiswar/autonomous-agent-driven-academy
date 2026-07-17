import { z } from "zod";
import { llm } from "../../llm/model.js";
import type { SchoolState, SchoolStateInput } from "../state.js";
import { logger } from "../../utils/logger.js";
import { counselorTurnPrompt } from "../../llm/prompts/counselor/counselor.prompt.js";

const signalSchema = z.object({
  label: z.string(),
  value: z.string(),
  confidence: z.number().int().min(0).max(100),
});

const counselorTurnSchema = z.object({
  assistantMessage: z.string(),
  currentStage: z.enum([
    "goal_clarity",
    "baseline",
    "constraints",
    "success_target",
    "review",
    "complete",
  ]),
  stageLabel: z.string(),
  confidence: z.number().int().min(0).max(100),
  extractedSignals: z.object({
    normalizedGoal: z.string().optional(),
    domain: z.string().optional(),
    targetOutcome: z.string().optional(),
    deliverable: z.string().optional(),
    timelinePressure: z.enum(["low", "medium", "high", "unknown"]).optional(),
    baselineHints: z.array(signalSchema),
    constraints: z.array(signalSchema),
    preferences: z.array(signalSchema),
  }),
  quickReplies: z.array(z.string()).min(0).max(4),
  isComplete: z.boolean(),
  completionReason: z.string().optional(),
});

/**
 * Counselor Node
 * 
 * Runs a staged diagnostic intake interview. Each turn updates the extracted learner
 * signals, chooses the next stage, and emits one focused counselor message.
 */
export async function counselorNode(state: SchoolState): Promise<SchoolStateInput> {
  logger.info(`[CounselorNode] Processing session [${state.goalId}] - Stage: ${state.counselorStage}`);

  const now = new Date().toISOString();

  const conversationWithLatest = [...state.conversation];
  if (state.lastUserResponse) {
    conversationWithLatest.push({
      role: "user",
      content: state.lastUserResponse,
      timestamp: now,
    });
  }

  const conversationText =
    conversationWithLatest.length > 0
      ? conversationWithLatest
          .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join("\n")
      : "No prior conversation. Start the intake with the first diagnostic question.";

  const structuredLlm = llm.withStructuredOutput(counselorTurnSchema);
  const formattedPrompt = await counselorTurnPrompt.format({
    goalText: state.goalText,
    category: state.category,
    durationDays: state.durationDays,
    currentStage: state.counselorStage,
    signalsJson: JSON.stringify(state.counselorSignals, null, 2),
    conversationText,
    lastUserResponse: state.lastUserResponse || "No answer yet. This is the first turn.",
  });

  const turn = await structuredLlm.invoke(formattedPrompt);
  const updatedConversation = [...conversationWithLatest];

  updatedConversation.push({
    role: "assistant",
    content: turn.assistantMessage,
    timestamp: now,
  });

  const questionHistory = [...state.counselorQuestions];
  if (!turn.isComplete && turn.assistantMessage) {
    questionHistory.push(turn.assistantMessage);
  }

  const answeredCount = updatedConversation.filter((msg) => msg.role === "user").length;
  logger.info(
    `[CounselorNode] Stage ${turn.currentStage}; confidence ${turn.confidence}; complete=${turn.isComplete}`
  );

  return {
    counselorQuestions: questionHistory,
    conversation: updatedConversation,
    currentQuestionIndex: answeredCount,
    counselorStage: turn.currentStage,
    counselorStageLabel: turn.stageLabel,
    counselorConfidence: turn.confidence,
    counselorSignals: turn.extractedSignals,
    counselorQuickReplies: turn.quickReplies,
    completionReason: turn.completionReason || "",
    isComplete: turn.isComplete,
  };
}
