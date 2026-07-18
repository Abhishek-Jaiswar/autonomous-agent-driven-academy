# Librarian Agent (Resource Discovery) Implementation Specification

## 1. Overview
The **Librarian Agent** is responsible for discovering, indexing, and organizing learning assets (documentation, textbook chapters, university lectures, videos, research papers) related to the user's specific goal and baseline level.

* **Execution Context**: BullMQ Job Worker (`generate-curriculum` job under `server/src/workers/agent.worker.ts`).
* **Trigger Event**: Enqueued by the Profiler Agent on intake completion.
* **Collaboration**: Invokes the **Source Verifier (SourceTrust)** agent to score and validate resources before outputting.

---

## 2. Execution Logic
1. **Search Query Formulation**: Formulates targeted search terms dynamically using Gemini based on the user's specific goal, category, and weak areas.
2. **Resource Retrieval**:
   - Queries live public API endpoints for **Wikipedia** and **arXiv** (using custom search query terms) to discover matching documents and papers.
   - Retries with a local RAG catalog fallback if the web APIs return 0 results.
   - Summaries (Wikipedia page extracts and arXiv abstracts) are temporarily cached in memory to be used during the vector indexing phase.
3. **Draft Registry**: Saves candidate resources to the database `Resource` table with status `PENDING` to establish logs.
4. **Handoff to Verification**: Passes the candidate metadata to the **Source Verifier (SourceTrust)** agent.

---

## 3. Tooling, Vector DB, & Scoping (Method 1)
To prevent cross-lesson context contamination (e.g. searching for a basic concept on Day 1 and returning advanced information from Day 10):
* **Vector DB**: Resources are chunked, embedded via `gemini-embedding-2` (1024 dimensions), and indexed in **Pinecone** with metadata containing `resourceId: dbResource.id`.
* **Lesson Mapping (PostgreSQL)**: The **Curriculum Architect** designs lessons and maps specific resources to them in PostgreSQL (setting `Resource.lessonId`).
* **Sourced Context Retrieval**: Downstream agents (Teacher, Examiner) query PostgreSQL for the current lesson's resources, and then perform a vector query in Pinecone filtered by those specific `resourceId` values.

---

## 4. Database Interactions
* **Resource Inserts**: Writes metadata (title, URL, type) to the `Resource` table linked to the active `Lesson` or `Goal` placeholder.
* **AgentLog Sync**: Creates audit logs (e.g., `"Librarian discovered 8 potential resources dynamically."`).
