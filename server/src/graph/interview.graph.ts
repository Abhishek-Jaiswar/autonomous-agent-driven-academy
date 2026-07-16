import { StateGraph, START, END } from "@langchain/langgraph";
import { InterviewStateAnnotation } from "./state.js";
import { startNode } from "./nodes/start.node.js";
import { profileNode } from "./nodes/profile.node.js";
import { questionNode } from "./nodes/question.node.js";
import type { InterviewState } from "./state.js";
import { logger } from "../utils/logger.js";

// ─── Routing Functions ────────────────────────────────────────────────────────

/**
 * Directs the execution flow at the start of graph invocation.
 *
 * This router makes the graph multi-purpose:
 *  - status === "idle"   → Fresh interview starting
 *  - questionCount === 1 → Response to opener, extract candidate profile first
 *  - questionCount > 1   → Standard turn, generate adaptive question
 */
function routeEntry(state: InterviewState): "start" | "profile" | "question" {
  if (state.status === "idle") {
    logger.info("[graph] Routing entry to startNode (initial session start)");
    return "start";
  }

  if (state.questionCount === 1) {
    logger.info("[graph] Routing entry to profileNode (extract profile from first answer)");
    return "profile";
  }

  logger.info("[graph] Routing entry to questionNode (generate follow-up question)");
  return "question";
}

// ─── Graph Assembly ───────────────────────────────────────────────────────────

const workflow = new StateGraph(InterviewStateAnnotation)
  // ── Register Nodes ─────────────────────────────────────────────────────────
  .addNode("start", startNode)
  .addNode("profile", profileNode)
  .addNode("question", questionNode)

  // ── Wire Edges ─────────────────────────────────────────────────────────────
  // Entry router
  .addConditionalEdges(START, routeEntry)

  // Initialization path
  .addEdge("start", "question")

  // Turn processing paths
  .addEdge("profile", "question")
  .addEdge("question", END);

/**
 * Compiled interview graph — immutable after this point.
 */
export const interviewGraph = workflow.compile();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the compiled interview graph with the given state input.
 * Merges the input state with default values, runs all nodes in order,
 * and returns the final updated state.
 */
export async function runInterviewGraph(
  input: Partial<InterviewState>
): Promise<InterviewState> {
  const result = await interviewGraph.invoke(input);
  return result as InterviewState;
}
