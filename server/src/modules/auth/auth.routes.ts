import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticateToken } from "./auth.middleware.js";

export const authRouter: Router = Router();

// Registration route
authRouter.post("/signup", authController.signup);

// Login route
authRouter.post("/login", authController.login);

// Logout route
authRouter.post("/logout", authController.logout);

// Current user profile route
authRouter.get("/me", authenticateToken, authController.getMe);
