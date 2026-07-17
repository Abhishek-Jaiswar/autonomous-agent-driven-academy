import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

/**
 * Service to handle business logic and database writes for Curriculums.
 */
export const curriculumService = {
  /**
   * Initializes a learning session by creating User, Goal, Profile, and Curriculum records inside a transaction.
   */
  async startSession(userId: string, goalText: string, category: string, durationDays: number) {
    logger.info(`[CurriculumService] Initializing session for userId ${userId}`);

    return await db.$transaction(async (tx: any) => {
      // 1. Create Goal
      const goal = await tx.goal.create({
        data: {
          userId,
          goalText,
          category,
          durationDays,
        },
      });

      // 3. Create Profile Placeholder
      await tx.profile.create({
        data: {
          goalId: goal.id,
          skillBaseline: {},
          learningStyle: "balanced",
          learnerSummary: "",
          normalizedGoal: {},
          preferences: {
            learningStyle: "balanced",
            assessmentMode: "mixed",
          },
          weakAreas: [],
          risks: [],
          agentDirectives: {
            librarian: [],
            curriculumArchitect: [],
            teacher: [],
            examiner: [],
          },
          counselorStage: "goal_clarity",
          counselorConfidence: 0,
          counselorSignals: {
            baselineHints: [],
            constraints: [],
            preferences: [],
          },
          counselorQuickReplies: [],
          completionReason: "",
          counselorQuestions: [],
          interviewChat: [],
        },
      });

      // 4. Create Curriculum Placeholder
      const curriculum = await tx.curriculum.create({
        data: {
          goalId: goal.id,
        },
      });

      return {
        goalId: goal.id,
        curriculumId: curriculum.id,
      };
    });
  },

  /**
   * Fetches the complete curriculum roadmap details (phases, modules, lessons, resources, and activities).
   */
  async getDetails(goalId: string) {
    logger.info(`[CurriculumService] Fetching goal details for goal [${goalId}]`);

    return await db.goal.findUnique({
      where: { id: goalId },
      include: {
        resources: true,
        profile: true,
        curriculum: {
          include: {
            phases: {
              orderBy: { order: "asc" },
              include: {
                modules: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      include: {
                        resources: true,
                        activities: true,
                        agentLogs: {
                          orderBy: { createdAt: "asc" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  },
};
