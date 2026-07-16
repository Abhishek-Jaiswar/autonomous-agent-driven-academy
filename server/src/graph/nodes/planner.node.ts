import type { InterviewState } from "../state.js";

/**
 * Planner Node — Phase 6 (Decision Engine)
 *
 * Responsibility (Single): Decide the next action after evaluating an answer.
 *
 * Decision logic (Phase 6 will implement):
 *   → Follow-up?    — candidate answer was vague or incomplete
 *   → New topic?    — current topic is sufficiently covered
 *   → Hard question? — candidate is strong, increase difficulty
 *   → End?          — all topics covered OR max questions reached
 *
 * Design principle: Use deterministic business logic as much as possible.
 * Ask the LLM ONLY when the decision genuinely requires reasoning.
 * This keeps costs low and behavior predictable.
 *
 * Will be wired as a conditional edge source in Phase 6.
 */
export async function plannerNode(
  _state: InterviewState
): Promise<Partial<InterviewState>> {
  // TODO: Phase 6 — Decision Engine
  // 1. Check if max question count reached (deterministic)
  // 2. Check if all pendingTopics are covered (deterministic)
  // 3. Evaluate answer confidence to decide follow-up (semi-deterministic)
  // 4. Update difficultyLevel if candidate is excelling (deterministic)
  throw new Error("[plannerNode] Not implemented — coming in Phase 6.");
}
