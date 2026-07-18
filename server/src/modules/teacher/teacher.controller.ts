import type { Request, Response } from "express";
import { teacherService } from "./teacher.service.js";
import { examinerService } from "../examiner/examiner.service.js";
import { logger } from "../../utils/logger.js";

function getRouteParam(param: string | string[] | undefined): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

/**
 * GET /curriculum/lesson/:lessonId
 * Returns the lesson details, generating textbook content, Mermaid diagram, and quiz if needed.
 */
export async function getLessonDetails(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId);
    if (!lessonId) {
      res.status(400).json({ success: false, error: "Lesson ID is required" });
      return;
    }

    // 1. Get or generate lesson content & diagram
    const lesson = await teacherService.getOrGenerateLessonContent(lessonId);

    // 2. Ensure quiz activity is also generated if missing
    await examinerService.getOrGenerateQuiz(lessonId);

    // 3. Re-fetch full updated lesson with activities and logs
    const fullLesson = await teacherService.getOrGenerateLessonContent(lessonId);

    res.status(200).json({
      success: true,
      data: fullLesson,
    });
  } catch (error: any) {
    logger.error("[TeacherController] Failed to fetch lesson details", {
      error: error.message || String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching lesson details",
    });
  }
}

/**
 * POST /curriculum/lesson/:lessonId/doubt
 * REST endpoint for grounded RAG doubt answering.
 */
export async function submitDoubt(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId);
    const { goalId, doubt } = req.body;

    if (!lessonId || !goalId || !doubt) {
      res.status(400).json({ success: false, error: "lessonId, goalId, and doubt are required" });
      return;
    }

    const result = await teacherService.answerStudentDoubt(goalId, lessonId, doubt);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error("[TeacherController] Failed to answer student doubt", {
      error: error.message || String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while answering student doubt",
    });
  }
}

/**
 * GET /curriculum/lesson/:lessonId/quiz
 * Returns or generates the 3-question evaluation quiz for a lesson.
 */
export async function getLessonQuiz(req: Request, res: Response) {
  try {
    const lessonId = getRouteParam(req.params.lessonId);
    if (!lessonId) {
      res.status(400).json({ success: false, error: "Lesson ID is required" });
      return;
    }

    const quiz = await examinerService.getOrGenerateQuiz(lessonId);

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error: any) {
    logger.error("[TeacherController] Failed to fetch lesson quiz", {
      error: error.message || String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching lesson quiz",
    });
  }
}

/**
 * POST /curriculum/activity/:activityId/submit
 * Grades the user's quiz submission and triggers the Adaptive Coach.
 */
export async function submitQuizAnswer(req: Request, res: Response) {
  try {
    const activityId = getRouteParam(req.params.activityId);
    const { answers } = req.body; // Record<number, string>

    if (!activityId || !answers) {
      res.status(400).json({ success: false, error: "activityId and answers object are required" });
      return;
    }

    const result = await examinerService.evaluateQuizSubmission(activityId, answers);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error("[TeacherController] Failed to grade quiz submission", {
      error: error.message || String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error while grading quiz submission",
    });
  }
}
