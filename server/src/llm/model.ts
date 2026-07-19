import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env.js";

/**
 * Centralized LLM instance — the ONLY place we instantiate a model.
 *
 * ⚠️  NEVER do `new ChatGoogleGenerativeAI()` inside a node, service,
 *    or controller. Always import `llm` from this module instead.
 *
 * Model: Gemini 2.5 Flash
 *   ✓ Fast — ideal for real-time interview Q&A
 *   ✓ Cost-efficient for high-turn conversations
 *   ✓ Built-in retries (maxRetries: 3) for API stability
 */
export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3, // Low temp = deterministic, consistent interview behavior
  maxRetries: 3,
  apiKey: env.GOOGLE_API_KEY,
});
