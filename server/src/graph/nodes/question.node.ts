import type { InterviewState } from "../state.js";
import { llm } from "../../llm/model.js";
import { PROMPTS } from "../../llm/prompts/index.js";
import { logger } from "../../utils/logger.js";
import type { ConversationMessage } from "../../types/interview.types.js";

/**
 * Helper to serialize conversation messages into a readable chat transcript
 * for the LLM prompt.
 */
function formatHistory(messages: ConversationMessage[]): string {
  if (messages.length === 0) return "No history yet.";

  return messages
    .map((msg) => {
      const label = msg.role === "assistant" ? "Interviewer" : "Candidate";
      return `${label}: ${msg.content}`;
    })
    .join("\n\n");
}

/**
 * Question Node — Phase 4 (Adaptive Question Generator)
 *
 * Responsibility: Generate the next technical question based on:
 *   - The position role
 *   - Candidate profile (skills, technologies, claims)
 *   - Complete conversation transcript
 *   - Target difficulty level
 *
 * Appends the new assistant message to the state.
 */
export async function questionNode(
  state: InterviewState,
): Promise<Partial<InterviewState>> {
  const newCount = state.questionCount + 1;

  logger.info(
    `[questionNode] Generating question #${newCount} for interview [${state.interviewId}]`,
  );

  // Opening prompt case
  if (state.conversation.length === 0) {
    const openingQuestion =
      `To get us started, could you walk me through your background — ` +
      `the projects you've worked on recently, the technologies you're ` +
      `most comfortable with, and what excites you about the ${state.role} role?`;

    logger.info(
      `[questionNode] First turn — using opener question for [${state.interviewId}]`,
    );

    return {
      currentQuestion: openingQuestion,
      questionCount: newCount,
      conversation: [
        {
          role: "assistant",
          content: openingQuestion,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  // Format candidate profile details
  const profile = state.candidateProfile;
  const skillsStr =
    profile.skills.length > 0
      ? profile.skills.join(", ")
      : "None extracted yet";
  const techStr =
    profile.technologies.length > 0
      ? profile.technologies.join(", ")
      : "None extracted yet";
  const claimsStr =
    profile.claims.length > 0
      ? profile.claims.join("; ")
      : "None extracted yet";

  // Format conversation history
  const historyStr = formatHistory(state.conversation);

  // Format prompt template messages
  const formattedPrompt = await PROMPTS.questionGeneration.formatMessages({
    role: state.role,
    skills: skillsStr,
    technologies: techStr,
    claims: claimsStr,
    difficulty: state.difficultyLevel,
    questionCount: newCount.toString(),
    history: historyStr,
  });

  try {
    // Generate next question via Gemini
    const response = await llm.invoke(formattedPrompt);
    const questionText = response.content as string;

    logger.info(
      `[questionNode] Adaptive question #${newCount} generated successfully`,
    );

    return {
      currentQuestion: questionText,
      questionCount: newCount,
      conversation: [
        {
          role: "assistant",
          content: questionText,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  } catch (error: any) {
    logger.error(
      `[questionNode] Failed to generate adaptive question: ${error.message}`,
      error.stack,
    );

    // Fallback: ask a generic question from the pool so the interview keeps running
    const fallbackQuestion =
      "Could you tell me how you handle testing and test coverage in your applications?";
    return {
      currentQuestion: fallbackQuestion,
      questionCount: newCount,
      conversation: [
        {
          role: "assistant",
          content: fallbackQuestion,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
