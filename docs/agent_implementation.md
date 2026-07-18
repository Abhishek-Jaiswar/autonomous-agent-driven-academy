# AstraLearn AI Agent Implementation Reference

This document provides the technical specifications, Zod schemas, prompts, tool definitions, and database operations for each of the 9 AI specialist roles in the **AstraLearn AI** multi-agent backend.

---

## 1. Global State Management (`SchoolState`)

All agent nodes read from and write to a single, serialized state annotation:

```typescript
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface LearnerProfileData {
  goalId: string;
  category: string;
  durationDays: number;
  goalText: string;
  skillBaseline: Record<string, string>;
  learningStyle: "visual" | "practical" | "text" | "balanced";
  weakAreas: string[];
}

export const SchoolStateAnnotation = Annotation.Root({
  goalId: Annotation<string>({ reducer: (_, update) => update }),
  goalText: Annotation<string>({ reducer: (_, update) => update }),
  category: Annotation<string>({ reducer: (_, update) => update }),
  durationDays: Annotation<number>({ reducer: (_, update) => update }),
  
  counselorQuestions: Annotation<string[]>({ reducer: (_, update) => update }),
  currentQuestionIndex: Annotation<number>({ reducer: (current, update) => typeof update === "number" ? update : current + 1 }),
  lastUserResponse: Annotation<string>({ reducer: (_, update) => update }),
  conversation: Annotation<ChatMessage[]>({ reducer: (current, update) => [...current, ...update] }),
  
  profile: Annotation<LearnerProfileData>({ reducer: (_, update) => update }),
  isComplete: Annotation<boolean>({ reducer: (_, update) => update }),
});
```

---

## 2. Agent Node & Worker Specifications

```
+------------------+-----------------------+--------------------+------------------------+
| Agent Role       | Execution Context     | Key Tooling        | Primary Database Match |
+------------------+-----------------------+--------------------+------------------------+
| Counselor        | LangGraph Node        | Zod Output         | Profile.interviewChat  |
| Profiler         | LangGraph Node        | Zod Output         | Profile table          |
| Librarian        | BullMQ Worker         | HTTP Search / API  | Resource table         |
| Source Verifier  | BullMQ Worker         | SourceTrust Skill  | Resource table         |
| Architect        | BullMQ Worker         | Zod JSON Gen       | Phase/Module/Lesson    |
| Scheduler        | BullMQ Worker         | Date Mapping       | Lesson order & status  |
| Teacher          | HTTP / WS Controller  | Pinecone Vector    | Lesson.content         |
| Visual Explainer | HTTP / WS Controller  | Mermaid.js syntax  | Lesson.diagram         |
| Examiner         | HTTP / WS Controller  | Zod MCQ Gen        | Activity & Attempt     |
| Adaptive Coach   | HTTP / WS Controller  | Prisma Transaction | Lesson status override |
+------------------+-----------------------+--------------------+------------------------+
```

---

## 3. Detailed Specifications

### 3.1. Counselor Agent
* **Responsibility**: Run the dynamic intake interview.
* **Context**: LangGraph Node (`counselorNode`).
* **Prompt Template**:
  ```
  You are the Counselor Agent for AstraLearn AI. The student wants to learn: "{goalText}".
  Generate exactly 4 highly contextual follow-up questions to customize their learning path.
  Ask about their technology baseline, format preferences, theory-to-practice ratio, and target output.
  ```
* **Output Schema**:
  ```typescript
  const questionSchema = z.object({
    questions: z.array(z.string()).min(3).max(5)
  });
  ```

### 3.2. Learner Profile Agent (Profiler)
* **Responsibility**: Synthesize the counselor Q&A dialog into a structured user profile.
* **Context**: LangGraph Node (`profilerNode`).
* **Prompt Template**:
  ```
  You are the Learner Profile Agent. Analyze the interview chat logs:
  {chatHistoryText}
  For goal: "{goalText}", extract skill baselines, style preference, and predicted weak areas.
  ```
* **Output Schema**:
  ```typescript
  const profileSchema = z.object({
    skillBaseline: z.array(
      z.object({
        skill: z.string(),
        level: z.string(),
      })
    ),
    learningStyle: z.enum(["visual", "practical", "text", "balanced"]),
    weakAreas: z.array(z.string()),
  });
  ```
* **Database Action**: Updates the `Profile` record matching `goalId`.

### 3.3. Librarian Agent
* **Responsibility**: Search and discover resources based on the user's profile and goal.
* **Context**: BullMQ Worker Task (`generate-curriculum` job).
* **Tooling**: Deep Agents Virtual Filesystem.
* **Database Action**: Saves the initial set of discovered resources to the `Resource` table with status `PENDING`.

### 3.4. Source Verifier Agent (SourceTrust)
* **Responsibility**: Score and filter resources based on credibility metrics.
* **Context**: BullMQ Worker Task (`generate-curriculum` job).
* **Logic (SourceTrust Skill)**:
  - Official/University docs: `+40`/`+35`
  - Anonymous blogs / outdated guides: `-25`/`-20`
  - Scores: `>= 85` (Verified), `70-84` (Strong), `50-69` (Caution), `< 50` (Rejected).
