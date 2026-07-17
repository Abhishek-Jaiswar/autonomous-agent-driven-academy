import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Extended Express Request interface containing type-safe user fields
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to authenticate requests via JWT Bearer Tokens.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"
  
  // Extract token from cookie (preferred) or Bearer header (fallback)
  const token = req.cookies?.token || bearerToken;

  if (!token) {
    logger.warn("[AuthMiddleware] Authentication token missing in cookies and headers");
    res.status(401).json({
      success: false,
      error: "Authentication token required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };
    
    // Attach credentials to request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error("[AuthMiddleware] JWT token verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(403).json({
      success: false,
      error: "Invalid or expired authentication token",
    });
  }
}
