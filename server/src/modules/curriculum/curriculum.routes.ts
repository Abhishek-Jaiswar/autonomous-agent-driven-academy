import { Router } from "express";
import * as curriculumController from "./curriculum.controller.js";
import { authenticateToken } from "../auth/auth.middleware.js";

export const curriculumRouter: Router = Router();

// Route to initialize curriculum session & goals
curriculumRouter.post("/start", authenticateToken, curriculumController.startCurriculumSession);

// Route to fetch compiled curriculum detail roadmap
curriculumRouter.get("/:goalId", authenticateToken, curriculumController.getCurriculumDetails);

// Interview routes
curriculumRouter.post("/interview/start", authenticateToken, curriculumController.startInterview);
curriculumRouter.post("/interview/answer", authenticateToken, curriculumController.submitInterviewAnswer);
curriculumRouter.get("/interview/:goalId", authenticateToken, curriculumController.getInterviewStatus);
