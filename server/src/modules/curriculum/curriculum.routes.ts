import { Router } from "express";
import * as curriculumController from "./curriculum.controller.js";
import * as teacherController from "../teacher/teacher.controller.js";
import { authenticateToken } from "../auth/auth.middleware.js";

export const curriculumRouter: Router = Router();

// Route to initialize curriculum session & goals
curriculumRouter.post("/start", authenticateToken, curriculumController.startCurriculumSession);

// Step Trigger Routes (Progressive User-Triggered Pipeline)
curriculumRouter.post("/trigger-profiler", authenticateToken, curriculumController.triggerProfilerHandler);
curriculumRouter.post("/trigger-librarian", authenticateToken, curriculumController.triggerLibrarianHandler);
curriculumRouter.post("/trigger-architect", authenticateToken, curriculumController.triggerArchitectHandler);
curriculumRouter.post("/trigger-schedule", authenticateToken, curriculumController.triggerScheduleHandler);
curriculumRouter.post("/trigger-rag-index", authenticateToken, curriculumController.triggerRagIndexingHandler);

// Interview routes
curriculumRouter.post("/interview/start", authenticateToken, curriculumController.startInterview);
curriculumRouter.post("/interview/answer", authenticateToken, curriculumController.submitInterviewAnswer);
curriculumRouter.get("/interview/:goalId", authenticateToken, curriculumController.getInterviewStatus);

// Classroom, Teacher, Examiner & Coach routes
curriculumRouter.get("/lesson/:lessonId", authenticateToken, teacherController.getLessonDetails);
curriculumRouter.post("/lesson/:lessonId/doubt", authenticateToken, teacherController.submitDoubt);
curriculumRouter.get("/lesson/:lessonId/quiz", authenticateToken, teacherController.getLessonQuiz);
curriculumRouter.post("/activity/:activityId/submit", authenticateToken, teacherController.submitQuizAnswer);

// User Projects, Analytics & Resource Human Intervention routes
curriculumRouter.get("/projects", authenticateToken, curriculumController.getUserProjectsHandler);
curriculumRouter.get("/analytics", authenticateToken, curriculumController.getUserAnalyticsHandler);
curriculumRouter.delete("/project/:goalId", authenticateToken, curriculumController.deleteProjectHandler);
curriculumRouter.patch("/resource/:resourceId/toggle", authenticateToken, curriculumController.toggleResourceStatusHandler);

// Route to fetch compiled curriculum detail roadmap (kept last to prevent route collision with subpaths)
curriculumRouter.get("/:goalId", authenticateToken, curriculumController.getCurriculumDetails);
