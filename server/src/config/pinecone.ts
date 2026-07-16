import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Initialize Pinecone Client
export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

// Select the index to query/upsert
export const pineconeIndex = pinecone.Index(env.PINECONE_INDEX);

/**
 * Verifies if the Pinecone index exists and is reachable.
 */
export async function testPineconeConnection() {
  try {
    const description = await pinecone.describeIndex(env.PINECONE_INDEX);
    logger.info(`Pinecone connection successful - Index: ${description.name}`);
    return true;
  } catch (error) {
    logger.error("Pinecone connection failed. Make sure the index exists.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
