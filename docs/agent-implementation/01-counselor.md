# Counselor Agent Implementation Specification

## 1. Overview
The **Counselor Agent** manages the intake phase of the user's learning journey. It accepts the student's high-level goal, timeline, and category constraints, and drives a dynamic, personalized interview session to uncover background, goals, and learning preferences.

* **Execution Context**: LangGraph Node (`counselorNode` in `server/src/graph/nodes/counselor.node.ts`).
* **Trigger Event**: Express route `POST /curriculum/start` initializes the session record, followed by the WebSocket `start-interview` event to launch the graph.
* **Communication Protocol**: WebSocket events (`interview-question`, `submit-answer`, `interview-completed`).

---

## 2. Zod Generation Schema
On the first turn (Turn 0), the Counselor calls Gemini using structured output to generate 4-5 dynamic questions customized for the raw goal text.

```typescript
import { z } from "zod";

export const questionGeneratorSchema = z.object({
  questions: z
    .array(z.string().min(10))
    .min(3)
    .max(5)
    .describe("Exactly 3 to 5 highly relevant follow-up questions tailored to customize the goal path"),
});
```

---

## 3. Prompt Template
```
You are the Counselor Agent for AstraLearn AI, a personal autonomous AI school.
The student has submitted the following learning goal:
Goal: "{goalText}"
Category: "{category}"
Duration: {durationDays} days

Generate exactly 4 highly contextual follow-up questions to customize their learning path.
Your questions should target:
1. Their baseline level in key technologies or topics related to the goal (e.g. if learning RAG, ask about Python/Database experience).
2. Their preferred balance between theoretical concepts and hands-on practical/coding work.
3. Their primary learning style preference (e.g., visual flowcharts, reading documentation, step-by-step programming tasks).
4. Their final target outcome (e.g., portfolio project deployment, mock interview prep, or school board exam numericals).

Do not ask generic questions. Personalize them to the specific domain of the goal.
```

---

## 4. Execution Logic
1. **Turn 0 (Initialization)**:
   - Check if `counselorQuestions` array is empty.
   - Run the dynamic question generator prompt via `llm.withStructuredOutput()`.
   - Store the list of questions in `counselorQuestions` in the graph state.
   - Save the first question in the conversation history and return it to the client.
2. **Subsequent Turns**:
   - Append the user's answer (`lastUserResponse`) to the conversation log.
   - Increment `currentQuestionIndex`.
   - If the index matches the questions list length:
     - Mark `isComplete` as `true` (triggering automatic routing to the Profiler Agent).
   - Else:
     - Fetch the next question from the list, append it to the conversation, and dispatch it to the user.

---

## 5. Database & State Interactions
* **State Updates**: Updates `counselorQuestions`, `currentQuestionIndex`, `conversation`, and `isComplete`.
* **PostgreSQL Sync**: Sockets store the updated state in the PostgreSQL `Profile` table:
  - `counselorQuestions` ➔ Persistent list.
  - `interviewChat` ➔ Chat history JSON column.