* **Database Action**: Updates `Resource` status to `INCLUDED` or `REJECTED`, writing the trust score and reason.

### 3.5. Curriculum Architect Agent
* **Responsibility**: Outline the hierarchical learning paths (Phases ➔ Modules ➔ Lessons).
* **Context**: BullMQ Worker Task (`generate-curriculum` job).
* **Prompt Template**:
  ```
  You are the Curriculum Architect. Design a structured syllabus for goal "{goalText}".
  Use these verified resources: {includedResources}.
  Design a path divided into logical phases, modules, and lessons.
  ```
* **Output Schema**:
  ```typescript
  const curriculumSchema = z.object({
    phases: z.array(z.object({
      title: z.string(),
      modules: z.array(z.object({
        title: z.string(),
        lessons: z.array(z.object({
          title: z.string(),
          resourcesReferenced: z.array(z.string())
        }))
      }))
    }))
  });
  ```
* **Database Action**: Inserts `Phase`, `Module`, and `Lesson` schemas inside a single `prisma.$transaction`.

### 3.6. Schedule Planner Agent
* **Responsibility**: Schedule the generated lessons chronologically over the student's timeline.
* **Context**: BullMQ Worker Task (`generate-curriculum` job).
* **Logic**: Maps lessons to specific days (e.g. Lesson 1 = Day 1, Lesson 2 = Day 1, Lesson 3 = Day 2) based on the user's available time. Sets the first lesson status to `UNLOCKED` and others to `LOCKED`.

### 3.7. Teacher Agent
* **Responsibility**: Teach the active lesson (on-demand textbook guide generation) and answer students' doubts using scoped RAG.
* **Context**: Express Endpoint (`GET /curriculum/lesson/:lessonId` and `POST /curriculum/lesson/:lessonId/doubt`) & WebSocket `submit-doubt` Listener.
* **QA (RAG) Flow**:
  1. Retrieve student's question/doubt.
  2. Embed using Gemini `gemini-embedding-2` (1024 dimensions).
  3. Query the **Pinecone index** filtering by active lesson resources (`resourceId: { $in: activeLessonResourceIds }`).
  4. Generate grounded answer:
     ```
     You are the Teacher Agent. Answer this doubt: "{studentDoubt}".
     Base your answer strictly on the following verified chunks:
     {retrievedChunks}
     If the answer is not in the text, politely state:
     "I cannot verify that answer from your course materials. Let me focus on what is in your verified resources..."
     and cite source titles.
     ```

### 3.8. Visual Explainer Agent
* **Responsibility**: Generate flowchart diagrams or concept charts for lessons.
* **Context**: Express Endpoint (`GET /classroom/lesson/:lessonId`).
* **Prompt Template**:
  ```
  Generate a Mermaid.js diagram illustrating the core workflow of lesson "{lessonTitle}".
  Output only the raw Mermaid code block (e.g. graph TD...).
  ```
* **Database Action**: Writes the generated code block to the `Lesson.diagram` text column.

### 3.9. Examiner Agent
* **Responsibility**: Generate and evaluate quizzes.
* **Context**: Express Endpoint (`GET /classroom/quiz/:lessonId` and `POST /classroom/quiz/submit`).
* **Prompt (Quiz Gen)**:
  ```
  Generate 3 multiple-choice questions testing the student on lesson "{lessonTitle}".
  Output as JSON.
  ```
* **Database Action**: Inserts Zod questions into `Activity.payload`. On submission, grades the answers, writes scores and feedback into `Attempt`, and sets the lesson status to `COMPLETED`.

### 3.10. Adaptive Coach Agent
* **Responsibility**: Adjust the curriculum path immediately if the student struggles.
* **Context**: Quiz Submit Controller (triggered when `score < 70`).
* **Logic**:
  - Intercepts completion logic.
  - Generates a **Remedial Lesson** outline targeting the weak areas identified.
  - Inserts this new lesson into the database, setting its order to be before the next scheduled lesson.
  - Emits a WebSocket event notifying the user: `"AstraLearn has adapted your path by inserting a remedial review lesson."`

---

## 4. Real-time WebSocket Protocol

All events are piped over the Socket.io connection. Sockets must listen on the student room `goalId` for:

* **`interview-question`**:
  ```json
  {
    "question": "What is your experience level in Python?",
    "questionIndex": 1,
    "totalQuestions": 4
  }
  ```
* **`profile-ready`**:
  ```json
  {
    "goalId": "uuid-here",
    "skillBaseline": { "Python": "intermediate" },
    "learningStyle": "practical",
    "weakAreas": ["embeddings"]
  }
  ```
* **`agent-log`**:
  ```json
  {
    "agentName": "Librarian",
    "message": "Analyzing Stanford CS224N embeddings lecture...",
    "level": "INFO"
  }
  ```
