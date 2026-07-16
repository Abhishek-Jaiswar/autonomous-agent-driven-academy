import type { InterviewState } from "../state.js";
import { logger } from "../../utils/logger.js";

/**
 * Start Node — Phase 1
 *
 * Responsibility (Single): Initialize the interview session lifecycle.
 *
 * What it does:
 *   - Marks the interview as "running"
 *   - Records when the interview started
 *
 * What it does NOT do:
 *   - Does not generate questions (→ questionNode)
 *   - Does not extract candidate profile (→ Phase 3: profileNode)
 *   - Does not validate the candidate (→ future)
 *
 * The interviewId and role are already set in the initial state by the service
 * before invoking the graph, so this node only sets lifecycle fields.
 */
export async function startNode(
  state: InterviewState
): Promise<Partial<InterviewState>> {
  logger.info(
    `[startNode] Initializing interview [${state.interviewId}] — role: "${state.role}"`
  );

  return {
    status: "running",
    startedAt: new Date().toISOString(),
  };
}
