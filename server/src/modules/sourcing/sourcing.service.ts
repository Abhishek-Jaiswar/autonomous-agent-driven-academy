import { z } from "zod";
import { llm } from "../../llm/model.js";
import { db } from "../../config/database.js";
import { pineconeIndex } from "../../config/pinecone.js";
import { embeddingsClient } from "../../utils/embeddings.js";
import { sourceTrustVerificationPrompt } from "../../llm/prompts/source-verifier/source-verifier.prompt.js";
import { librarianQueryPrompt } from "../../llm/prompts/librarian/librarian.prompt.js";
import { logger } from "../../utils/logger.js";

// Zod schema for structured Gemini SourceTrust evaluation outputs
export const trustScoringSchema = z.object({
  resources: z.array(
    z.object({
      title: z.string().describe("Title of the resource"),
      url: z.string().describe("URL link of the resource"),
      type: z.string().describe("Type of resource (e.g., official_doc, slide, blog)"),
      trustScore: z.number().int().min(0).max(100).describe("Heuristic trust score from 0 to 100"),
      trustLabel: z.enum(["Verified", "Strong", "Caution", "Rejected"]).describe("Trust classification label"),
      reason: z.string().describe("Clear reason detailing the score calculation"),
      status: z.enum(["INCLUDED", "REJECTED"]).describe("INCLUDED if score >= 50, otherwise REJECTED"),
    })
  ),
});

export type EvaluatedResourceInput = z.infer<typeof trustScoringSchema>["resources"][number];

// High-quality mock study content library matching candidate URLs
const MOCK_RESOURCE_CONTENTS: Record<string, string> = {
  "https://platform.openai.com/docs/guides/embeddings": `
  OpenAI Embeddings Guide.
  An embedding is a vector (list) of floating point numbers. The distance between two vectors measures their relatedness.
  Small distances suggest high relatedness, while large distances suggest low relatedness.
  To get an embedding, send your text string to the embeddings API endpoint along with the choice of embedding model (e.g. text-embedding-3-small).
  The response contains the vector floats.
  Use Cases: Embeddings are commonly used for Search (ranking results by relevance to a query), Clustering (grouping text similarity),
  Recommendations (recommending items with related text), Anomaly detection (identifying outliers), and Classification.
  `,
  "https://docs.pinecone.io/guides/get-started/overview": `
  Pinecone Vector Database Overview.
  Pinecone is a cloud-native vector database designed to search, store, and query high-dimensional vector embeddings.
  Vector databases store vectors alongside metadata (e.g., text, labels) and query them using similarity metrics like Cosine Similarity, Dot Product, or Euclidean Distance.
  An index is the highest-level organizational unit in Pinecone. You create an index, specify the dimension size (e.g., 768 or 1536), and upload records.
  Each record consists of a unique ID, the floating-point vector values, and a metadata JSON payload.
  Pinecone supports real-time upserts and queries. You can filter queries by metadata key-value constraints.
  `,
  "https://web.stanford.edu/class/cs224n/slides/cs224n-lecture11.pdf": `
  Stanford CS224N Lecture: Word Vectors and Semantic Matching.
  Traditional NLP represented words as discrete symbols (one-hot vectors), which fails to capture semantic similarity (e.g., "hotel" and "motel" have orthogonal vectors).
  Word2Vec represents words as dense, low-dimensional vectors trained to predict context words in a sliding window.
  This distributes word meanings into vector dimensions, capturing linguistic patterns (e.g., vector("king") - vector("man") + vector("woman") = vector("queen")).
  In modern Information Retrieval (Dense Retrieval), documents are chunked and converted to vectors using pre-trained Transformer encoders (dense vectors).
  Semantic search compares the query vector to document vectors, retrieving documents based on conceptual meaning rather than exact keyword overlap.
  `,
};

const searchTermsSchema = z.object({
  queries: z.array(z.string()).min(1).max(3).describe("Search terms/phrases for academic and documentation lookup"),
});

/**
 * Dynamic content storage mapping URLs to their fetched HTML/text content
 * so that they can be read during the vector indexing phase.
 */
const RETRIEVED_CONTENT_CACHE: Record<string, string> = {};

/**
 * Searches Wikipedia and returns the top matching page with its introductory text.
 */
