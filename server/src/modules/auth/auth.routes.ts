import { Router } from "express";
import * as authController from "./auth.controller.js";

export const authRouter: Router = Router();

// Registration route
authRouter.post("/signup", authController.signup);

// Login route
authRouter.post("/login", authController.login);
