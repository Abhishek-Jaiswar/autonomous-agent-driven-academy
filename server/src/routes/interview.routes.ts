import express, { Router } from "express";
import * as interviewController from "../controllers/interview.controller.js";

/**
 * Interview Router
 *
 * Phase 1 endpoints:
 *   POST /interview/start      → Start a new interview session
 *   GET  /interview/sessions   → List active sessions (debug)
 *   GET  /interview/:id        → Get current interview state
 *
 * Phase 2 endpoints:
 *   POST /interview/message    → Submit a candidate answer, get next question
 *
 * Planned endpoints:
 *   POST /interview/:id/finish → End interview + generate report (Phase 7)
 *
 * Note: static paths (/start, /sessions, /message) must be registered
 * BEFORE the dynamic /:id param to prevent shadowing.
 */

export const interviewRouter: Router = express.Router();

interviewRouter.post("/start", interviewController.startInterview);
interviewRouter.post("/message", interviewController.submitAnswer);
interviewRouter.get("/sessions", interviewController.listInterviews);
interviewRouter.get("/:id", interviewController.getInterview);
