import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

/**
 * Service to handle business logic and database writes for Profiles and Goals.
 */
export const profileService = {
  /**
   * Fetches goal and profile information by Goal ID.
   */
  async getGoalProfile(goalId: string) {
    logger.info(`[ProfileService] Fetching Goal and Profile for goal [${goalId}]`);
    return await db.goal.findUnique({
      where: { id: goalId },
      include: { profile: true },
    });
  },

  /**
   * Updates the Counselor questions and initial interview chat array on start.
   */
  async initializeCounselorQuestions(goalId: string, counselorQuestions: string[], interviewChat: any[]) {
    logger.info(`[ProfileService] Initializing Counselor questions for goal [${goalId}]`);
    return await db.profile.update({
      where: { goalId },
      data: {
        counselorQuestions,
        interviewChat: interviewChat as any,
      },
    });
  },

  /**
   * Appends/updates the interview conversation chat log JSON in the database.
   */
  async updateChatLog(goalId: string, chatLog: any[]) {
    logger.debug(`[ProfileService] Updating chat logs for goal [${goalId}]`);
    return await db.profile.update({
      where: { goalId },
      data: {
        interviewChat: chatLog as any,
      },
    });
  },

  /**
   * Persists the synthesized profile details and audit log into the database inside a transaction.
   */
  async saveProfileSynthesis(
    goalId: string,
    skillBaseline: Record<string, string>,
    learningStyle: string,
    weakAreas: string[]
  ) {
    logger.info(`[ProfileService] Saving profile synthesis for goal [${goalId}]`);
    return await db.$transaction(async (tx: any) => {
      const profile = await tx.profile.update({
        where: { goalId },
        data: {
          skillBaseline: skillBaseline as any,
          learningStyle,
          weakAreas,
        },
      });

      await tx.agentLog.create({
        data: {
          lessonId: null,
          agentName: "Profiler",
          message: `Learner profile compiled successfully. Preferred style: ${learningStyle}. Key weak areas: ${weakAreas.join(", ")}`,
          level: "INFO",
        },
      });

      return profile;
    });
  },
};
