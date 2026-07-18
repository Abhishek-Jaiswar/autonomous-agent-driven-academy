import { Queue } from "bullmq";
import { bullRedisConnectionOpts } from "./redis.js";
import { logger } from "../utils/logger.js";
import { db } from "./database.js";
import type { GoalClassification } from "../graph/state.js";

// Define queue names
export const QUEUES = {
  AGENT_WORKFLOW: "agent-workflow",
} as const;

// Define job types
export const JOBS = {
  GENERATE_MINI_LESSON: "generate-mini-lesson",
  GENERATE_MODULE: "generate-module",
  GENERATE_CURRICULUM: "generate-curriculum",
  GENERATE_PREVIEW_ROADMAP: "generate-preview-roadmap",
  ADAPT_CURRICULUM: "adapt-curriculum",
} as const;

// Initialize the main agent workflow queue
export const agentQueue = new Queue(QUEUES.AGENT_WORKFLOW, {
  ...bullRedisConnectionOpts,
  defaultJobOptions: {
    attempts: 3, // Auto-retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5s, then 10s, then 20s...
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep logs of completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
    },
  },
});

/**
 * Routes and enqueues a workflow job matching the goal's scope, recommended flow, and user plan tier.
 */
export async function queueScopedWorkflow(
  goalId: string,
  classification: GoalClassification
) {
  const { scope, recommendedFlow, requiresPaidPlan } = classification;
  logger.info(
    `[Queue] Routing workflow for goal [${goalId}] — Scope: ${scope}, Recommended Flow: ${recommendedFlow}, Requires Paid: ${requiresPaidPlan}`
  );

  // Fetch goal to check user's plan tier
  const goal = await db.goal.findUnique({
    where: { id: goalId },
    include: { user: true },
  });

  const isProUser = goal?.user?.planTier === "pro";

  let jobName: string = JOBS.GENERATE_CURRICULUM;

  if (requiresPaidPlan && !isProUser) {
    logger.info(
      `[Queue] Goal [${goalId}] requires Pro plan but user is on Free tier. Enqueuing GENERATE_PREVIEW_ROADMAP.`
    );
    jobName = JOBS.GENERATE_PREVIEW_ROADMAP;
  } else if (
    recommendedFlow === "instant_answer" ||
    recommendedFlow === "mini_lesson" ||
    scope === "concept" ||
    scope === "topic" ||
    scope === "lesson"
  ) {
    jobName = JOBS.GENERATE_MINI_LESSON;
  } else if (recommendedFlow === "starter_module" || scope === "module") {
    jobName = JOBS.GENERATE_MODULE;
  }

  const job = await agentQueue.add(jobName, { goalId, classification, isPreviewOnly: requiresPaidPlan && !isProUser });

  logger.info(`[Queue] Enqueued job [${jobName}] (Job ID: ${job.id}) for goal [${goalId}]`);
  return job;
}

/**
 * Enqueues a task to generate a personalized full curriculum for a user goal.
 */
export async function queueCurriculumGeneration(goalId: string) {
  logger.info(`[Queue] Queueing standard curriculum generation job for goal: ${goalId}`);
  
  const job = await agentQueue.add(JOBS.GENERATE_CURRICULUM, { goalId });
  
  logger.info(`[Queue] Job enqueued successfully. Job ID: ${job.id}`);
  return job;
}

/**
 * Enqueues a task to run the adaptive coach and remediate a lesson path.
 */
export async function queueRemediation(attemptId: string) {
  logger.info(`[Queue] Queueing adaptive remediation job for attempt: ${attemptId}`);
  
  const job = await agentQueue.add(JOBS.ADAPT_CURRICULUM, { attemptId });
  
  logger.info(`[Queue] Job enqueued successfully. Job ID: ${job.id}`);
  return job;
}

