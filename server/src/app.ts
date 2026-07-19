import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { curriculumRouter } from "./modules/curriculum/curriculum.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { logger } from "./utils/logger.js";

/**
 * Express Application Factory
 *
 * Creates and fully configures the Express application.
 * Separated from server.ts so:
 *  - Tests can import the app without starting a real server
 *  - The app is independently testable and composable
 *
 * Middleware stack (in order):
 *  1. CORS         — allow cross-origin requests (restrict in production)
 *  2. JSON body    — parse application/json request bodies
 *  3. Request log  — lightweight per-request logging
 *  4. Routes       — business logic handlers
 *  5. 404 handler  — catch unknown routes
 *  6. Error handler — catch all thrown/async errors (Express v5)
 */
export function createApp(): express.Application {
  const app = express();

  // Trust first proxy (required for Render / cloud reverse proxies to pass HTTPS headers correctly)
  app.set("trust proxy", 1);

  // ── Global Middleware ───────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env["CLIENT_URL"],
    "https://astra-ai-academy.vercel.app",
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") ||
          origin.endsWith(".onrender.com") ||
          process.env["NODE_ENV"] !== "production"
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "10kb" }));

  // ── Request Logging ─────────────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`→ ${req.method} ${req.path}`);
    next();
  });

  // ── Health Check ─────────────────────────────────────────────────────────────
  // Kept at the root level — outside /interview — so load balancers can probe it
  // without triggering interview business logic.
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "adaptive-interview-api",
      version: "1.0.0",
    });
  });

  // ── Feature Routes ────────────────────────────────────────────────────────
  app.use("/auth", authRouter);
  app.use("/curriculum", curriculumRouter);

  // ── 404 Handler ───────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  // ── Global Error Handler ──────────────────────────────────────────────────
  // Express v5: async errors from route handlers are forwarded here automatically.
  // This MUST have exactly 4 parameters for Express to recognize it as an error handler.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(`[UnhandledError] ${err.message}`, err.stack);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      // Expose the raw error message only in development
      ...(process.env["NODE_ENV"] === "development" && {
        details: err.message,
      }),
    });
  });

  return app;
}
