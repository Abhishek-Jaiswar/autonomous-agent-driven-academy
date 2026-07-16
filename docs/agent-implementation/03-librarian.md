# Librarian Agent (Resource Discovery) Implementation Specification

## 1. Overview
The **Librarian Agent** is responsible for discovering, indexing, and organizing learning assets (documentation, textbook chapters, university lectures, videos, research papers) related to the user's specific goal and baseline level.

* **Execution Context**: BullMQ Job Worker (`generate-curriculum` job under `server/src/workers/agent.worker.ts`).
* **Trigger Event**: Enqueued by the Profiler Agent on intake completion.
* **Collaboration**: Invokes the **Source Verifier (SourceTrust)** agent to score and validate resources before outputting.

---

## 2. Execution Logic
1. **Search Query Formulation**: Formulates targeted search terms based on the user's goal (e.g. for "RAG Product Recommender", search queries include "embeddings", "vector databases", "recommender retrieval systems").
2. **Resource Retrieval**:
   - *Production/Mock Space*: Queries educational web APIs (Wikipedia, arXiv search APIs, YouTube Search APIs) or loads pre-configured catalog matches from a database cache.
   - *Target Resource formats*: Official documentation pages, university lecture transcripts, PDFs, and video reference links.
3. **Draft Registry**: Saves all candidate resources to the database `Resource` table with status `PENDING` to establish logs.
4. **Handoff to Verification**: Passes the complete list of candidate links and descriptions to the **Source Verifier (SourceTrust)** agent for authenticity checks.

---

## 3. Tooling & Virtual Filesystem
The Librarian Agent leverages the **Deep Agents SDK Virtual Filesystem** to store resource documents:
* Stored in the session workspace (e.g., `workspace/:goalId/resources/`).
* Fetched files (articles, transcripts, slides) are written as text files or PDF markers.
* The file structures enable the **Teacher Agent** to search and retrieve context locally.

---

## 4. Database Interactions
* **Resource Inserts**: Writes metadata (title, URL, type) to the `Resource` table linked to the active `Lesson` or `Goal` placeholder.
* **AgentLog Sync**: Creates an audit log: `"Librarian discovered 8 potential resources for review."`
