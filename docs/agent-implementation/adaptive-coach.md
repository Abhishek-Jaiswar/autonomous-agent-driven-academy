# Adaptive Coach Agent Implementation Specification

## 1. Overview
The **Adaptive Coach Agent** drives personalization. When a student fails a lesson's assessment (scoring `< 70%`), the Coach intercept occurs. It analyzes the missed concepts, designs a targeted remedial lesson, inserts it directly into the student's active database syllabus, and redirects their immediate schedule to review this concept before they can proceed.

* **Execution Context**: Inside the Quiz Submit Controller logic (`POST /classroom/quiz/submit`).
* **Trigger Event**: Evaluator records an assessment score below 70%.
* **Database Action**: Injects a new `Lesson` record and updates `Profile.weakAreas`.

---

## 2. Zod Remedial Lesson Generation Schema
The Coach uses Gemini structured outputs to generate the remedial lesson skeleton.

```typescript
import { z } from "zod";

export const remedialLessonSchema = z.object({
  title: z.string().describe("e.g. Remedial Review: Embeddings & Vector Matching"),
  content: z.string().describe("Detailed, simplified educational explanation addressing the failed concepts"),
  suggestedPractical: z.string().optional().describe("A simple mini-task to test the remedial concept"),
  diagramMermaid: z.string().optional().describe("Raw Mermaid.js diagram illustrating the concept"),
});
```

---

## 3. Prompt Template
```
You are the Adaptive Coach Agent for AstraLearn AI, a personal autonomous AI school.
The student has failed the quiz for lesson: "{lessonTitle}".
Their answers show they are struggling with these specific concepts:
{missedConceptsList}

Design a targeted, highly simplified remedial review lesson to clear up their confusion.
Provide a clear, detailed conceptual explanation, a simple diagram (Mermaid.js code), and a small practical exercise.
Output the remedial lesson as structured JSON.
```

---

## 4. Execution Logic (Database Integration)
To apply the adaptive change safely, the controller runs a database transaction:

1. **Weakness Registration**: Appends the missed concepts to the student's `Profile.weakAreas` array in PostgreSQL.
2. **Remedial Lesson Generation**: Calls the Gemini API using `remedialLessonSchema` to construct the review lesson.
3. **Database Insertion**:
   - Fetches the active lesson's details (specifically its `moduleId` and `order`).
   - Increments the `order` of all upcoming lessons in the same module by 1 to make room.
   - Inserts the new remedial lesson with `status: "UNLOCKED"` and an `order` set to `failedLesson.order + 1`.
   - Sets the failed lesson's status to `COMPLETED` (or resets it, but to prevent blocks, we mark the failed lesson as complete and direct the student to the remedial lesson as their next step).
4. **WebSocket Notification**:
   - Emits a `remediation-applied` event containing the new lesson details to the student's socket room.
   - Emits an `agent-log` log: `"Adaptive Coach adjusted your path by adding Remedial Lesson: ${remedialLesson.title}"`.
