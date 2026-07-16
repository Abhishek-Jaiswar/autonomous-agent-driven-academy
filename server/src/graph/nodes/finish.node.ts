import type { InterviewState } from "../state.js";
import { logger } from "../../utils/logger.js";

/**
 * Finish Node — Phase 7 (Final Report)
 *
 * Responsibility (Single): Generate the comprehensive interview report.
 *
 * Will produce via LLM + Zod parser:
 *   - overallScore (0–10)
 *   - skillScoreSummary: per-skill breakdown
 *   - strengths: top 3–5 demonstrated strengths with evidence
 *   - weaknesses: top 3–5 gaps with evidence
 *   - hiringRecommendation: "strong yes" | "yes" | "maybe" | "no"
 *   - learningRoadmap: suggested topics for the candidate to improve
 *
 * Phase 1: Only closes the session (sets status + completedAt).
 * Phase 7: Will call LLM to generate the full structured report.
 */
export async function finishNode(
  state: InterviewState
): Promise<Partial<InterviewState>> {
  logger.info(
    `[finishNode] Closing interview [${state.interviewId}] after ${state.questionCount} question(s)`
  );

  // TODO: Phase 7 — replace with full LLM report generation
  return {
    status: "completed",
    completedAt: new Date().toISOString(),
  };
}
