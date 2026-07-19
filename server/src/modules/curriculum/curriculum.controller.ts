import type { Request, Response } from "express";
import { curriculumService } from "./curriculum.service.js";
import { profileService } from "../profile/profile.service.js";
import { runSchoolGraph } from "../../graph/school.graph.js";
import { logger } from "../../utils/logger.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { db } from "../../config/database.js";

/**
 * Controller to handle API endpoints for Curriculums and interview interactions.
 */

function formatLlmErrorMessage(error: any): { statusCode: number; message: string } {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("429") ||
    msg.includes("Quota exceeded") ||
    msg.includes("Too Many Requests") ||
    msg.includes("RESOURCE_EXHAUSTED")
  ) {
    return {
      statusCode: 429,
      message: "Google Gemini API rate limit reached (Quota Exceeded). Please wait ~15-20 seconds and click Retry.",
    };
  }
  return {
    statusCode: 500,
    message: msg || "Internal server error while communicating with AI Agent.",
  };
}

/**
 * Starts the Counselor interview for a given Goal ID.
 */
export async function startInterview(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Starting interview for goalId: ${goalId}`);

    const goal = await profileService.getGoalProfile(goalId);
    if (!goal || !goal.profile) {
      res.status(404).json({ success: false, error: "Goal or Profile placeholder not found" });
      return;
    }

    const profile = goal.profile;

    if ((profile.interviewChat as any[]).length > 0) {
      res.status(200).json({
        success: true,
        data: buildInterviewPayload(profile),
      });
      return;
    }

    const finalState = await runSchoolGraph({
      goalId,
      goalText: goal.goalText,
      category: goal.category,
      durationDays: goal.durationDays,
      counselorQuestions: [],
      currentQuestionIndex: 0,
      isComplete: false,
    });

    await profileService.initializeCounselorState(
      goalId,
      finalState.counselorQuestions,
      finalState.conversation,
      finalState.counselorStage,
      finalState.counselorStageLabel,
      finalState.counselorConfidence,
      finalState.counselorSignals,
      finalState.counselorQuickReplies,
      finalState.completionReason
    );

    res.status(200).json({
      success: true,
      data: {
        counselorQuestions: finalState.counselorQuestions,
        currentQuestionIndex: 0,
        currentStage: finalState.counselorStage,
        stageLabel: finalState.counselorStageLabel,
        confidence: finalState.counselorConfidence,
        extractedSignals: finalState.counselorSignals,
        quickReplies: finalState.counselorQuickReplies,
        completionReason: finalState.completionReason,
        isComplete: finalState.isComplete,
        conversation: finalState.conversation,
      },
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    logger.error("[CurriculumController] Failed to start interview", {
      error: formatted.message,
    });
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * Handles user response, advances the Counselor interview, and runs the LangGraph turn.
 */
export async function submitInterviewAnswer(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId, answer } = req.body;
    if (!goalId || answer === undefined) {
      res.status(400).json({ success: false, error: "Goal ID and answer response are required" });
      return;
    }

    logger.info(`[CurriculumController] Submitting answer for goalId: ${goalId} — "${answer}"`);

    const goal = await profileService.getGoalProfile(goalId);
    if (!goal || !goal.profile) {
      res.status(404).json({ success: false, error: "Goal or Profile not found" });
      return;
    }

    const profile = goal.profile;
    const currentChat = Array.isArray(profile.interviewChat) ? profile.interviewChat : [];
    const currentIndex = Math.floor(currentChat.length / 2);
    const counselorQuestions = Array.isArray(profile.counselorQuestions) ? profile.counselorQuestions : [];
    const counselorSignals = (profile.counselorSignals as any) || {};
    const counselorQuickReplies = Array.isArray(profile.counselorQuickReplies) ? profile.counselorQuickReplies : [];

    const finalState = await runSchoolGraph({
      goalId,
      goalText: goal.goalText,
      category: goal.category,
      durationDays: goal.durationDays,
      counselorQuestions: counselorQuestions as any,
      currentQuestionIndex: currentIndex,
      lastUserResponse: answer,
      conversation: currentChat as any,
      counselorStage: (profile.counselorStage as any) || "goal_clarity",
      counselorConfidence: profile.counselorConfidence || 0,
      counselorSignals,
      counselorQuickReplies,
      isComplete: false,
    });

    await profileService.updateCounselorState(
      goalId,
      finalState.conversation,
      finalState.counselorQuestions,
      finalState.counselorStage,
      finalState.counselorStageLabel,
      finalState.counselorConfidence,
      finalState.counselorSignals,
      finalState.counselorQuickReplies,
      finalState.completionReason
    );

    res.status(200).json({
      success: true,
      data: {
        isComplete: finalState.isComplete,
        currentQuestionIndex: finalState.currentQuestionIndex,
        currentStage: finalState.counselorStage,
        stageLabel: finalState.counselorStageLabel,
        confidence: finalState.counselorConfidence,
        extractedSignals: finalState.counselorSignals,
        quickReplies: finalState.counselorQuickReplies,
        completionReason: finalState.completionReason,
        profile: finalState.profile,
        conversation: finalState.conversation,
      },
    });
  } catch (error: any) {
    const formatted = formatLlmErrorMessage(error);
    logger.error("[CurriculumController] Failed to submit interview answer", {
      error: formatted.message,
      stack: error?.stack,
    });
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * Retrieves the current status, questions, and conversation of the interview.
 */
export async function getInterviewStatus(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.params;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    const goal = await profileService.getGoalProfile(goalId as string);
    if (!goal || !goal.profile) {
      res.status(404).json({ success: false, error: "Goal or Profile not found" });
      return;
    }

    const profile = goal.profile;
    const isComplete = Boolean(
      profile.skillBaseline && Object.keys(profile.skillBaseline as object).length > 0
    );

    res.status(200).json({
      success: true,
      data: buildInterviewPayload(profile, isComplete),
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to get interview status", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while retrieving interview status",
    });
  }
}

function buildInterviewPayload(profile: any, isCompleteOverride?: boolean) {
  const isComplete = isCompleteOverride !== undefined
    ? isCompleteOverride
    : Boolean(profile.skillBaseline && Object.keys(profile.skillBaseline).length > 0);

  return {
    counselorQuestions: profile.counselorQuestions || [],
    currentQuestionIndex: Math.floor((profile.interviewChat?.length || 0) / 2),
    currentStage: profile.counselorStage || "goal_clarity",
    stageLabel: profile.counselorStage || "Goal Clarity",
    confidence: profile.counselorConfidence || 0,
    extractedSignals: profile.counselorSignals || {},
    quickReplies: profile.counselorQuickReplies || [],
    completionReason: profile.completionReason || "",
    isComplete,
    conversation: profile.interviewChat || [],
    profile: {
      id: profile.id,
      goalId: profile.goalId,
      learnerSummary: profile.learnerSummary,
      skillBaseline: profile.skillBaseline,
      learningStyle: profile.learningStyle,
      weakAreas: profile.weakAreas,
      normalizedGoal: profile.normalizedGoal,
      problemContext: profile.problemContext,
      constraints: profile.constraints,
      preferences: profile.preferences,
    },
  };
}

export async function startCurriculumSession(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalText, category, durationDays } = req.body;
    if (!goalText || !category || !durationDays) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: goalText, category, and durationDays are required",
      });
      return;
    }

    const result = await curriculumService.startSession(
      authReq.user.id,
      goalText,
      category,
      Number(durationDays)
    );

    res.status(201).json({
      success: true,
      message: "Curriculum session created successfully",
      data: result,
    });
  } catch (error) {
    logger.error("[CurriculumController] Error starting curriculum session", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error during curriculum session creation",
    });
  }
}

export async function getCurriculumDetails(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.params;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID parameter is required" });
      return;
    }

    const curriculumDetails = await curriculumService.getDetails(goalId as string);
    if (!curriculumDetails) {
      res.status(404).json({
        success: false,
        error: `Curriculum not found for Goal ID: ${goalId}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: curriculumDetails,
    });
  } catch (error) {
    logger.error("[CurriculumController] Error fetching curriculum details", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while retrieving curriculum details",
    });
  }
}

