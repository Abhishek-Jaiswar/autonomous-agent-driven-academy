import { Worker, type Job } from "bullmq";
import { bullRedisConnectionOpts } from "../config/redis.js";
import { db } from "../config/database.js";
import { emitToSession } from "../config/socket.js";
import { JOBS, QUEUES } from "../config/queue.js";
import { sourcingService } from "../modules/sourcing/sourcing.service.js";
import { curriculumService } from "../modules/curriculum/curriculum.service.js";
import { logger } from "../utils/logger.js";

/**
 * BullMQ Worker to handle asynchronous background agent workflows.
 */
export const agentWorker = new Worker(
  QUEUES.AGENT_WORKFLOW,
  async (job: Job) => {
    logger.info(`[AgentWorker] Processing job [${job.id}] — Type: ${job.name}`);

    if (job.name === JOBS.GENERATE_MINI_LESSON) {
      const { goalId } = job.data;
      logger.info(`[AgentWorker] Executing Instant Mini-Lesson workflow for goal [${goalId}]`);

      emitToSession(goalId, "agent-log", {
        agentName: "ScopeRouter",
        message: "Scope Router assigned Instant Concept / Mini-Lesson flow. Bypassing heavy vector indexing.",
        level: "INFO",
      });

      // 1. Build single-lesson syllabus
      emitToSession(goalId, "agent-log", {
        agentName: "CurriculumArchitect",
        message: "Building mini-lesson syllabus...",
        level: "INFO",
      });

      const lesson = await curriculumService.generateMiniLessonSyllabus(goalId);

      // 2. Pre-generate Teacher content, Visual Explainer diagram, and Examiner quiz
      emitToSession(goalId, "agent-log", {
        agentName: "TeacherAgent",
        message: "Pre-generating textbook guide, Mermaid diagram, and knowledge check...",
        level: "INFO",
      });

      await curriculumService.autoFulfillMiniLesson(goalId, lesson.id);

      emitToSession(goalId, "agent-log", {
        agentName: "System",
        message: "Instant concept lesson ready! Open classroom to view.",
        level: "INFO",
      });
      return;
    }

    if (job.name === JOBS.GENERATE_PREVIEW_ROADMAP) {
      const { goalId } = job.data;
      logger.info(`[AgentWorker] Executing Free Preview Roadmap workflow for goal [${goalId}]`);

      emitToSession(goalId, "agent-log", {
        agentName: "PlanGate",
        message: "Broad goal scope requires Pro plan. Generating Free Preview Roadmap (Starter Lesson unlocked)...",
        level: "INFO",
      });

      await curriculumService.generatePreviewRoadmap(goalId);

      emitToSession(goalId, "agent-log", {
        agentName: "System",
        message: "Free Roadmap Preview ready! Starter lesson unlocked. Upgrade to Pro (₹499/mo) for full multi-month coaching.",
        level: "INFO",
      });
      return;
    }

    if (job.name === JOBS.GENERATE_MODULE || job.name === JOBS.GENERATE_CURRICULUM) {
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

      // Limit resource candidates if single module scope
      const selectedCandidates = job.name === JOBS.GENERATE_MODULE
        ? candidates.slice(0, 3)
        : candidates;

      emitToSession(goalId, "agent-log", {
        agentName: "SourceVerifier",
        message: `Discovered ${selectedCandidates.length} potential documents. Running SourceTrust heuristics checks...`,
        level: "INFO",
      });

      // 3. Evaluate credibilities (Source Verifier / SourceTrust)
      const evaluated = await sourcingService.verifyCandidateResources(selectedCandidates);

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
      
      // 5. Call Curriculum Architect Agent to build syllabus
      emitToSession(goalId, "agent-log", {
        agentName: "CurriculumArchitect",
        message: "Curriculum Architect Agent starting syllabus compilation...",
        level: "INFO",
      });
      await curriculumService.generateSyllabus(goalId);

      // 6. Call Schedule Planner Agent to chronological-schedule and unlock first lesson
      emitToSession(goalId, "agent-log", {
        agentName: "SchedulePlanner",
        message: "Schedule Planner Agent mapping calendar roadmap...",
        level: "INFO",
      });
      await curriculumService.scheduleSyllabus(goalId);

      emitToSession(goalId, "agent-log", {
        agentName: "System",
        message: "Curriculum generated and scheduled! Ready to start learning.",
        level: "INFO",
      });
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
