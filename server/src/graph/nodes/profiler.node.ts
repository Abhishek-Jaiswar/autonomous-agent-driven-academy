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
  learnerSummary: z.string().describe("Concise internal learner summary for downstream agents"),
  normalizedGoal: z.object({
    title: z.string(),
    category: z.string(),
    targetOutcome: z.string(),
    deliverable: z.string().optional(),
    durationDays: z.number().int().min(1),
  }),
  skillBaseline: z
    .record(z.string(), z.string())
    .describe("Mapping of key technologies/concepts to user experience levels"),
  preferences: z.object({
    learningStyle: z
      .enum(["visual", "practical", "text", "balanced"])
      .describe("Synthesized learning style preference"),
    dailyTimeCommitment: z.string().optional(),
    assessmentMode: z.enum(["quiz", "project", "mixed"]),
  }),
  weakAreas: z
    .array(z.string())
    .describe("Key concepts the user has identified as weak or lacks background in"),
  risks: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      note: z.string(),
    })
  ),
  agentDirectives: z.object({
    librarian: z.array(z.string()),
    curriculumArchitect: z.array(z.string()),
    teacher: z.array(z.string()),
    examiner: z.array(z.string()),
  }),
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

  logger.info(`[ProfilerNode] Profile synthesized successfully. Style: ${profileData.preferences.learningStyle}, Weak Areas: ${profileData.weakAreas.join(", ")}`);

  // Write profile and log to database via service
  await profileService.saveProfileSynthesis(
    state.goalId,
    profileData.learnerSummary,
    profileData.normalizedGoal,
    profileData.skillBaseline,
    profileData.preferences,
    profileData.weakAreas,
    profileData.risks,
    profileData.agentDirectives
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
    learningStyle: profileData.preferences.learningStyle,
    preferences: profileData.preferences,
    weakAreas: profileData.weakAreas,
    risks: profileData.risks,
    normalizedGoal: profileData.normalizedGoal,
    agentDirectives: profileData.agentDirectives,
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
      learnerSummary: profileData.learnerSummary,
      normalizedGoal: profileData.normalizedGoal,
      skillBaseline: profileData.skillBaseline as Record<string, string>,
      preferences: profileData.preferences,
      learningStyle: profileData.preferences.learningStyle,
      weakAreas: profileData.weakAreas,
      risks: profileData.risks,
      agentDirectives: profileData.agentDirectives,
    },
  };
}
