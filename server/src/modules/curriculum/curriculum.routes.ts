import { Router } from "express";
import * as curriculumController from "./curriculum.controller.js";
import { authenticateToken } from "../auth/auth.middleware.js";

export const curriculumRouter: Router = Router();

// Route to initialize curriculum session & goals
curriculumRouter.post("/start", authenticateToken, curriculumController.startCurriculumSession);

// Route to fetch compiled curriculum detail roadmap
curriculumRouter.get("/:goalId", authenticateToken, curriculumController.getCurriculumDetails);
