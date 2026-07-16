import { z } from "zod";
import { llm } from "../../llm/model.js";
import { emitToSession } from "../../config/socket.js";
import { queueCurriculumGeneration } from "../../config/queue.js";
import type { SchoolState, SchoolStateInput } from "../state.js";
import { logger } from "../../utils/logger.js";
import { profilerSynthesisPrompt } from "../../llm/prompts/profiler/profiler.prompt.js";
import { profileService } from "../../modules/profile/profile.service.js";

// Zod schema for structured Gemini profiling synthesis
const profileSynthesisSchema = z.object({
  skillBaseline: z
    .record(z.string(), z.string())
    .describe("Mapping of key technologies/concepts to user experience levels"),
  learningStyle: z
    .enum(["visual", "practical", "text", "balanced"])
    .describe("Synthesized learning style preference"),
  weakAreas: z
    .array(z.string())
    .describe("Key concepts the user has identified as weak or lacks background in"),
});

/**
 * Profiler Node
 * 
 * Synthesizes the interview dialog into a structured profile.
 * 1. Formats the full Q&A chat history.
 * 2. Invokes Gemini to compile baseline skills, learning style, and weak areas.
 * 3. Saves the profile to PostgreSQL.
 * 4. Queues a background BullMQ job to architect the curriculum.
 * 5. Notifies the frontend via Socket.io.
 */
export async function profilerNode(state: SchoolState): Promise<SchoolStateInput> {
  logger.info(`[ProfilerNode] Compiling profile for session [${state.goalId}]`);

  const chatHistoryText = state.conversation
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const structuredLlm = llm.withStructuredOutput(profileSynthesisSchema);

  const formattedPrompt = await profilerSynthesisPrompt.format({
    chatHistoryText,
    goalText: state.goalText,
    category: state.category,
    durationDays: state.durationDays,
  });

  const profileData = await structuredLlm.invoke(formattedPrompt);

  logger.info(`[ProfilerNode] Profile synthesized successfully. Style: ${profileData.learningStyle}, Weak Areas: ${profileData.weakAreas.join(", ")}`);

  // Write profile and log to database via service
  await profileService.saveProfileSynthesis(
    state.goalId,
    profileData.skillBaseline,
    profileData.learningStyle,
    profileData.weakAreas
  );

  // Emit WebSocket events to the session room
  emitToSession(state.goalId, "agent-log", {
    agentName: "Profiler",
    message: "Profile compiled successfully! Librarian Agent starting resource discovery...",
    level: "INFO",
  });

  emitToSession(state.goalId, "profile-ready", {
    goalId: state.goalId,
    skillBaseline: profileData.skillBaseline,
    learningStyle: profileData.learningStyle,
    weakAreas: profileData.weakAreas,
  });

  // Queue background curriculum generation job in Redis/BullMQ
  await queueCurriculumGeneration(state.goalId);

  // Return the compiled profile state
  return {
    profile: {
      goalId: state.goalId,
      category: state.category,
      durationDays: state.durationDays,
      goalText: state.goalText,
      skillBaseline: profileData.skillBaseline as Record<string, string>,
      learningStyle: profileData.learningStyle,
      weakAreas: profileData.weakAreas,
    },
  };
}
