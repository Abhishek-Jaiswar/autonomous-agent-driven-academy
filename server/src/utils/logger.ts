import { env } from "../config/env.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// ─── Internals ────────────────────────────────────────────────────────────────

function write(level: LogLevel, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  const formatted = `${prefix} ${message}`;

  const logFn =
    level === "ERROR"
      ? console.error
      : level === "WARN"
        ? console.warn
        : level === "DEBUG"
          ? console.debug
          : console.log;

  if (meta !== undefined) {
    logFn(formatted, meta);
  } else {
    logFn(formatted);
  }
}

// ─── Public Logger ────────────────────────────────────────────────────────────

/**
 * Application logger.
 *
 * Usage:
 *   logger.info("Server started", { port: 3000 })
 *   logger.error("Graph failed", err)
 *
 * Replace with a structured logger (Winston / Pino) before going to production.
 */
export const logger = {
  info: (message: string, meta?: unknown) => write("INFO", message, meta),

  warn: (message: string, meta?: unknown) => write("WARN", message, meta),

  error: (message: string, meta?: unknown) => write("ERROR", message, meta),

  /** Only emits in development — silenced in production/test */
  debug: (message: string, meta?: unknown) => {
    if (env.NODE_ENV === "development") {
      write("DEBUG", message, meta);
    }
  },
};
