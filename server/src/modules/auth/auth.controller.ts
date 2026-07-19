import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service.js";
import { logger } from "../../utils/logger.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

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
    const isProduction = process.env.NODE_ENV === "production";

    // Set cookie containing the JWT token
    res.cookie("token", authData.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching JWT expiration)
    });

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        user: authData.user,
      },
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

/**
 * Controller for user logout.
 */
export async function logout(req: Request, res: Response) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("[AuthController] Logout error", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal logout error",
    });
  }
}

/**
 * Controller to retrieve current authenticated user details.
 */
export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    logger.error("[AuthController] GetMe error", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
