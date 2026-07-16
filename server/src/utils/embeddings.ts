import { GoogleGenAIEmbeddings } from "@langchain/google-genai";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

// Initialize Google GenAI Embeddings client (free-tier text-embedding-004 model)
export const embeddingsClient = new GoogleGenAIEmbeddings({
  apiKey: env.GOOGLE_API_KEY,
  modelName: "text-embedding-004", // 768 dimensions
});

/**
 * Generates an embedding vector for a single query text.
 */
export async function embedQuery(text: string): Promise<number[]> {
  try {
    const vector = await embeddingsClient.embedQuery(text);
    return vector;
  } catch (error) {
    logger.error("Failed to generate embedding for query", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Generates embedding vectors for an array of document chunks.
 */
export async function embedDocuments(chunks: string[]): Promise<number[][]> {
  try {
    const vectors = await embeddingsClient.embedDocuments(chunks);
    return vectors;
  } catch (error) {
    logger.error("Failed to generate embeddings for document chunks", {
      error: error instanceof Error ? error.message : String(error),
      count: chunks.length,
    });
    throw error;
  }
}
