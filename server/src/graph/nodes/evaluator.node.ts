import type { InterviewState } from "../state.js";

/**
 * Evaluator Node — Phase 5 (Answer Evaluation)
 *
 * Responsibility (Single): Evaluate the candidate's last answer.
 *
 * Will return structured evaluation data via LLM + Zod parser:
 *   - score (0–10): how well the answer addressed the question
 *   - confidence (0–1): how certain the AI is about its score
 *   - strengths: what the candidate demonstrated well
 *   - weaknesses: gaps or inaccuracies identified
 *   - missingConcepts: key concepts not mentioned
 *   - evidence: direct quotes from the answer supporting the score
 *
 * Updates:
 *   - state.skillScores (merged via shallow-merge reducer)
 *   - state.coveredTopics (appended via dedup-union reducer)
 *
 * Will be wired after each candidate answer submission in Phase 5.
 */
export async function evaluatorNode(
  _state: InterviewState
): Promise<Partial<InterviewState>> {
  // TODO: Phase 5 — Answer Evaluation
  // 1. Build evaluation prompt from state.currentQuestion + state.lastAnswer
  // 2. Call llm.withStructuredOutput(AnswerEvaluationSchema)
  // 3. Update skillScores and coveredTopics
  throw new Error("[evaluatorNode] Not implemented — coming in Phase 5.");
}
