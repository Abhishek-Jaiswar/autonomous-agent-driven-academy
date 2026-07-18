import { z } from "zod";
import { llm } from "../../llm/model.js";
import { emitToSession } from "../../config/socket.js";
import { queueScopedWorkflow } from "../../config/queue.js";
import type {
  GoalClassification,
  GoalComplexity,
  GoalScope,
  RecommendedFlow,
  SchoolState,
  SchoolStateInput,
  TokenBudgetClass,
} from "../state.js";
import { logger } from "../../utils/logger.js";
import { profilerSynthesisPrompt } from "../../llm/prompts/profiler/profiler.prompt.js";
import { profileService } from "../../modules/profile/profile.service.js";

const goalClassificationSchema = z.object({
  scope: z
    .enum(["concept", "topic", "lesson", "module", "course", "career_path", "project_path"])
    .describe("The product-sized scope of the user's learning goal"),
  complexity: z.enum(["low", "medium", "high", "very_high"]),
  estimatedDurationDays: z.number().int().min(1).max(365),
  tokenBudgetClass: z.enum(["tiny", "small", "medium", "large"]),
  requiresPaidPlan: z.boolean(),
  recommendedFlow: z.enum([
    "instant_answer",
    "mini_lesson",
    "roadmap",
    "starter_module",
    "full_course",
    "project_plan",
  ]),
  shouldAskClarifyingQuestions: z.boolean(),
  reasoning: z.string().describe("Short explanation for why this scope and flow were selected"),
});

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
  goalClassification: goalClassificationSchema,
  problemContext: z.object({
    whyNow: z.string().optional(),
    realWorldUseCase: z.string().optional(),
    targetProject: z.string().optional(),
    jobRole: z.string().optional(),
    successScenario: z.string().optional(),
  }).optional(),
  constraints: z.object({
    dailyTimeMinutes: z.number().int().optional(),
    schedulePattern: z.enum(["weekday", "weekend", "irregular"]).optional(),
    deviceAccess: z.array(z.string()).optional(),
    budget: z.enum(["free_only", "low", "paid_ok"]).optional(),
  }).optional(),
  learningPreferences: z.object({
    explanationDepth: z.enum(["simple", "medium", "deep"]).default("medium"),
    practiceBias: z.enum(["theory_first", "build_first", "mixed"]).default("mixed"),
    feedbackStyle: z.enum(["direct", "encouraging", "socratic"]).optional(),
    preferredArtifacts: z.array(z.string()).optional(),
    learningStyle: z.enum(["visual", "practical", "text", "balanced"]).default("balanced"),
    dailyTimeCommitment: z.string().optional(),
    assessmentMode: z.enum(["quiz", "project", "mixed"]).default("mixed"),
  }).optional(),
  successCriteria: z.object({
    finalDeliverable: z.string().optional(),
    measurableOutcomes: z.array(z.string()).default([]),
    evaluationMethod: z.enum(["quiz", "project", "portfolio", "exam", "interview"]).optional(),
  }).optional(),
  prerequisiteGaps: z.array(z.string()).default([]).describe("Foundational prerequisite skills the student is missing"),
  skillBaseline: z
    .array(
      z.object({
        skill: z.string().describe("The key technology, concept, or language"),
        level: z.string().describe("The experience level (e.g. beginner, intermediate, advanced, none)"),
      })
    )
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

const broadPaidScopes = new Set<GoalScope>(["course", "career_path", "project_path"]);

function getTokenBudgetClass(
  scope: GoalScope,
  complexity: GoalComplexity,
  estimatedDurationDays: number
): TokenBudgetClass {
  if (estimatedDurationDays > 30 || complexity === "very_high" || scope === "career_path") {
    return "large";
  }
  if (estimatedDurationDays > 14 || complexity === "high" || scope === "course" || scope === "project_path") {
    return "medium";
  }
  if (scope === "concept") {
    return "tiny";
  }
  return "small";
}

function getRecommendedFlow(scope: GoalScope, requiresPaidPlan: boolean): RecommendedFlow {
  if (scope === "concept") return "instant_answer";
  if (scope === "topic" || scope === "lesson") return "mini_lesson";
  if (scope === "module") return "starter_module";
  if (scope === "project_path") return requiresPaidPlan ? "project_plan" : "roadmap";
  if (scope === "course" || scope === "career_path") return requiresPaidPlan ? "full_course" : "roadmap";
  return "mini_lesson";
}

