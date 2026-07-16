import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env.js";

/**
 * Centralized LLM instance — the ONLY place we instantiate a model.
 *
 * ⚠️  NEVER do `new ChatGoogleGenerativeAI()` inside a node, service,
 *    or controller. Always import `llm` from this module instead.
 *
 * Why centralized?
 *   - One config change updates the whole system
 *   - LangSmith traces are linked to this single instance
 *   - Easy to swap models (Flash ↔ Pro) per phase
 *   - Dependency injection becomes trivial
 *
 * Model: Gemini 2.5 Flash
 *   ✓ Fast — ideal for real-time interview Q&A
 *   ✓ Cost-efficient for high-turn conversations
 *   ✓ Strong instruction-following for structured outputs
 *
 * Consider switching to `gemini-2.5-pro` for Phase 7 (report generation)
 * where reasoning depth matters more than speed.
 */
export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  temperature: 0.3, // Low temp = deterministic, consistent interview behavior
  apiKey: env.GOOGLE_API_KEY,
});
