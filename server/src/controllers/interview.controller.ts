import type { Request, Response } from "express";
import {
  StartInterviewSchema,
  SubmitAnswerSchema,
} from "../types/interview.types.js";
import * as interviewService from "../services/interview.service.js";
import { logger } from "../utils/logger.js";

/**
 * Interview Controller
 *
 * Handles the HTTP layer — validates inputs, calls the service,
 * and shapes the JSON response.
 *
 * Principles:
 *  - Controllers are thin. All business logic lives in the service.
 *  - Every request is validated with Zod before reaching the service.
 *  - Express v5 catches async errors automatically — no try/catch needed here.
 *  - Responses always follow { success, data } or { success, error } shape.
 */

// ─── POST /interview/start ─────────────────────────────────────────────────────

export async function startInterview(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = StartInterviewSchema.safeParse(req.body);

  if (!parsed.success) {
    logger.warn("[startInterview] Invalid request body", parsed.error.issues);
    res.status(400).json({
      success: false,
      error: "Invalid request body",
      details: parsed.error.issues,
    });
    return;
  }

  const result = await interviewService.startInterview(parsed.data);

  res.status(201).json({
    success: true,
    data: result,
  });
}

// ─── GET /interview/:id ────────────────────────────────────────────────────────

export async function getInterview(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: "Interview ID is required",
    });
    return;
  }

  const interview = interviewService.getInterview(id);

  if (!interview) {
    res.status(404).json({
      success: false,
      error: `Interview session "${id}" not found`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: interview,
  });
}

// ─── GET /interview (list — debug only) ───────────────────────────────────────

export async function listInterviews(
  _req: Request,
  res: Response
): Promise<void> {
  const ids = interviewService.listInterviews();
  const count = interviewService.getSessionCount();

  res.status(200).json({
    success: true,
    data: {
      count,
      interviewIds: ids,
    },
  });
}

// ─── POST /interview/message ───────────────────────────────────────────────────

export async function submitAnswer(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = SubmitAnswerSchema.safeParse(req.body);

  if (!parsed.success) {
    logger.warn("[submitAnswer] Invalid request body", parsed.error.issues);
    res.status(400).json({
      success: false,
      error: "Invalid request body",
      details: parsed.error.issues,
    });
    return;
  }

  const result = await interviewService.submitAnswer(parsed.data);

  res.status(200).json({
    success: true,
    data: result,
  });
}