function normalizeGoalClassification(
  input: GoalClassification,
  requestedDurationDays: number
): GoalClassification {
  const estimatedDurationDays = Math.max(
    1,
    Math.min(365, Math.round(input.estimatedDurationDays || requestedDurationDays || 1))
  );
  const requiresPaidPlan =
    broadPaidScopes.has(input.scope) ||
    estimatedDurationDays > 14 ||
    input.complexity === "very_high";

  return {
    ...input,
    estimatedDurationDays,
    requiresPaidPlan,
    tokenBudgetClass: getTokenBudgetClass(input.scope, input.complexity, estimatedDurationDays),
    recommendedFlow: getRecommendedFlow(input.scope, requiresPaidPlan),
    shouldAskClarifyingQuestions:
      input.shouldAskClarifyingQuestions || input.scope === "course" || input.scope === "career_path",
    reasoning: input.reasoning || "Classified from the learner goal, intake answers, and requested timeline.",
  };
}

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
  const goalClassification = normalizeGoalClassification(
    profileData.goalClassification,
    state.durationDays
  );

  logger.info(
    `[ProfilerNode] Profile synthesized successfully. Scope: ${goalClassification.scope}, Flow: ${goalClassification.recommendedFlow}, Paid: ${goalClassification.requiresPaidPlan}, Style: ${profileData.preferences.learningStyle}, Weak Areas: ${profileData.weakAreas.join(", ")}`
  );

  // Transform skillBaseline from Array<{ skill, level }> to Record<string, string>
  const skillBaselineRecord: Record<string, string> = {};
  if (Array.isArray(profileData.skillBaseline)) {
    for (const item of profileData.skillBaseline) {
      if (item && item.skill) {
        skillBaselineRecord[item.skill] = item.level || "unknown";
      }
    }
  }

  // Write profile and log to database via service
  await profileService.saveProfileSynthesis(
    state.goalId,
    profileData.learnerSummary,
    profileData.normalizedGoal,
    goalClassification,
    skillBaselineRecord,
    profileData.preferences,
    profileData.weakAreas,
    profileData.risks,
    profileData.agentDirectives,
    profileData.problemContext,
    profileData.constraints,
    profileData.learningPreferences,
    profileData.successCriteria,
    profileData.prerequisiteGaps
  );

  // Emit WebSocket events to the session room
  emitToSession(state.goalId, "agent-log", {
    agentName: "Profiler",
    message: `Profile compiled successfully. Goal scope: ${goalClassification.scope}; recommended flow: ${goalClassification.recommendedFlow}.`,
    level: "INFO",
  });

  emitToSession(state.goalId, "profile-ready", {
    goalId: state.goalId,
    skillBaseline: skillBaselineRecord,
    learningStyle: profileData.preferences.learningStyle,
    preferences: profileData.preferences,
    weakAreas: profileData.weakAreas,
    risks: profileData.risks,
    normalizedGoal: profileData.normalizedGoal,
    goalClassification,
    agentDirectives: profileData.agentDirectives,
    problemContext: profileData.problemContext,
    constraints: profileData.constraints,
    learningPreferences: profileData.learningPreferences,
    successCriteria: profileData.successCriteria,
    prerequisiteGaps: profileData.prerequisiteGaps,
  });

  // Queue scoped background workflow job in Redis/BullMQ based on classified scope & flow
  await queueScopedWorkflow(state.goalId, goalClassification);

  // Return the compiled profile state
  return {
    profile: {
      goalId: state.goalId,
      category: state.category,
      durationDays: state.durationDays,
      goalText: state.goalText,
      learnerSummary: profileData.learnerSummary,
      normalizedGoal: profileData.normalizedGoal,
      goalClassification,
      skillBaseline: skillBaselineRecord,
      preferences: profileData.preferences,
      learningStyle: profileData.preferences.learningStyle,
      weakAreas: profileData.weakAreas,
      risks: profileData.risks,
      agentDirectives: profileData.agentDirectives,
      problemContext: profileData.problemContext,
      constraints: profileData.constraints,
      learningPreferences: profileData.learningPreferences,
      successCriteria: profileData.successCriteria,
      prerequisiteGaps: profileData.prerequisiteGaps || [],
    },
  };
}
