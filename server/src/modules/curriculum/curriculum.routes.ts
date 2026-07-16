import { Router } from "express";
import * as curriculumController from "./curriculum.controller.js";

export const curriculumRouter: Router = Router();

// Route to initialize curriculum session & goals
curriculumRouter.post("/start", curriculumController.startCurriculumSession);

// Route to fetch compiled curriculum detail roadmap
curriculumRouter.get("/:goalId", curriculumController.getCurriculumDetails);
