import { z } from "zod";
import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import { llm } from "../../llm/model.js";
import { curriculumArchitectPrompt } from "../../llm/prompts/architect/architect.prompt.js";

/**
 * Zod schema for structured Gemini curriculum planning outputs.
 */
export const curriculumArchitectSchema = z.object({
  phases: z.array(
    z.object({
      title: z.string().describe("e.g. Phase 1: Foundations"),
      order: z.number().int(),
      modules: z.array(
        z.object({
          title: z.string().describe("e.g. Module 1: Prompt Design"),
          order: z.number().int(),
          lessons: z.array(
            z.object({
              title: z.string().describe("e.g. Lesson 1: Zero-shot Prompting"),
              order: z.number().int(),
              suggestedPractical: z.string().optional().describe("Description of a hands-on activity, if applicable"),
              references: z.array(z.string()).describe("Titles of verified resources this lesson covers"),
            })
          ),
        })
      ),
    })
  ),
});

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
          goalClassification: {},
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

  /**
   * Curriculum Architect Agent: Generates a detailed syllabus based on the goal, profile, and verified resources.
   */
  async generateSyllabus(goalId: string) {
    logger.info(`[CurriculumArchitect] Architecting syllabus for goal [${goalId}]`);

    // 1. Fetch Goal, Profile, and Included Resources
    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: { profile: true, resources: true },
    });

    if (!goal || !goal.profile) {
      throw new Error(`Goal or Profile not found for goalId: ${goalId}`);
    }

    const includedResources = goal.resources.filter((r: any) => r.status === "INCLUDED");
    const verifiedResourcesList = includedResources
      .map((r, i) => `Resource #${i + 1}:\n- Title: ${r.title}\n- URL: ${r.url || "N/A"}\n- Type: ${r.type}`)
      .join("\n\n");

    const weakAreasList = goal.profile.weakAreas.length > 0 ? goal.profile.weakAreas.join(", ") : "None specified";
    const prerequisiteGapsList = (goal.profile.prerequisiteGaps && goal.profile.prerequisiteGaps.length > 0)
      ? goal.profile.prerequisiteGaps.join(", ")
      : "None specified";

    // 2. Call Gemini
    const structuredLlm = llm.withStructuredOutput(curriculumArchitectSchema);
    const formattedPrompt = await curriculumArchitectPrompt.format({
      goalText: goal.goalText,
      durationDays: goal.durationDays,
      category: goal.category,
      prerequisiteGapsList,
      weakAreasList,
      verifiedResourcesList: verifiedResourcesList || "No specific verified resources. Build a general curriculum.",
    });

    const syllabus = await structuredLlm.invoke(formattedPrompt);

    // Get curriculum ID
    const curriculum = await db.curriculum.findUnique({
      where: { goalId },
    });

    if (!curriculum) {
      throw new Error(`Curriculum placeholder not found for goalId: ${goalId}`);
    }

    // 3. Save phases, modules, lessons and link resources in a database transaction
    await db.$transaction(async (tx: any) => {
      // Clean up any existing curriculum items first if they exist (idempotence)
      const existingPhases = await tx.phase.findMany({
        where: { curriculumId: curriculum.id },
      });
      const phaseIds = existingPhases.map((p: any) => p.id);
      
      const existingModules = await tx.module.findMany({
        where: { phaseId: { in: phaseIds } },
      });
      const moduleIds = existingModules.map((m: any) => m.id);

      // Delete existing attempts, activities, agent logs, lessons, modules, phases
      await tx.attempt.deleteMany({
        where: { activity: { lesson: { moduleId: { in: moduleIds } } } }
      });
      await tx.activity.deleteMany({
        where: { lesson: { moduleId: { in: moduleIds } } }
      });
      await tx.agentLog.deleteMany({
        where: { lesson: { moduleId: { in: moduleIds } } }
      });
      await tx.lesson.deleteMany({
        where: { moduleId: { in: moduleIds } }
      });
      await tx.module.deleteMany({
        where: { phaseId: { in: phaseIds } }
      });
      await tx.phase.deleteMany({
        where: { curriculumId: curriculum.id }
      });

      // Insert new syllabus
      for (const p of syllabus.phases) {
        const phase = await tx.phase.create({
          data: {
            curriculumId: curriculum.id,
            title: p.title,
            order: p.order,
          },
        });

        for (const m of p.modules) {
          const module = await tx.module.create({
            data: {
              phaseId: phase.id,
              title: m.title,
              order: m.order,
            },
          });

          for (const l of m.lessons) {
            const lesson = await tx.lesson.create({
              data: {
                moduleId: module.id,
                title: l.title,
                order: l.order,
                status: "LOCKED",
              },
            });

            // Create practical activities if present
            if (l.suggestedPractical) {
              await tx.activity.create({
                data: {
                  lessonId: lesson.id,
                  type: "PRACTICAL",
                  payload: {
                    title: `${l.title} - Practical Task`,
                    description: l.suggestedPractical,
                  } as any,
                },
              });
            }

            // Link references to resources
            if (Array.isArray(l.references) && l.references.length > 0) {
              for (const refTitle of l.references) {
                // Find resource for this goal by title (case-insensitive substring match)
                const matchedResource = await tx.resource.findFirst({
                  where: {
                    goalId,
                    status: "INCLUDED",
                    title: {
                      contains: refTitle,
                      mode: "insensitive",
                    },
                  },
                });

                if (matchedResource) {
                  await tx.resource.update({
                    where: { id: matchedResource.id },
                    data: { lessonId: lesson.id },
                  });
                }
              }
            }
          }
        }
      }
    });

    logger.info(`[CurriculumArchitect] Successfully generated syllabus for goal [${goalId}]`);
    return syllabus;
  },

  /**
   * Schedule Planner Agent: Chronologically maps the syllabus and unlocks the first lesson.
   */
  async scheduleSyllabus(goalId: string) {
    logger.info(`[SchedulePlanner] Scheduling syllabus for goal [${goalId}]`);

    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: { curriculum: true },
    });

    if (!goal || !goal.curriculum) {
      throw new Error(`Goal or Curriculum not found for goalId: ${goalId}`);
    }

    const curriculumId = goal.curriculum.id;

    // 1. Fetch all lessons sorted
    const lessons = await db.lesson.findMany({
      where: { module: { phase: { curriculumId } } },
      orderBy: [
        { module: { phase: { order: "asc" } } },
        { module: { order: "asc" } },
        { order: "asc" },
      ],
    });

    const firstLesson = lessons[0];
    if (!firstLesson) {
      logger.warn(`[SchedulePlanner] No lessons found to schedule for curriculum [${curriculumId}]`);
      return;
    }

    // 2. Unlock the first lesson
    await db.lesson.update({
      where: { id: firstLesson.id },
      data: { status: "UNLOCKED" },
    });

    // 3. Create AgentLog checkpoint
    const dailyLoad = lessons.length / goal.durationDays;
    const loadText = dailyLoad >= 1 
      ? `${dailyLoad.toFixed(1)} lessons/day`
      : `1 lesson every ${(1 / dailyLoad).toFixed(1)} days`;

    await db.agentLog.create({
      data: {
        lessonId: firstLesson.id,
        agentName: "SchedulePlanner",
        message: `Schedule Planner mapped ${lessons.length} lessons across ${goal.durationDays} days (~${loadText}). Day 1, Lesson 1 "${firstLesson.title}" is unlocked.`,
        level: "INFO",
      },
    });

    logger.info(`[SchedulePlanner] Successfully scheduled curriculum [${curriculumId}]. First lesson unlocked.`);
  },

  /**
   * Generates a lightweight single-lesson syllabus for concept and topic goals,
   * skipping heavy multi-document web resource indexing.
   */
  async generateMiniLessonSyllabus(goalId: string) {
    logger.info(`[CurriculumService] Generating mini-lesson syllabus for goal [${goalId}]`);

    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: { profile: true, curriculum: true },
    });

    if (!goal || !goal.curriculum) {
      throw new Error(`Goal or Curriculum not found for goalId: ${goalId}`);
    }

    const curriculumId = goal.curriculum.id;

    // Build focused title from goal text
    const lessonTitle = goal.goalText.length > 60
      ? `${goal.goalText.slice(0, 57)}...`
      : goal.goalText;

    const phaseTitle = "Phase 1: Essential Overview";
    const moduleTitle = "Module 1: Core Concept";

    // Save 1-phase, 1-module, 1-lesson directly in transaction
    const createdLesson = await db.$transaction(async (tx: any) => {
      // Idempotence cleanup
      const existingPhases = await tx.phase.findMany({ where: { curriculumId } });
      const phaseIds = existingPhases.map((p: any) => p.id);
      const existingModules = await tx.module.findMany({ where: { phaseId: { in: phaseIds } } });
      const moduleIds = existingModules.map((m: any) => m.id);

      await tx.attempt.deleteMany({ where: { activity: { lesson: { moduleId: { in: moduleIds } } } } });
      await tx.activity.deleteMany({ where: { lesson: { moduleId: { in: moduleIds } } } });
      await tx.agentLog.deleteMany({ where: { lesson: { moduleId: { in: moduleIds } } } });
      await tx.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } });
      await tx.module.deleteMany({ where: { phaseId: { in: phaseIds } } });
      await tx.phase.deleteMany({ where: { curriculumId } });

      const phase = await tx.phase.create({
        data: { curriculumId, title: phaseTitle, order: 1 },
      });

      const module = await tx.module.create({
        data: { phaseId: phase.id, title: moduleTitle, order: 1 },
      });

      const lesson = await tx.lesson.create({
        data: {
          moduleId: module.id,
          title: lessonTitle,
          order: 1,
          status: "UNLOCKED",
        },
      });

      return lesson;
    });

    logger.info(
      `[CurriculumService] Mini-lesson syllabus created for goal [${goalId}], lessonId [${createdLesson.id}]`
    );

    return createdLesson;
  },

  /**
   * Pre-generates textbook study guide, visual diagram, and evaluation quiz
   * for an instant concept/mini-lesson flow.
   */
  async autoFulfillMiniLesson(goalId: string, lessonId: string) {
    logger.info(`[CurriculumService] Auto-fulfilling mini-lesson [${lessonId}] for goal [${goalId}]`);

    // Import services lazily to avoid circular dependencies
    const { teacherService } = await import("../teacher/teacher.service.js");
    const { examinerService } = await import("../examiner/examiner.service.js");

    // 1. Pre-generate Teacher study guide & Visual Explainer Mermaid diagram
    const lesson = await teacherService.getOrGenerateLessonContent(lessonId);

    // 2. Pre-generate Examiner quiz mini-check
    await examinerService.getOrGenerateQuiz(lessonId);

    await db.agentLog.create({
      data: {
        lessonId: lesson.id,
        agentName: "System",
        message: `Instant mini-lesson ready! Textbook content, Mermaid diagram, and quiz check pre-generated for "${lesson.title}".`,
        level: "INFO",
      },
    });

    logger.info(`[CurriculumService] Mini-lesson [${lessonId}] auto-fulfillment complete.`);
    return lesson;
  },

  /**
   * Generates a Roadmap Preview for long-form / course goals for Free tier users,
   * building the skeleton roadmap and unlocking starter lesson 1.
   */
  async generatePreviewRoadmap(goalId: string) {
    logger.info(`[CurriculumService] Generating free roadmap preview for goal [${goalId}]`);

    // 1. Generate standard syllabus skeleton
    await this.generateSyllabus(goalId);

    // 2. Schedule and unlock first lesson preview
    await this.scheduleSyllabus(goalId);

    // 3. Log free preview checkpoint with Rupee pricing upgrade guidance
    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: { curriculum: { include: { phases: { include: { modules: { include: { lessons: true } } } } } } },
    });

    const firstLesson = goal?.curriculum?.phases[0]?.modules[0]?.lessons[0];

    if (firstLesson) {
      await db.agentLog.create({
        data: {
          lessonId: firstLesson.id,
          agentName: "PlanGate",
          message: "Free Roadmap Preview unlocked (Lesson 1 ready). Upgrade to AstraLearn Pro (₹499/month or ₹1,499 lifetime) to unlock full long-form generation & project capstones.",
          level: "INFO",
        },
      });
    }

    logger.info(`[CurriculumService] Free roadmap preview generated for goal [${goalId}]`);
  },

  /**
   * Fetches all projects (goals) owned by a specific user with profile and progress calculations.
   */
  async getUserProjects(userId: string) {
    logger.info(`[CurriculumService] Fetching all user projects for userId [${userId}]`);

    const goals = await db.goal.findMany({
      where: { userId },
      include: {
        profile: true,
        curriculum: {
          include: {
            phases: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => {
      let totalLessons = 0;
      let completedLessons = 0;

      if (goal.curriculum?.phases) {
        for (const phase of goal.curriculum.phases) {
          for (const module of phase.modules) {
            for (const lesson of module.lessons) {
              totalLessons++;
              if (lesson.status === "COMPLETED") completedLessons++;
            }
          }
        }
      }

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const classification = (goal.profile?.goalClassification as any) || {};

      return {
        id: goal.id,
        goalText: goal.goalText,
        category: goal.category,
        durationDays: goal.durationDays,
        createdAt: goal.createdAt,
        scope: classification.scope || "topic",
        recommendedFlow: classification.recommendedFlow || "mini_lesson",
        requiresPaidPlan: Boolean(classification.requiresPaidPlan),
        totalLessons,
        completedLessons,
        progressPercentage,
        profile: goal.profile,
      };
    });
  },

  /**
   * Calculates overall user analytics and learning statistics across all projects.
   */
  async getUserAnalytics(userId: string) {
    logger.info(`[CurriculumService] Calculating learning analytics for userId [${userId}]`);

    const goals = await db.goal.findMany({
      where: { userId },
      include: {
        profile: true,
        curriculum: {
          include: {
            phases: {
              include: {
                modules: {
                  include: {
                    lessons: {
                      include: {
                        activities: {
                          include: {
                            attempts: true,
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
      },
    });

    let totalProjects = goals.length;
    let totalLessons = 0;
    let completedLessons = 0;
    let totalAttempts = 0;
    let passedAttempts = 0;
    let skillMap: Record<string, string> = {};

    for (const goal of goals) {
      if (goal.profile?.skillBaseline) {
        skillMap = { ...skillMap, ...(goal.profile.skillBaseline as Record<string, string>) };
      }
      if (goal.curriculum?.phases) {
        for (const phase of goal.curriculum.phases) {
          for (const module of phase.modules) {
            for (const lesson of module.lessons) {
              totalLessons++;
              if (lesson.status === "COMPLETED") completedLessons++;

              for (const activity of lesson.activities) {
                for (const attempt of activity.attempts) {
                  totalAttempts++;
                  if (attempt.score >= 70) passedAttempts++;
                }
              }
            }
          }
        }
      }
    }

    const quizPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalProjects,
      totalLessons,
      completedLessons,
      overallProgress,
      totalAttempts,
      passedAttempts,
      quizPassRate,
      skillBaseline: skillMap,
    };
  },

  /**
   * Deletes a user project/goal and all associated entities in a transaction.
   */
  async deleteUserProject(userId: string, goalId: string) {
    logger.info(`[CurriculumService] Deleting goal [${goalId}] for userId [${userId}]`);

    const goal = await db.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error("Project not found or unauthorized");
    }

    return await db.$transaction(async (tx: any) => {
      // Find curriculum
      const curriculum = await tx.curriculum.findUnique({ where: { goalId } });

      if (curriculum) {
        const existingPhases = await tx.phase.findMany({ where: { curriculumId: curriculum.id } });
        const phaseIds = existingPhases.map((p: any) => p.id);
        const existingModules = await tx.module.findMany({ where: { phaseId: { in: phaseIds } } });
        const moduleIds = existingModules.map((m: any) => m.id);

        await tx.attempt.deleteMany({ where: { activity: { lesson: { moduleId: { in: moduleIds } } } } });
        await tx.activity.deleteMany({ where: { lesson: { moduleId: { in: moduleIds } } } });
        await tx.agentLog.deleteMany({ where: { lesson: { moduleId: { in: moduleIds } } } });
        await tx.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } });
        await tx.module.deleteMany({ where: { phaseId: { in: phaseIds } } });
        await tx.phase.deleteMany({ where: { curriculumId: curriculum.id } });
        await tx.curriculum.delete({ where: { id: curriculum.id } });
      }

      await tx.resource.deleteMany({ where: { goalId } });
      await tx.profile.deleteMany({ where: { goalId } });
      await tx.goal.delete({ where: { id: goalId } });

      return { success: true };
    });
  },

  /**
   * Toggles the status of a Librarian candidate resource for human intervention.
   */
  async toggleResourceStatus(resourceId: string, status: "INCLUDED" | "REJECTED") {
    logger.info(`[CurriculumService] Toggling resource [${resourceId}] status to ${status}`);
    return await db.resource.update({
      where: { id: resourceId },
      data: { status },
    });
  },
};

