import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import { llm } from "../../llm/model.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const remedialLessonPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are the Adaptive Coach Agent for AstraLearn AI.
The student scored {scorePercentage}% (below 70%) on lesson "{lessonTitle}".

Your task is to write a supportive, targeted remedial review lesson that addresses potential misconceptions and provides extra step-by-step guidance.

INSTRUCTIONS:
1. Provide a clear, encouraging review title (e.g. "Remediation & Review: Key Concepts of {lessonTitle}").
2. Write a concise review guide reviewing the foundational principles they missed.
3. Include 2 simple practice exercises with worked solutions.
4. Keep the tone empathetic, constructive, and focused on building confidence.`,
  ],
]);

export const coachService = {
  /**
   * Adaptive Coach Agent:
   * Evaluates quiz score. If >=70%, unlocks the next lesson. If <70%, dynamically injects a remedial lesson.
   */
  async processQuizOutcome(
    goalId: string,
    lessonId: string,
    scorePercentage: number
  ) {
    logger.info(`[AdaptiveCoach] Processing quiz outcome for goal [${goalId}], lesson [${lessonId}], score [${scorePercentage}%]`);

    // 1. Mark current lesson as COMPLETED
    const currentLesson = await db.lesson.update({
      where: { id: lessonId },
      data: { status: "COMPLETED" },
      include: {
        module: {
          include: {
            phase: {
              include: {
                curriculum: true,
              },
            },
          },
        },
      },
    });

    const curriculumId = currentLesson.module.phase.curriculum.id;
    const isPass = scorePercentage >= 70;

    if (isPass) {
      // 2. PASS: Find the next LOCKED lesson in the curriculum
      const lessons = await db.lesson.findMany({
        where: {
          module: { phase: { curriculumId } },
        },
        orderBy: [
          { module: { phase: { order: "asc" } } },
          { module: { order: "asc" } },
          { order: "asc" },
        ],
      });

      const nextLockedLesson = lessons.find((l) => l.status === "LOCKED");

      if (nextLockedLesson) {
        // Unlock next lesson
        await db.lesson.update({
          where: { id: nextLockedLesson.id },
          data: { status: "UNLOCKED" },
        });

        // Mark current module completed if all its lessons are done, and unlock next module
        const moduleLessons = await db.lesson.findMany({
          where: { moduleId: currentLesson.moduleId },
        });
        const allModuleLessonsDone = moduleLessons.every(
          (l) => l.status === "COMPLETED" || l.id === currentLesson.id
        );

        if (allModuleLessonsDone) {
          await db.module.update({
            where: { id: currentLesson.moduleId },
            data: { generationStatus: "COMPLETED" },
          });

          // Find next module in phase order
          const nextModule = await db.module.findFirst({
            where: {
              phase: { curriculumId },
              order: { gt: currentLesson.module.order },
            },
            orderBy: { order: "asc" },
          });

          if (nextModule) {
            await db.module.update({
              where: { id: nextModule.id },
              data: { generationStatus: "UNLOCKED" },
            });
            logger.info(`[AdaptiveCoach] Progressively unlocked next module [${nextModule.title}]`);
          }
        }

        await db.agentLog.create({
          data: {
            lessonId: nextLockedLesson.id,
            agentName: "AdaptiveCoach",
            message: `Adaptive Coach: Passed quiz with ${scorePercentage}%. Unlocked next lesson "${nextLockedLesson.title}".`,
            level: "INFO",
          },
        });

        logger.info(`[AdaptiveCoach] Passed (${scorePercentage}%). Unlocked next lesson [${nextLockedLesson.id}]`);
        return {
          action: "UNLOCKED_NEXT_LESSON",
          unlockedLessonId: nextLockedLesson.id,
          unlockedLessonTitle: nextLockedLesson.title,
        };
      } else {
        await db.agentLog.create({
          data: {
            lessonId,
            agentName: "AdaptiveCoach",
            message: `Adaptive Coach: Passed quiz with ${scorePercentage}%. All curriculum lessons completed!`,
            level: "INFO",
          },
        });

        logger.info(`[AdaptiveCoach] Passed (${scorePercentage}%). Curriculum complete!`);
        return {
          action: "CURRICULUM_COMPLETED",
        };
      }
    } else {
      // 3. FAIL (<70%): Generate and inject remedial review lesson
      logger.info(`[AdaptiveCoach] Score ${scorePercentage}% < 70%. Generating remedial review lesson...`);

      const formattedPrompt = await remedialLessonPrompt.format({
        scorePercentage,
        lessonTitle: currentLesson.title,
      });

      const response = await llm.invoke(formattedPrompt);
      const remedialText = typeof response.content === "string" ? response.content : String(response.content);
      const remedialTitle = `Remediation & Review: ${currentLesson.title}`;

      // Insert remedial lesson immediately after current lesson
      let remedialLessonId: string = "";
      await db.$transaction(async (tx) => {
        // Shift order of subsequent lessons in module by 1
        await tx.lesson.updateMany({
          where: {
            moduleId: currentLesson.moduleId,
            order: { gt: currentLesson.order },
          },
          data: {
            order: { increment: 1 },
          },
        });

        // Create new unlocked remedial lesson
        const remedialLesson = await tx.lesson.create({
          data: {
            moduleId: currentLesson.moduleId,
            title: remedialTitle,
            content: remedialText,
            order: currentLesson.order + 1,
            status: "UNLOCKED",
          },
        });

        remedialLessonId = remedialLesson.id;

        // Create practical activity for remediation
        await tx.activity.create({
          data: {
            lessonId: remedialLesson.id,
            type: "PRACTICAL",
            payload: {
              title: `${remedialTitle} - Remedial Review Exercises`,
              description: "Review the guidance above and solve the 2 practice exercises.",
            } as any,
          },
        });

        // Log checkpoint
        await tx.agentLog.create({
          data: {
            lessonId: remedialLesson.id,
            agentName: "AdaptiveCoach",
            message: `Adaptive Coach: Quiz score ${scorePercentage}% < 70%. Injected remedial review lesson "${remedialTitle}".`,
            level: "INFO",
          },
        });
      });

      logger.info(`[AdaptiveCoach] Successfully injected remedial lesson [${remedialLessonId}]`);
      return {
        action: "INJECTED_REMEDIAL_LESSON",
        remedialLessonId,
        remedialLessonTitle: remedialTitle,
      };
    }
  },
};
