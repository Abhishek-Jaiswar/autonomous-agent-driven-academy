import type { Request, Response } from "express";
import { z } from "zod";
import { curriculumService } from "./curriculum.service.js";
import { logger } from "../../utils/logger.js";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { runSchoolGraph } from "../../graph/school.graph.js";
import { profileService } from "../profile/profile.service.js";

// Input validation schema for starting a curriculum session
const startCurriculumSchema = z.object({
  goalText: z.string().min(10),
  category: z.enum(["exam_prep", "job_project", "school_subject"]),
  durationDays: z.number().int().min(1).max(365),
});

function buildInterviewPayload(profile: any, isComplete?: boolean) {
  const counselorSignals = profile.counselorSignals || {};
  return {
    counselorQuestions: profile.counselorQuestions || [],
    currentQuestionIndex: (profile.interviewChat as any[]).filter((msg) => msg.role === "user").length,
    currentStage: profile.counselorStage || "goal_clarity",
    stageLabel: counselorSignals.stageLabel || profile.counselorStage || "Goal Clarity",
    confidence: profile.counselorConfidence || 0,
    extractedSignals: counselorSignals,
    quickReplies: profile.counselorQuickReplies || [],
    completionReason: profile.completionReason || "",
    isComplete:
      typeof isComplete === "boolean"
        ? isComplete
        : Boolean(profile.skillBaseline && Object.keys(profile.skillBaseline as object).length > 0),
    conversation: profile.interviewChat || [],
    profile: {
      learnerSummary: profile.learnerSummary,
      normalizedGoal: profile.normalizedGoal,
      skillBaseline: profile.skillBaseline,
      learningStyle: profile.learningStyle,
      preferences: profile.preferences,
      weakAreas: profile.weakAreas,
      risks: profile.risks,
      agentDirectives: profile.agentDirectives,
    },
  };
}

/**
 * Handles the registration of a new learning goal and setups placeholders.
 */
export async function startCurriculumSession(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user) {
      res.status(401).json({ success: false, error: "Unauthorized access" });
      return;
    }

    const result = startCurriculumSchema.safeParse(req.body);
    
    if (!result.success) {
      logger.warn("[CurriculumController] Validation failed for start session", {
        errors: result.error.issues,
      });
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.issues,
      });
      return;
    }

    const { goalText, category, durationDays } = result.data;
    const { id: userId } = authReq.user;

    // Delegate to service
    const session = await curriculumService.startSession(userId, goalText, category, durationDays);

    res.status(201).json({
      success: true,
      data: {
        goalId: session.goalId,
        curriculumId: session.curriculumId,
        message: "Goal session initialized. Please join the WebSocket room to start the counselor interview.",
      },
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to initialize goal session", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error during goal session initialization",
    });
  }
}

/**
 * Retrieves the full curriculum structure (phases, modules, lessons) by Goal ID.
 */
export async function getCurriculumDetails(req: Request, res: Response) {
  try {
    const { goalId } = req.params;
    
    if (!goalId) {
      res.status(400).json({ success: false, error: "Goal ID is required" });
      return;
    }

    // Delegate to service
    const curriculum = await curriculumService.getDetails(goalId as string);

    if (!curriculum) {
      res.status(404).json({ success: false, error: "Curriculum not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: curriculum,
    });
  } catch (error) {
    logger.error("[CurriculumController] Failed to fetch curriculum details", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching curriculum details",
    });
  }
}

/**
 * Starts the Counselor interview for a given Goal ID.
 * Emulates the turn 0 of counselor node logic to generate intake questions.
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

    // If the counselor has already started, return the current durable state.
    if ((profile.interviewChat as any[]).length > 0) {
      res.status(200).json({
        success: true,
        data: buildInterviewPayload(profile),
      });
      return;
    }

    // Run the compiled counselor graph (Turn 0: first diagnostic question)
    const finalState = await runSchoolGraph({
      goalId,
      goalText: goal.goalText,
      category: goal.category,
      durationDays: goal.durationDays,
      counselorQuestions: [],
      currentQuestionIndex: 0,
      isComplete: false,
    });

    // Save staged counselor state to DB
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
    logger.error("[CurriculumController] Failed to start interview", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while starting interview",
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
    const currentChat = profile.interviewChat as any[];
    const currentIndex = Math.floor(currentChat.length / 2);

    // Run the Counselor graph turn
    const finalState = await runSchoolGraph({
      goalId,
      goalText: goal.goalText,
      category: goal.category,
      durationDays: goal.durationDays,
      counselorQuestions: profile.counselorQuestions,
      currentQuestionIndex: currentIndex,
      lastUserResponse: answer,
      conversation: currentChat,
      counselorStage: profile.counselorStage as any,
      counselorConfidence: profile.counselorConfidence,
      counselorSignals: profile.counselorSignals as any,
      counselorQuickReplies: profile.counselorQuickReplies,
      isComplete: false,
    });

    // Save updated staged counselor state to DB
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
  } catch (error) {
    logger.error("[CurriculumController] Failed to submit interview answer", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while submitting interview answer",
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
