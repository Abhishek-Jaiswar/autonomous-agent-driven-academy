import type { InterviewState } from "./state.js";

/**
 * Edge Routing Functions
 *
 * Conditional edge functions determine WHICH node to visit next based
 * on the current graph state. They are the "if/else" of the state machine.
 *
 * Phase 1: No conditional routing — all edges are static (.addEdge).
 * Phase 6: shouldContinue() will be wired as a conditional edge from plannerNode.
 *
 * Return values MUST match the node names registered in the graph via .addNode().
 * A mismatch will throw at runtime, not compile time — name carefully.
 */

/**
 * shouldContinue — Phase 6 Conditional Edge
 *
 * Called after plannerNode to decide the next step.
 * Returns:
 *   "question" → route to questionNode (ask another question)
 *   "finish"   → route to finishNode (end the interview)
 *
 * Current Phase 1 logic: always routes to "question".
 * Phase 6 will expand this with full decision logic.
 */
export function shouldContinue(
  state: InterviewState
): "question" | "finish" {
  // ── Deterministic exit conditions (implement fully in Phase 6) ─────────────

  // If the interview is already marked completed, go to finish
  if (state.status === "completed") {
    return "finish";
  }

  // Safety cap: never exceed 15 questions (tunable)
  if (state.questionCount >= 15) {
    return "finish";
  }

  // All pending topics exhausted
  if (state.pendingTopics.length === 0 && state.questionCount > 3) {
    return "finish";
  }

  // Default: keep asking questions
  return "question";
}
