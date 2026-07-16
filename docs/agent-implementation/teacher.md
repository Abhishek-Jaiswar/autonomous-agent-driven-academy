# Teacher Agent Implementation Specification

## 1. Overview
The **Teacher Agent** drives the **AI Classroom** experience. It has two main duties:
1. **Lesson Explanation**: Explains complex concepts simply, utilizing markdown styling, based on the verified resources.
2. **Interactive Doubt Resolution**: Acts as a grounded QA bot, answering student doubts using a **Retrieval-Augmented Generation (RAG)** pipeline backed by Pinecone.

* **Execution Context**: Express controller (`GET /classroom/lesson/:lessonId`) & WebSocket Doubt Room.
* **WebSocket Events**: `submit-doubt` (client input), `doubt-chunk` (streaming LLM token outputs).

---

## 2. Dynamic Doubt-Answering (RAG) Flow
To prevent hallucinations, the Teacher must base its answers strictly on the verified sources indexed during the curriculum sourcing phase.

```
[Student Doubt] ➔ [Gemini text-embedding-004] ➔ [Pinecone Similarity query]
      ➔ [Retrieve Top 5 Chunks] ➔ [Grounded LLM Prompt] ➔ [Stream Answer over WebSocket]
```

### Prompt Template (RAG Doubt QA)
```
You are the Teacher Agent for AstraLearn AI, a personal autonomous AI school.
Answer this student's question/doubt:
Question: "{studentDoubt}"

Base your answer strictly on the following verified resource excerpts:
------------------
{retrievedContextChunks}
------------------

Guidelines:
1. Answer the question clearly, concisely, and simply.
2. If the answer cannot be found in the context excerpts above, state:
   "I cannot verify that answer from your course materials. Let me focus on what is in your verified resources..."
   and explain what you *can* find, or ask them to rephrase. Do not make up facts.
3. Cite the source title where the info was extracted.
```

---

## 3. Lesson Content Generation Prompt
If the lesson text is generated on-demand (rather than pre-saved):
```
You are the Teacher Agent. Write a comprehensive study guide for lesson "{lessonTitle}".
Target Audience Profile:
- Skills level: {skillBaseline}
- Preferred Style: {learningStyle}

Explain the concept simply. Show key takeaways. Include code snippets (if practical) or concrete examples.
Base your explanations on: {resourceTitles}.
```

---

## 4. Execution & Streaming Logic
1. **Doubt Ingestion**: Socket listener captures `submit-doubt` containing `{ goalId, lessonId, doubt }`.
2. **Context Query**:
   - Call `embedQuery(doubt)` using the Gemini embeddings utility.
   - Query Pinecone Index filtering vectors by metadata: `{ goalId, lessonId }`.
   - Retrieve top 5 matching text matches.
3. **Streamed Generation**:
   - Construct the RAG prompt.
   - Call Gemini in streaming mode (`llm.stream()`).
   - Emit `doubt-chunk` events containing token strings directly to the session WebSocket room to simulate real-time speaking.
