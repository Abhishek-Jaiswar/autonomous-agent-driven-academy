import { Queue } from "bullmq";
import { bullRedisConnectionOpts } from "./redis.js";
import { logger } from "../utils/logger.js";

// Define queue names
export const QUEUES = {
  AGENT_WORKFLOW: "agent-workflow",
} as const;

// Define job types
export const JOBS = {
  GENERATE_CURRICULUM: "generate-curriculum",
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
 * Enqueues a task to generate a personalized curriculum for a user goal.
 */
export async function queueCurriculumGeneration(goalId: string) {
  logger.info(`[Queue] Queueing curriculum generation job for goal: ${goalId}`);
  
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
