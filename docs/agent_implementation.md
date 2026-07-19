# AstraLearn AI Agent Implementation Reference

This document provides the technical specifications, Zod schemas, prompts, tool definitions, and database operations for each of the 10 AI specialist roles in the **AstraLearn AI** multi-agent backend.

---

## 1. Global State Management (`SchoolState`)

All agent nodes read from and write to a single, serialized state annotation (`server/src/graph/state.ts`):

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

export interface VerifiedResourceData {
  url: string;
  title: string;
  snippet: string;
  trustScore: number;
  authorAuthority: number;
  recencyScore: number;
}

export interface EvaluationRecord {
  quizId: string;
  score: number;
  passed: boolean;
  timestamp: string;
}
```

---

## 2. The 10 Specialized Agent Specifications

```
+----+---------------------+-----------------------+--------------------+------------------------+
| ID | Agent Role          | Execution Context     | Key Tooling        | Primary Database Match |
+----+---------------------+-----------------------+--------------------+------------------------+
| 01 | Counselor           | LangGraph Node        | Zod Output / Chat  | Interview table        |
| 02 | Profiler            | LangGraph Node        | Zod JSON Profiler  | LearnerProfile table   |
| 03 | Librarian           | BullMQ Worker         | HTTP / Pinecone    | Resource table         |
| 04 | Source Verifier     | BullMQ Worker         | SourceTrust Skill  | Resource.trustScore    |
| 05 | Architect           | BullMQ Worker         | Zod JSON Syllabus  | Module & Phase tables  |
| 06 | Schedule Planner    | BullMQ Worker         | Date Allocator     | Lesson calendar map    |
| 07 | Master Teacher      | HTTP / WS Controller  | Textbook Writer    | Lesson.content         |
| 08 | Visual Explainer    | HTTP / WS Controller  | Mermaid.js Syntax  | Lesson.diagram         |
| 09 | Examiner            | HTTP / WS Controller  | MCQ Generator      | Quiz & QuizAttempt     |
| 10 | Adaptive Coach      | BullMQ / LangGraph    | Path Recalibration | Module/Lesson (Tx)     |
+----+---------------------+-----------------------+--------------------+------------------------+
```

---

### Agent 01: Intake Counselor (`server/src/graph/nodes/counselor.node.ts`)
- **Objective**: Conduct a dynamic 3-5 turn intake interview to diagnose student targets, timeline, prior experience, and weekly hours.
- **Output Schema**: Returns serialized `ChatMessage` array and triggers transition to Learner Profiler.

### Agent 02: Learner Profiler (`server/src/graph/nodes/profiler.node.ts`)
- **Objective**: Synthesize raw interview transcripts into a structured cognitive learner profile.
- **Output Schema**: Writes to `LearnerProfile` table (baseline skills, friction points, learning modality).

### Agent 03: Librarian Board (`server/src/graph/nodes/librarian.node.ts`)
- **Objective**: Discover academic materials across web endpoints and index embeddings into Pinecone vector storage (`astralearn` index).

### Agent 04: Source Verifier (`server/src/graph/nodes/sourceVerifier.node.ts`)
- **Objective**: Compute multi-attribute SourceTrust scores evaluating Author Authority, Recency, Peer Review, and Domain Credibility.

### Agent 05: Curriculum Architect (`server/src/graph/nodes/curriculum.node.ts`)
- **Objective**: Design hierarchical syllabi with prerequisite dependency chains wrapped in database transactions (`prisma.$transaction`).

### Agent 06: Schedule Planner (`server/src/graph/nodes/schedulePlanner.node.ts`)
- **Objective**: Map curriculum topics onto day-by-day and week-by-week calendars according to target deadlines.

### Agent 07: Master Teacher (`server/src/graph/nodes/teacher.node.ts`)
- **Objective**: Write interactive markdown lessons complete with real-world scenarios, step-by-step logic, and summary notes.

### Agent 08: Visual Explainer (`server/src/graph/nodes/visualExplainer.node.ts`)
- **Objective**: Render clean `Mermaid.js` flowcharts, sequence diagrams, and mind maps inline with theoretical lessons.

### Agent 09: Examiner Agent (`server/src/graph/nodes/examiner.node.ts`)
- **Objective**: Generate multiple-choice quiz items, validate student submission attempts, and compute overall accuracy.

### Agent 10: Adaptive Coach (`server/src/graph/nodes/adaptiveCoach.node.ts`)
- **Objective**: Evaluate student quiz mastery; inject remedial sub-lessons or unlock advanced topics dynamically.
