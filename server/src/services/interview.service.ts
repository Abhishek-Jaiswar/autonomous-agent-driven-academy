import { randomUUID } from "crypto";
import { runInterviewGraph } from "../graph/interview.graph.js";
import type { InterviewState } from "../graph/state.js";
import type {
  ConversationMessage,
  StartInterviewDto,
  StartInterviewResponse,
  SubmitAnswerDto,
} from "../types/interview.types.js";
import { logger } from "../utils/logger.js";

// ─── Phase 2 Question Pool ─────────────────────────────────────────────────────
//
// Hardcoded follow-up questions used until Phase 4 wires up the LLM question node.
// Questions are cycled in order so the interview has a natural progression.
//
// Phase 4 TODO: Replace this pool with a call to the LangGraph questionNode
// which uses Gemini to generate contextual next questions based on the
// candidate's previous answers and the evaluator's assessment.

const PHASE2_QUESTIONS = [
  "Tell me about a complex technical challenge you recently solved. What was your approach and what trade-offs did you make?",
  "How do you approach performance optimization? Walk me through a real example where you improved system performance.",
  "Describe your experience with system design. How would you design a scalable, highly-available API for 1 million users?",
  "How do you handle technical debt? What strategies do you use to manage it without blocking feature delivery?",
  "Tell me about a time you had to collaborate across teams or functions to ship something. What was hard and what did you learn?",
  "How do you ensure code quality on your team? What does your review process look like?",
  "Walk me through how you approach debugging a production issue with no obvious cause.",
  "Describe a situation where you disagreed with a technical decision made by your team. How did you handle it?",
  "What architectural patterns do you reach for most often and why? Give a concrete example.",
  "How do you stay current with the technology landscape? What have you learned in the last 6 months?",
];

// ─── Session Store ─────────────────────────────────────────────────────────────
//
// Phase 1: In-memory Map — fast, zero-dependency, but volatile.
//   ⚠️  State is lost on server restart.
//
// Phase 2+: Replace with:
//   - Redis for hot session state (fast reads during interview)
//   - PostgreSQL for cold storage (completed interviews, reports)
//
// The Map is intentionally module-scoped (not exported) so only this service
// can mutate it. All external access goes through the service functions below.

const sessionStore = new Map<string, InterviewState>();

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Starts a new interview session.
 *
 * Flow:
 *  1. Generate a collision-resistant UUID for the session
 *  2. Invoke the LangGraph with the initial seed state
 *  3. Persist the resulting state in the session store
 *  4. Return the minimal data the controller needs to respond
 */
export async function startInterview(
  dto: StartInterviewDto
): Promise<StartInterviewResponse> {
  const interviewId = randomUUID();

  logger.info(
    `[InterviewService] Starting session [${interviewId}] — role: "${dto.role}"`
  );

  const finalState = await runInterviewGraph({
    interviewId,
    role: dto.role,
  });

  // Persist full state — the controller only gets back what it needs
  sessionStore.set(interviewId, finalState);

  logger.info(
    `[InterviewService] Session [${interviewId}] ready — ${finalState.questionCount} question(s) generated`
  );

  return {
    interviewId: finalState.interviewId,
    role: finalState.role,
    question: finalState.currentQuestion,
    startedAt: finalState.startedAt,
  };
}

/**
 * Retrieves the full state snapshot for an existing interview.
 * Returns null when the session ID is not found.
 */
export function getInterview(interviewId: string): InterviewState | null {
  return sessionStore.get(interviewId) ?? null;
}

/**
 * Returns all active session IDs.
 * Useful for admin dashboards and debugging.
 */
export function listInterviews(): string[] {
  return [...sessionStore.keys()];
}

/**
 * Returns the count of active sessions.
 */
export function getSessionCount(): number {
  return sessionStore.size;
}

// ─── Phase 2: Answer Submission ────────────────────────────────────────────────

export interface SubmitAnswerResponse {
  interviewId: string;
  question: string;
  questionCount: number;
}

/**
 * Submits a candidate's answer and returns the next interview question.
 *
 * Phase 2 implementation:
 *  - Appends the answer to the conversation history
 *  - Selects the next question from the hardcoded pool (round-robin)
 *  - Updates the full session state atomically
 *
 * Phase 4 TODO:
 *  1. Run the answer through evaluatorNode → scores the response
 *  2. Run plannerNode → decides topic + difficulty for next question
 *  3. Run questionNode with LLM → generates a contextual next question
 *  4. Persist the enriched state (skillScores, coveredTopics, difficultyLevel)
 */
export async function submitAnswer(
  dto: SubmitAnswerDto
): Promise<SubmitAnswerResponse> {
  const session = sessionStore.get(dto.interviewId);

  if (!session) {
    throw Object.assign(new Error(`Interview session not found`), {
      status: 404,
    });
  }

  logger.info(
    `[InterviewService] Answer received for session [${dto.interviewId}] — running LangGraph workflow`
  );

  const now = new Date().toISOString();

  // Create state input with the new candidate response
  const stateInput: Partial<InterviewState> = {
    ...session,
    lastAnswer: dto.answer,
    conversation: [
      {
        role: "user",
        content: dto.answer,
        timestamp: now,
      },
    ],
  };

  // Run the LangGraph execution flow dynamically
  const finalState = await runInterviewGraph(stateInput);

  // Persist updated state
  sessionStore.set(dto.interviewId, finalState);

  logger.info(
    `[InterviewService] Session [${dto.interviewId}] updated — question #${finalState.questionCount} generated`
  );

  return {
    interviewId: finalState.interviewId,
    question: finalState.currentQuestion,
    questionCount: finalState.questionCount,
  };
}
