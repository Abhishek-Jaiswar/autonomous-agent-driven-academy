import { z } from "zod";
import { llm } from "../../llm/model.js";
import type { SchoolState, SchoolStateInput } from "../state.js";
import { logger } from "../../utils/logger.js";
import { counselorIntakePrompt } from "../../llm/prompts/counselor/counselor.prompt.js";

// Zod schema for structured Gemini dynamic question generation
const questionGeneratorSchema = z.object({
  questions: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Exactly 3 to 5 targeted follow-up questions contextual to the goal"),
});

/**
 * Counselor Node
 * 
 * Manages the dynamic intake interview.
 * 1. If no questions are generated yet: Calls Gemini to create a list of 4 highly contextual
 *    questions customized for the learner's specific goal, timeline, and category.
 * 2. If questions exist: Registers the user's last response in the conversation log,
 *    and increments the question index to fetch the next question.
 * 3. If all questions are answered: Marks isComplete as true to route to the Profiler.
 */
export async function counselorNode(state: SchoolState): Promise<SchoolStateInput> {
  logger.info(`[CounselorNode] Processing session [${state.goalId}] - Index: ${state.currentQuestionIndex}`);

  const now = new Date().toISOString();
  
  // Turn 0: Generate the dynamic questions
  if (state.counselorQuestions.length === 0) {
    logger.info(`[CounselorNode] Generating dynamic questions for goal: "${state.goalText}"`);

    const structuredLlm = llm.withStructuredOutput(questionGeneratorSchema);
    
    const formattedPrompt = await counselorIntakePrompt.format({
      goalText: state.goalText,
      category: state.category,
      durationDays: state.durationDays,
    });

    const response = await structuredLlm.invoke(formattedPrompt);
    const questions = response.questions;

    logger.info(`[CounselorNode] Successfully generated ${questions.length} questions.`);

    // Return initial state with questions, setting index to 0
    return {
      counselorQuestions: questions,
      currentQuestionIndex: 0,
      conversation: [
        {
          role: "assistant",
          content: questions[0] || "",
          timestamp: now,
        },
      ],
      isComplete: false,
    };
  }

  // Subsequent turns: Log user's answer and advance
  const updatedConversation = [...state.conversation];
  
  if (state.lastUserResponse) {
    updatedConversation.push({
      role: "user",
      content: state.lastUserResponse,
      timestamp: now,
    });
  }

  const nextIndex = state.currentQuestionIndex + 1;

  if (nextIndex >= state.counselorQuestions.length) {
    logger.info(`[CounselorNode] Intake interview completed for session [${state.goalId}]`);
    return {
      conversation: updatedConversation,
      isComplete: true,
      currentQuestionIndex: nextIndex,
    };
  }

  const nextQuestion = state.counselorQuestions[nextIndex] || "";
  updatedConversation.push({
    role: "assistant",
    content: nextQuestion,
    timestamp: now,
  });

  logger.info(`[CounselorNode] Dispatching question #${nextIndex + 1}: "${nextQuestion}"`);

  return {
    conversation: updatedConversation,
    currentQuestionIndex: nextIndex,
    isComplete: false,
  };
}