async function fetchWikipediaResources(query: string): Promise<Array<{ title: string; url: string; type: string; content: string }>> {
  try {
    logger.info(`[Librarian] Querying Wikipedia search API for: "${query}"`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    
    const searchData = (await searchRes.json()) as any;
    const searchResults = searchData?.query?.search || [];
    if (searchResults.length === 0) return [];

    // Get the top result details
    const topResult = searchResults[0];
    const pageTitle = topResult.title;
    const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
    
    // Fetch summary text
    logger.info(`[Librarian] Querying Wikipedia summary for page: "${pageTitle}"`);
    const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return [];
    
    const summaryData = (await summaryRes.json()) as any;
    const pages = summaryData?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const extractText = pageId ? pages[pageId]?.extract || "" : "";
    
    if (!extractText) return [];
    
    RETRIEVED_CONTENT_CACHE[pageUrl] = extractText;
    
    return [{
      title: `Wikipedia: ${pageTitle}`,
      url: pageUrl,
      type: "official_doc",
      content: extractText,
    }];
  } catch (error) {
    logger.error(`[Librarian] Failed to fetch Wikipedia resources for query "${query}"`, { error });
    return [];
  }
}

/**
 * Searches arXiv XML API and returns matching papers.
 */
async function fetchArxivResources(query: string): Promise<Array<{ title: string; url: string; type: string; content: string }>> {
  try {
    logger.info(`[Librarian] Querying arXiv search API for: "${query}"`);
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=2`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const xmlText = await res.text();
    const entries: Array<{ title: string; url: string; type: string; content: string }> = [];
    
    // Simple regex parsing of the Atom XML feed to avoid third-party parser dependencies
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entryContent = match[1];
      if (!entryContent) continue;
      const titleMatch = entryContent.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entryContent.match(/<summary>([\s\S]*?)<\/summary>/);
      const idMatch = entryContent.match(/<id>([\s\S]*?)<\/id>/);
      
      if (titleMatch && titleMatch[1] && summaryMatch && summaryMatch[1] && idMatch && idMatch[1]) {
        const paperTitle = titleMatch[1].replace(/\s+/g, " ").trim();
        const abstract = summaryMatch[1].replace(/\s+/g, " ").trim();
        const paperUrl = idMatch[1].trim();
        
        RETRIEVED_CONTENT_CACHE[paperUrl] = abstract;
        
        entries.push({
          title: `arXiv Paper: ${paperTitle}`,
          url: paperUrl,
          type: "lecture", // Fits university/academic category
          content: abstract,
        });
      }
    }
    
    return entries;
  } catch (error) {
    logger.error(`[Librarian] Failed to fetch arXiv resources for query "${query}"`, { error });
    return [];
  }
}

export const sourcingService = {
  /**
   * Librarian Agent: Formulates and discovers candidate resources dynamically based on goal and profile.
   */
  async discoverCandidateResources(goalText: string, category: string, weakAreas: string[]) {
    logger.info(`[Librarian] Discovering candidates for goal: "${goalText}"`);

    // 1. Generate search terms using LLM
    const structuredLlm = llm.withStructuredOutput(searchTermsSchema);
    const formattedPrompt = await librarianQueryPrompt.format({
      goalText,
      category,
      weakAreasList: weakAreas.length > 0 ? weakAreas.join(", ") : "none",
    });
    
    let searchQueries: string[] = [goalText];
    try {
      const llmResult = await structuredLlm.invoke(formattedPrompt);
      if (llmResult && Array.isArray(llmResult.queries) && llmResult.queries.length > 0) {
        searchQueries = llmResult.queries;
        logger.info(`[Librarian] Generated queries: ${searchQueries.join(", ")}`);
      }
    } catch (err) {
      logger.error("[Librarian] Failed to generate search queries via LLM. Using goal text as query.", { err });
    }

    // 2. Query both APIs for each search query
    const candidateList: Array<{ title: string; url: string; type: string }> = [];
    
    for (const query of searchQueries) {
      // Wikipedia search
      const wikiResults = await fetchWikipediaResources(query);
      candidateList.push(...wikiResults.map(r => ({ title: r.title, url: r.url, type: r.type })));
      
      // arXiv search
      const arxivResults = await fetchArxivResources(query);
      candidateList.push(...arxivResults.map(r => ({ title: r.title, url: r.url, type: r.type })));
      
      // Sleep briefly to respect arXiv rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Fallback to mock resources if absolutely nothing was found
    if (candidateList.length === 0) {
      logger.warn("[Librarian] Live search returned 0 candidates. Falling back to pre-filtered RAG catalog.");
      const fallbacks = [
        {
          title: "OpenAI Embeddings Documentation",
          url: "https://platform.openai.com/docs/guides/embeddings",
          type: "official_doc",
        },
        {
          title: "Pinecone Vector Database Getting Started",
          url: "https://docs.pinecone.io/guides/get-started/overview",
          type: "official_doc",
        },
        {
          title: "Stanford CS224N Lecture on Vector Semantic Models",
          url: "https://web.stanford.edu/class/cs224n/slides/cs224n-lecture11.pdf",
          type: "slide",
        }
      ];
      // Seed fallback contents in the cache
      RETRIEVED_CONTENT_CACHE["https://platform.openai.com/docs/guides/embeddings"] = MOCK_RESOURCE_CONTENTS["https://platform.openai.com/docs/guides/embeddings"] || "";
      RETRIEVED_CONTENT_CACHE["https://docs.pinecone.io/guides/get-started/overview"] = MOCK_RESOURCE_CONTENTS["https://docs.pinecone.io/guides/get-started/overview"] || "";
      RETRIEVED_CONTENT_CACHE["https://web.stanford.edu/class/cs224n/slides/cs224n-lecture11.pdf"] = MOCK_RESOURCE_CONTENTS["https://web.stanford.edu/class/cs224n/slides/cs224n-lecture11.pdf"] || "";
      return fallbacks;
    }

    logger.info(`[Librarian] Discovered ${candidateList.length} candidate resources dynamically.`);
    return candidateList;
  },

  /**
   * Source Verifier: Evaluates discovered resources using SourceTrust heuristics.
   */
  async verifyCandidateResources(candidates: Array<{ title: string; url: string; type: string }>) {
    logger.info(`[SourceVerifier] Evaluating ${candidates.length} candidates using SourceTrust heuristics...`);

    const structuredLlm = llm.withStructuredOutput(trustScoringSchema);
    
    // Format the candidate items list for the prompt
    const candidatesListText = candidates
      .map((c, i) => `Resource #${i + 1}:\n- Title: ${c.title}\n- URL: ${c.url}\n- Type: ${c.type}`)
      .join("\n\n");

    const formattedPrompt = await sourceTrustVerificationPrompt.format({
      candidateResourcesList: candidatesListText,
    });

    const response = await structuredLlm.invoke(formattedPrompt);
    logger.info(`[SourceVerifier] Completed evaluation. Verified: ${response.resources.filter(r => r.status === "INCLUDED").length} included, ${response.resources.filter(r => r.status === "REJECTED").length} rejected.`);
    return response.resources;
  },

  /**
   * Splits a source document text into overlapping chunks.
   */
  splitTextIntoChunks(text: string, chunkSize = 500, overlap = 100): string[] {
    const chunks: string[] = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      start += chunkSize - overlap;
    }
    return chunks;
  },

  /**
   * Chunk, embed, and index a verified resource into Pinecone, and persist metadata in PostgreSQL.
   */
  async indexResource(goalId: string, resourceInput: EvaluatedResourceInput) {
    logger.info(`[SourcingService] Indexing resource: "${resourceInput.title}" (Status: ${resourceInput.status})`);

    // 1. Persist the Resource metadata in PostgreSQL
    const dbResource = await db.resource.create({
      data: {
        goalId,
        title: resourceInput.title,
        url: resourceInput.url,
        type: resourceInput.type,
        trustScore: resourceInput.trustScore,
        trustLabel: resourceInput.trustLabel,
        reason: resourceInput.reason,
        status: resourceInput.status,
      },
    });

    // 2. If status is REJECTED, do not index in the Vector Database (Pinecone)
    if (resourceInput.status === "REJECTED") {
      logger.info(`[SourcingService] Skipped vector indexing for rejected resource: ${resourceInput.url}`);
      return dbResource;
    }

    // 3. Retrieve text content (fetches dynamic summary from cache or fallback)
    const content = RETRIEVED_CONTENT_CACHE[resourceInput.url || ""] || MOCK_RESOURCE_CONTENTS[resourceInput.url || ""] || `Study guide for ${resourceInput.title}. Please refer to the official link at ${resourceInput.url}.`;

    // 4. Split content into overlapping chunks
    const chunks = this.splitTextIntoChunks(content, 600, 100);
    logger.info(`[SourcingService] Split "${resourceInput.title}" into ${chunks.length} chunks. Generating embeddings...`);

    // 5. Generate embeddings and upload to Pinecone
    const vectorsToUpsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i] || "";
      
      // Generate vector representation
      const embeddingResult = await embeddingsClient.embedQuery(chunkText);

      vectorsToUpsert.push({
        id: `${dbResource.id}_chunk_${i}`,
        values: embeddingResult,
        metadata: {
          goalId,
          resourceId: dbResource.id,
          title: dbResource.title,
          text: chunkText,
        },
      });
    }

    // Upsert batch to Pinecone index
    if (vectorsToUpsert.length > 0) {
      await pineconeIndex.upsert({
        records: vectorsToUpsert
      });
      logger.info(`[SourcingService] Successfully upserted ${vectorsToUpsert.length} vectors to Pinecone for resourceId [${dbResource.id}]`);
    }

    return dbResource;
  },
};
