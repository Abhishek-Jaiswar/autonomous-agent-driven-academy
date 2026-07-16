import type { Request, Response } from "express";
import { z } from "zod";
import { curriculumService } from "./curriculum.service.js";
import { logger } from "../../utils/logger.js";

// Input validation schema for starting a curriculum session
const startCurriculumSchema = z.object({
  email: z.string().email(),
  goalText: z.string().min(10),
  category: z.enum(["exam_prep", "job_project", "school_subject"]),
  durationDays: z.number().int().min(1).max(365),
});

/**
 * Handles the registration of a new learning goal and setups placeholders.
 */
export async function startCurriculumSession(req: Request, res: Response) {
  try {
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

    const { email, goalText, category, durationDays } = result.data;

    // Delegate to service
    const session = await curriculumService.startSession(email, goalText, category, durationDays);

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
