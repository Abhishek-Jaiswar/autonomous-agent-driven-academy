import { Worker, type Job } from "bullmq";
import { bullRedisConnectionOpts } from "../config/redis.js";
import { db } from "../config/database.js";
import { emitToSession } from "../config/socket.js";
import { sourcingService } from "../modules/sourcing/sourcing.service.js";
import { JOBS, QUEUES } from "../config/queue.js";
import { logger } from "../utils/logger.js";

/**
 * BullMQ Worker to handle asynchronous background agent workflows.
 */
export const agentWorker = new Worker(
  QUEUES.AGENT_WORKFLOW,
  async (job: Job) => {
    logger.info(`[AgentWorker] Processing job [${job.id}] — Type: ${job.name}`);

    if (job.name === JOBS.GENERATE_CURRICULUM) {
      const { goalId } = job.data;

      // 1. Fetch Goal and Profile details
      const goal = await db.goal.findUnique({
        where: { id: goalId },
        include: { profile: true },
      });

      if (!goal || !goal.profile) {
        logger.error(`[AgentWorker] Goal [${goalId}] or Profile not found. Aborting job.`);
        throw new Error("Goal or Profile not found");
      }

      // Stream progress log to student room
      emitToSession(goalId, "agent-log", {
        agentName: "Librarian",
        message: "Librarian Agent initializing academic resource discovery...",
        level: "INFO",
      });

      // 2. Discover candidate resources (Librarian Agent)
      const candidates = await sourcingService.discoverCandidateResources(
        goal.goalText,
        goal.category,
        goal.profile.weakAreas
      );

      emitToSession(goalId, "agent-log", {
        agentName: "SourceVerifier",
        message: `Discovered ${candidates.length} potential documents. Running SourceTrust heuristics checks...`,
        level: "INFO",
      });

      // 3. Evaluate credibilities (Source Verifier / SourceTrust)
      const evaluated = await sourcingService.verifyCandidateResources(candidates);

      // 4. Chunk, embed, index, and save resources
      for (const item of evaluated) {
        emitToSession(goalId, "agent-log", {
          agentName: "SourceVerifier",
          message: `Screening: "${item.title}" ➔ Trust Score: ${item.trustScore}/100 (${item.trustLabel}). Status: ${item.status}`,
          level: "INFO",
        });

        await sourcingService.indexResource(goalId, item);
      }

      emitToSession(goalId, "agent-log", {
        agentName: "System",
        message: "Sourcing & verification completed! Vector indices updated in Pinecone.",
        level: "INFO",
      });

      logger.info(`[AgentWorker] Completed Sourcing & Filtering pipeline for goal [${goalId}]`);
      
      // TODO: Handoff to Phase 4 (Syllabus Architecture) once Curriculum Architect is built.
    }
  },
  {
    ...bullRedisConnectionOpts,
    concurrency: 1, // Run sequentially to avoid rate-limiting on LLM embedding generation
  }
);

// Worker Lifecycle Log Listeners
agentWorker.on("completed", (job) => {
  logger.info(`[AgentWorker] Job [${job?.id}] completed successfully.`);
});

agentWorker.on("failed", (job, err) => {
  logger.error(`[AgentWorker] Job [${job?.id}] failed. Error: ${err.message}`);
});
