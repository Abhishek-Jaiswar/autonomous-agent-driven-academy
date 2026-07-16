# Learner Profile Agent (Profiler) Implementation Specification

## 1. Overview
The **Learner Profile Agent (Profiler)** is responsible for analyzing the intake interview dialog and synthesizing it into a structured, machine-readable user profile. This profile identifies skill baselines, styles, and weak areas, which direct all subsequent content generation, resource discovery, and syllabus mapping.

* **Execution Context**: LangGraph Node (`profilerNode` in `server/src/graph/nodes/profiler.node.ts`).
* **Trigger Event**: Flows automatically from the Counselor Agent once `isComplete` is set to `true`.
* **Database Target**: `Profile` table.

---

## 2. Zod Generation Schema
The Profiler uses Gemini structured outputs to compile a clean, type-safe profile object.

```typescript
import { z } from "zod";

export const profileSynthesisSchema = z.object({
  skillBaseline: z
    .record(z.string(), z.string())
    .describe("Mapping of key technologies/concepts to user experience levels"),
  learningStyle: z
    .enum(["visual", "practical", "text", "balanced"])
    .describe("Synthesized learning style preference"),
  weakAreas: z
    .array(z.string())
    .describe("Key concepts the user has identified as weak or lacks background in"),
});
```

---

## 3. Prompt Template
```
You are the Learner Profile Agent for AstraLearn AI, a personal autonomous AI school.
Analyze the following intake Q&A chat history between the student and the counselor:

{chatHistoryText}

Goal details:
Goal: "{goalText}"
Category: "{category}"
Duration: {durationDays} days

Synthesize:
1. Baseline skills mapping (e.g. Python: "intermediate", ML: "beginner", GenAI: "none").
2. Core learning style: "visual", "practical", "text", or "balanced" based on their formats/practical choices.
3. Weak areas: Concepts or topics where they need remedial instruction, extra details, or simplified flowcharts.
```

---

## 4. Execution Logic
1. **Chat Logs Aggregation**: Gathers the complete counselor conversation log from the state.
2. **Profile Generation**: Invokes `llm.withStructuredOutput(profileSynthesisSchema)` with the prompt.
3. **Database Write**:
   - Updates the `Profile` record matching `goalId` with `skillBaseline`, `learningStyle`, and `weakAreas`.
   - Creates a database `AgentLog` log record for transparency.
4. **WebSocket Notification**:
   - Emits `profile-ready` with the profile metadata to the WebSocket room `goalId`.
   - Emits `agent-log` showing: `"Profile compiled successfully! Librarian Agent starting resource discovery..."`.
5. **Background Task Delegation**: Calls `queueCurriculumGeneration(goalId)` to queue the BullMQ background curriculum job.

---

## 5. State Modifications
* **State Updates**: Sets the `profile` object in the graph state.
