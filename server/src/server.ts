import { createServer } from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { configureLangSmith } from "./config/langsmith.js";
import { logger } from "./utils/logger.js";
import { initSocketServer } from "./config/socket.js";
import { testConnection as testDbConnection } from "./config/database.js";
import { testPineconeConnection } from "./config/pinecone.js";

/**
 * Server Entry Point
 *
 * The only responsibility of this file is to:
 *  1. Run startup side-effects (observability, env validation, diagnostics)
 *  2. Create the Express app wrapped in an HTTP Server
 *  3. Initialize the Socket.io WebSocket server
 *  4. Start listening
 *
 * env.ts validates all required env vars on import and will call
 * process.exit(1) if anything is missing — so by the time we reach
 * httpServer.listen(), the environment is guaranteed to be valid.
 */
async function main(): Promise<void> {
  // Configure LangSmith tracing (no-op if LANGCHAIN_API_KEY not set)
  configureLangSmith();

  // Test Database Connection
  await testDbConnection();

  // Test Pinecone Connection
  await testPineconeConnection();

  const app = createApp();
  const httpServer = createServer(app);

  // Initialize Socket.io Server
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info("─────────────────────────────────────────────");
    logger.info(`🚀  AstraLearn Server running on http://localhost:${env.PORT}`);
    logger.info(`    Environment : ${env.NODE_ENV}`);
    logger.info(`    Health      : http://localhost:${env.PORT}/health`);
    logger.info("─────────────────────────────────────────────");
  });
}

main().catch((err: unknown) => {
  console.error("💥  Fatal startup error:", err);
  process.exit(1);
});
