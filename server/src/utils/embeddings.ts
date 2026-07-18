import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Custom subclass of GoogleGenerativeAIEmbeddings that adds support for the
 * outputDimensionality parameter in the JavaScript SDK, forcing the desired vector size.
 */
// @ts-ignore
class GeminiEmbeddingsWithDimensions extends GoogleGenerativeAIEmbeddings {
  outputDimensionality?: number;

  constructor(fields: any) {
    super(fields);
    this.outputDimensionality = fields?.outputDimensionality;
  }

  // @ts-ignore
  override _convertToContent(text: string) {
    // @ts-ignore
    const base = super._convertToContent(text);
    return {
      ...base,
      outputDimensionality: this.outputDimensionality,
    };
  }
}

// Initialize Google GenAI Embeddings client using gemini-embedding-2 and forcing 1024 dimensions
export const embeddingsClient = new GeminiEmbeddingsWithDimensions({
  apiKey: env.GOOGLE_API_KEY,
  modelName: "gemini-embedding-2",
  outputDimensionality: 1024,
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
