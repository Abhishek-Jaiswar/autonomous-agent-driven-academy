import { env } from "./env.js";

/**
 * Configures LangSmith observability tracing.
 *
 * Call once at application startup (in server.ts) before any LLM calls.
 * When LANGCHAIN_API_KEY is absent, this is a complete no-op.
 *
 * To enable: add LANGCHAIN_API_KEY=<your-key> to .env
 * Dashboard: https://smith.langchain.com
 */
export function configureLangSmith(): void {
  if (!env.LANGCHAIN_API_KEY) {
    console.log(
      "ℹ️  LangSmith not configured — add LANGCHAIN_API_KEY to .env to enable tracing."
    );
    return;
  }

  process.env["LANGCHAIN_TRACING_V2"] = "true";
  process.env["LANGCHAIN_API_KEY"] = env.LANGCHAIN_API_KEY;
  process.env["LANGCHAIN_PROJECT"] = env.LANGCHAIN_PROJECT;

  console.log(
    `✅  LangSmith tracing enabled — project: "${env.LANGCHAIN_PROJECT}"`
  );
}
