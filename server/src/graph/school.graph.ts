import { StateGraph, START, END } from "@langchain/langgraph";
import { SchoolStateAnnotation, type SchoolState, type SchoolStateInput } from "./state.js";
import { counselorNode } from "./nodes/counselor.node.js";
import { profilerNode } from "./nodes/profiler.node.js";
import { logger } from "../utils/logger.js";

// ─── Routing Functions ────────────────────────────────────────────────────────

/**
 * Directs the initial entry flow.
 * - If the profile is already complete, route directly to the profiler (or END).
 * - Otherwise, route to the counselor Q&A handler.
 */
function routeEntry(state: SchoolState): "counselor" | "profiler" {
  if (state.isComplete) {
    logger.info("[graph] Routing entry to profilerNode");
    return "profiler";
  }
  return "counselor";
}

/**
 * Directs the flow after Counselor execution.
 * - If Counselor has marked isComplete as true, flow immediately into the Profiler.
 * - Otherwise, terminate the graph run and await the next user response.
 */
function routeAfterCounselor(state: SchoolState): "profiler" | typeof END {
  if (state.isComplete) {
    logger.info("[graph] Counselor complete. Flowing immediately to profilerNode.");
    return "profiler";
  }
  return END;
}

// ─── Graph Assembly ───────────────────────────────────────────────────────────

const workflow = new StateGraph(SchoolStateAnnotation)
  // 1. Register Nodes
  .addNode("counselor", counselorNode)
  .addNode("profiler", profilerNode)

  // 2. Register Edges
  // Entry router
  .addConditionalEdges(START, routeEntry)
  
  // Counselor routing (check completion)
  .addConditionalEdges("counselor", routeAfterCounselor)

  // Profiler exits to the end
  .addEdge("profiler", END);

/**
 * Compiled school graph - immutable after compilation.
 */
export const schoolGraph = workflow.compile();

/**
 * Runs the compiled school graph with the given state input.
 */
export async function runSchoolGraph(input: SchoolStateInput): Promise<SchoolState> {
  logger.info(`[SchoolGraph] Invoking graph for goalId: ${input.goalId}`);
  const result = await schoolGraph.invoke(input);
  return result as SchoolState;
}
