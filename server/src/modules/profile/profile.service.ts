import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import type {
  AgentDirectives,
  CounselorSignals,
  GoalClassification,
  NormalizedGoal,
  ProfilePreferences,
  ProfileRisk,
} from "../../graph/state.js";

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
  async initializeCounselorState(
    goalId: string,
    counselorQuestions: string[],
    interviewChat: any[],
    counselorStage: string,
    counselorStageLabel: string,
    counselorConfidence: number,
    counselorSignals: CounselorSignals,
    counselorQuickReplies: string[],
    completionReason = ""
  ) {
    logger.info(`[ProfileService] Initializing Counselor questions for goal [${goalId}]`);
    return await db.profile.update({
      where: { goalId },
      data: {
        counselorQuestions,
        interviewChat: interviewChat as any,
        counselorStage,
        counselorConfidence,
        counselorSignals: {
          ...counselorSignals,
          stageLabel: counselorStageLabel,
        } as any,
        counselorQuickReplies,
        completionReason,
      },
    });
  },

  /**
   * Appends/updates the interview conversation chat log JSON in the database.
   */
  async updateCounselorState(
    goalId: string,
    chatLog: any[],
    counselorQuestions: string[],
    counselorStage: string,
    counselorStageLabel: string,
    counselorConfidence: number,
    counselorSignals: CounselorSignals,
    counselorQuickReplies: string[],
    completionReason = ""
  ) {
    logger.debug(`[ProfileService] Updating chat logs for goal [${goalId}]`);
    return await db.profile.update({
      where: { goalId },
      data: {
        interviewChat: chatLog as any,
        counselorQuestions,
        counselorStage,
        counselorConfidence,
        counselorSignals: {
          ...counselorSignals,
          stageLabel: counselorStageLabel,
        } as any,
        counselorQuickReplies,
        completionReason,
      },
    });
  },

  /**
   * Persists the synthesized decision-grade profile details and audit log into the database inside a transaction.
   */
  async saveProfileSynthesis(
    goalId: string,
    learnerSummary: string,
    normalizedGoal: NormalizedGoal,
    goalClassification: GoalClassification,
    skillBaseline: Record<string, string>,
    preferences: ProfilePreferences,
    weakAreas: string[],
    risks: ProfileRisk[],
    agentDirectives: AgentDirectives,
    problemContext?: any,
    constraints?: any,
    learningPreferences?: any,
    successCriteria?: any,
    prerequisiteGaps?: string[]
  ) {
    logger.info(`[ProfileService] Saving profile synthesis for goal [${goalId}]`);
    return await db.$transaction(async (tx: any) => {
      const profile = await tx.profile.update({
        where: { goalId },
        data: {
          learnerSummary,
          normalizedGoal: normalizedGoal as any,
          goalClassification: goalClassification as any,
          skillBaseline: skillBaseline as any,
          learningStyle: preferences.learningStyle,
          preferences: preferences as any,
          weakAreas,
          risks: risks as any,
          agentDirectives: agentDirectives as any,
          problemContext: (problemContext || {}) as any,
          constraints: (constraints || {}) as any,
          learningPreferences: (learningPreferences || preferences || {}) as any,
          successCriteria: (successCriteria || {}) as any,
          prerequisiteGaps: prerequisiteGaps || [],
        },
      });

      await tx.agentLog.create({
        data: {
          lessonId: null,
          agentName: "Profiler",
          message: `Learner profile compiled successfully. Scope: ${goalClassification.scope}; flow: ${goalClassification.recommendedFlow}; paid=${goalClassification.requiresPaidPlan}. Preferred style: ${preferences.learningStyle}. Prerequisite gaps: ${(prerequisiteGaps || []).join(", ") || "None"}. Key weak areas: ${weakAreas.join(", ")}`,
          level: "INFO",
        },
      });

      return profile;
    });
  },
};
