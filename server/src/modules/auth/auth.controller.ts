import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service.js";
import { logger } from "../../utils/logger.js";

// Input validation schemas
const authPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * Controller for registering a new user.
 */
export async function signup(req: Request, res: Response) {
  try {
    const result = authPayloadSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.issues,
      });
      return;
    }

    const { email, password } = result.data;
    const user = await authService.registerUser(email, password);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    logger.error("[AuthController] Signup error", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal signup error",
    });
  }
}

/**
 * Controller for user login.
 */
export async function login(req: Request, res: Response) {
  try {
    const result = authPayloadSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.issues,
      });
      return;
    }

    const { email, password } = result.data;
    const authData = await authService.authenticateUser(email, password);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: authData,
    });
  } catch (error) {
    logger.error("[AuthController] Login error", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid credentials",
    });
  }
}
