# Teacher Agent Implementation Specification

## 1. Overview
The **Teacher Agent** drives the **AI Classroom** experience. It has two main duties:
1. **Lesson Explanation**: On-demand generation of comprehensive study guides formatted in Markdown, tailored to the student's profile baseline and preferred style.
2. **Interactive Doubt Resolution**: Grounded QA bot answering student doubts using a **Retrieval-Augmented Generation (RAG)** pipeline backed by Pinecone.
3. **Visual Diagram Support**: Collaborates with the **Visual Explainer Agent** to generate Mermaid.js diagram codes (`graph TD`, `sequenceDiagram`) for visual learners.

* **Execution Context**: Express controller (`GET /curriculum/lesson/:lessonId`) & WebSocket Doubt Room.
* **WebSocket Events**: `submit-doubt` (client input), `doubt-started`, `doubt-completed` (streaming/final answers).

---

## 2. Dynamic Doubt-Answering (RAG Flow - Method 1 Scoped)
To prevent hallucinations and cross-lesson contamination, the Teacher bases its answers strictly on the verified sources mapped to the active lesson in PostgreSQL.

```
[Student Doubt] ➔ [gemini-embedding-2 (1024 dims)] ➔ [Pinecone Query with resourceId: { $in: [...] } Filter]
      ➔ [Retrieve Top 5 Chunks] ➔ [Grounded LLM Prompt] ➔ [Emit Answer over WebSocket / REST]
```

### Prompt Template (RAG Doubt QA)
```
You are the Teacher Agent for AstraLearn AI. Answer the student's question/doubt:
Question: "{studentDoubt}"

Base your answer strictly on the following verified course excerpts:
------------------
{retrievedContextChunks}
------------------

Guidelines:
1. Answer the question clearly, concisely, and simply.
2. If the answer cannot be found in the context excerpts above, state:
   "I cannot verify that answer from your course materials. Let me focus on what is in your verified resources..."
   and explain what you CAN find, or ask them to rephrase. Do not make up facts.
3. Cite the source title where the info was extracted.
```

---

## 3. Lesson Content Generation Prompt
Generated on-demand when a student opens a lesson:
```
You are the Teacher Agent for AstraLearn AI.
Write a comprehensive study guide for lesson "{lessonTitle}".
Student Profile:
- Experience Baseline: {skillBaselineText}
- Preferred Style: {learningStyle}
- Weak Areas to Address: {weakAreasText}

Verified Source Context:
------------------
{resourceExcerpts}
------------------

Explain the concept simply. Show key takeaways. Include code snippets or step-by-step breakdowns.
```

---

## 4. Execution & Streaming Logic
1. **Doubt Ingestion**: Socket listener captures `submit-doubt` containing `{ goalId, lessonId, doubt }`.
2. **Context Query**:
   - Query PostgreSQL for resources linked to `lessonId`.
   - Call `embeddingsClient.embedQuery(doubt)` using `gemini-embedding-2` (1024 dimensions).
   - Query Pinecone Index filtering vectors by metadata: `resourceId: { $in: activeLessonResourceIds }`.
   - Retrieve top 5 matching text excerpts.
3. **Answer Generation**:
   - Construct the RAG prompt.
   - Invoke Gemini (`llm.invoke()`).
   - Emit `doubt-completed` containing the answer string and cited source titles.