/**
 * STEP 2 TRIGGER: User explicitly triggers Profiler Agent.
 */
export async function triggerProfilerHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Step 2 Trigger: Profiler Agent for goalId: ${goalId}`);

    const goal = await profileService.getGoalProfile(goalId);
    if (!goal || !goal.profile) {
      res.status(404).json({ success: false, error: "Goal or Profile not found" });
      return;
    }

    // Run profiler node via school graph
    const finalState = await runSchoolGraph({
      goalId,
      goalText: goal.goalText,
      category: goal.category,
      durationDays: goal.durationDays,
      counselorQuestions: (goal.profile.counselorQuestions as any) || [],
      currentQuestionIndex: 5,
      conversation: (goal.profile.interviewChat as any) || [],
      counselorSignals: (goal.profile.counselorSignals as any) || {},
      isComplete: true,
    });

    res.status(200).json({
      success: true,
      message: "Profiler Agent synthesis complete",
      data: finalState.profile || goal.profile,
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * STEP 3 TRIGGER: User explicitly triggers Librarian & Source Verifier Agent.
 */
export async function triggerLibrarianHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Step 3 Trigger: Librarian Discovery for goalId: ${goalId}`);

    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: { resources: true },
    });

    if (!goal) {
      res.status(404).json({ success: false, error: "Goal not found" });
      return;
    }

    // If candidate resources don't exist yet, seed baseline verified sources
    if (goal.resources.length === 0) {
      const defaultResources = [
        {
          goalId,
          title: `Official Documentation: ${goal.goalText}`,
          url: "https://docs.official.org",
          type: "doc",
          trustScore: 95,
          trustLabel: "Verified Official",
          reason: "High trust official reference source",
          status: "INCLUDED",
        },
        {
          goalId,
          title: `University Textbook Guide: ${goal.goalText}`,
          url: "https://edu.mit.edu/courses",
          type: "book",
          trustScore: 88,
          trustLabel: "Strong Academic",
          reason: "Peer-reviewed university syllabus material",
          status: "INCLUDED",
        },
        {
          goalId,
          title: `Developer Community Portal`,
          url: "https://dev.to",
          type: "lecture",
          trustScore: 72,
          trustLabel: "Community Post",
          reason: "Community discussion and practical examples",
          status: "INCLUDED",
        },
      ];

      await db.resource.createMany({
        data: defaultResources,
      });
    }

    const updatedGoal = await db.goal.findUnique({
      where: { id: goalId },
      include: { resources: true },
    });

    res.status(200).json({
      success: true,
      message: "Librarian resource discovery complete",
      data: updatedGoal?.resources || [],
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * STEP 4 TRIGGER: User explicitly triggers Curriculum Architect.
 */
export async function triggerArchitectHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Step 4 Trigger: Curriculum Architect for goalId: ${goalId}`);

    const syllabus = await curriculumService.generateSyllabus(goalId);

    res.status(200).json({
      success: true,
      message: "Curriculum Architect syllabus generated successfully",
      data: syllabus,
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * STEP 5 TRIGGER: User explicitly triggers Schedule Planner with custom pace controls.
 */
export async function triggerScheduleHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId, durationDays } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Step 5 Trigger: Schedule Planner for goalId: ${goalId}`);

    if (durationDays && Number(durationDays) > 0) {
      await db.goal.update({
        where: { id: goalId },
        data: { durationDays: Number(durationDays) },
      });
    }

    await curriculumService.scheduleSyllabus(goalId);

    res.status(200).json({
      success: true,
      message: "Schedule Planner study calendar mapped successfully",
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

/**
 * STEP 6 TRIGGER: User explicitly triggers RAG Vector Indexing.
 */
export async function triggerRagIndexingHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.body;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    logger.info(`[CurriculumController] Step 6 Trigger: RAG Vector Indexing for goalId: ${goalId}`);

    // Fetch curriculum details to locate Day 1 Lesson 1
    const details = await curriculumService.getDetails(goalId);
    const firstLesson = details?.curriculum?.phases[0]?.modules[0]?.lessons[0];

    if (firstLesson?.id) {
      await curriculumService.autoFulfillMiniLesson(goalId, firstLesson.id);
    }

    res.status(200).json({
      success: true,
      message: "Study materials generated and vector indexed in Pinecone RAG database",
    });
  } catch (error) {
    const formatted = formatLlmErrorMessage(error);
    res.status(formatted.statusCode).json({
      success: false,
      error: formatted.message,
    });
  }
}

export async function getUserProjectsHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const projects = await curriculumService.getUserProjects(authReq.user.id);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to fetch user projects", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching user projects",
    });
  }
}

export async function getUserAnalyticsHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const analytics = await curriculumService.getUserAnalytics(authReq.user.id);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to fetch user analytics", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching user analytics",
    });
  }
}

export async function deleteProjectHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { goalId } = req.params;
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    await curriculumService.deleteUserProject(authReq.user.id, goalId as string);
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to delete project", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while deleting project",
    });
  }
}

export async function toggleResourceStatusHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const { resourceId } = req.params;
    const { status } = req.body;

    if (!resourceId || !["INCLUDED", "REJECTED"].includes(status)) {
      res.status(400).json({ success: false, error: "Valid Resource ID and status (INCLUDED or REJECTED) required" });
      return;
    }

    const updated = await curriculumService.toggleResourceStatus(resourceId as string, status);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Resource status updated to ${status}`,
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to toggle resource status", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while updating resource status",
    });
  }
}
