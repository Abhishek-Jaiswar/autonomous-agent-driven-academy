# Examiner Agent Implementation Specification

## 1. Overview
The **Examiner Agent** is responsible for testing user retention. It generates assessments (Multiple Choice Questions or coding practical templates) tied to the active lesson, evaluates student submissions, calculates scores, and compiles feedback detailing strengths and weak topics.

* **Execution Context**: Express Controllers:
  1. `GET /classroom/quiz/:lessonId` (Generates or retrieves a quiz).
  2. `POST /classroom/quiz/submit` (Grades the test and triggers the Adaptive Coach if necessary).
* **Database Target**: `Activity` and `Attempt` tables.

---

## 2. Zod Generation Schema
The Examiner uses structured output to construct the quiz payload.

```typescript
import { z } from "zod";

// MCQ Quiz Structure
export const quizGeneratorSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().describe("Unique identifier (e.g. q1, q2)"),
      question: z.string(),
      options: z.array(z.string()).length(4).describe("Exactly 4 options"),
      correctOptionIndex: z.number().int().min(0).max(3),
      explanation: z.string().describe("Explanation why this option is correct"),
      conceptTag: z.string().describe("Specific concept tested (e.g. 'chunking', 'embeddings')"),
    })
  ).length(3).describe("Exactly 3 questions testing core concepts of the lesson"),
});
```

---

## 3. Prompts

### Quiz Generation Prompt
```
You are the Examiner Agent for AstraLearn AI.
Design exactly 3 Multiple Choice Questions to test the user's understanding of:
Lesson: "{lessonTitle}"
Lesson Content:
{lessonContent}

Ensure each question tests a specific concept, has exactly 4 options, and includes a detailed explanation.
Output the questions as structured JSON.
```

### Quiz Evaluation Prompt (For essay/code exercises, if applicable)
```
You are the Examiner Agent. Evaluate this student submission for the practical task:
Task: "{taskDescription}"
Submission: "{userCodeSubmission}"

Score the attempt out of 100. Identify their strengths and weak areas.
Output as structured JSON containing 'score', 'feedback', 'strengths', and 'weakAreas'.
```

---

## 4. Execution Flow
1. **Quiz Fetching**:
   - Client requests `GET /classroom/quiz/:lessonId`.
   - Check if an `Activity` of type `QUIZ` already exists for the lesson.
   - If not, call Gemini to generate the 3 MCQs, save to `Activity.payload`, and return it.
2. **Quiz Submission**:
   - Client POSTs to `POST /classroom/quiz/submit` with `{ activityId, answers: { [questionId]: selectedIndex } }`.
   - The controller checks the answers against the correct indices stored in `Activity.payload`.
   - Calculates the score (e.g., 2 correct out of 3 = 66%).
   - Identifies which concepts the user missed (based on `conceptTag` of failed questions).
   - Writes the score, user selections, and weak areas into the `Attempt` table.
   - If score is `>= 70%`:
     - Updates the current `Lesson.status` to `COMPLETED` and unlocks the next lesson.
   - If score is `< 70%`:
     - Hands control immediately to the **Adaptive Coach Agent** to restructure the upcoming path.
