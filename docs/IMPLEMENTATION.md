# AstraLearn AI — System Implementation Architecture

This document details the software architecture, state machine execution model, database schemas, background workers, and communication protocols for AstraLearn AI.

---

## 🏛️ System Architecture Overview

```
                      +----------------------------------+
                      |    Next.js 16 Client Frontend    |
                      |  React 19 + Redux + Socket.io    |
                      +----------------+-----------------+
                                       | HTTP REST / WebSockets
                                       v
                      +----------------------------------+
                      |    Express.js Node Backend API   |
                      |   Routes + Controllers + Auth    |
                      +----------------+-----------------+
                                       | Async Job Dispatch
                                       v
                      +----------------------------------+
                      |     BullMQ Background Queue      |
                      |    Redis Server Cache & Worker   |
                      +----------------+-----------------+
                                       | State Graph Execution
                                       v
                      +----------------------------------+
                      |   LangGraph 10-Agent Pipeline    |
                      |   Nodes, Memory & Zod Schemas    |
                      +----------------+-----------------+
                               /                 \
                              v                   v
                     +-----------------+   +-----------------+
                     |   PostgreSQL    |   | Pinecone Vector |
                     | Prisma ORM DB   |   |   Store RAG     |
                     +-----------------+   +-----------------+
```

---

## 🔐 1. Directory & Separation of Concerns Rules

As defined in the project standards:
- **Client Pages**: `client/app/`
- **Shared Components**: `client/components/` & `client/components/ui/`
- **Backend Controllers & Routes**: `server/src/routes/` & `server/src/controllers/`
- **Services & DB Access**: `server/src/services/` & `server/src/config/`
- **Multi-Agent State Graph**: `server/src/graph/`
- **Background Workers**: `server/src/workers/`

---

## 🔄 2. State Machine Pipeline (LangGraph)

The core pipeline executes as a state machine where agents run sequentially or conditionally:

1. **State Definition (`server/src/graph/state.ts`)**:
   - `interviewId`: Target diagnostic session ID.
   - `profile`: Synthesized cognitive learner profile.
   - `curriculum`: Generated hierarchical syllabus.
   - `verifiedResources`: Array of SourceTrust verified links.
   - `evaluations`: Quiz accuracy and performance records.

2. **Graph Nodes (`server/src/graph/nodes/`)**:
   - `counselorNode`: Diagnostic chat interview.
   - `profilerNode`: Skill baseline & style synthesis.
   - `librarianNode`: Resource discovery & Pinecone vector indexing.
   - `sourceVerifierNode`: SourceTrust score evaluation.
   - `curriculumNode`: Multi-phase module & lesson generation.
   - `schedulePlannerNode`: Daily time mapping.
   - `teacherNode`: Comprehensive textbook lesson generation.
   - `visualExplainerNode`: Mermaid.js diagram generation.
   - `examinerNode`: MCQ quiz generation & grading.
   - `adaptiveCoachNode`: Graph state recalibration & path tuning.

---

## ⚡ 3. Asynchronous Execution & WebSockets

- **Non-Blocking Execution**: Heavy LLM calls (curriculum generation, source verification, lesson writing) are queued via **BullMQ** workers (`server/src/workers/agent.worker.ts`).
- **Real-Time Streaming**: Socket.io (`server/src/config/socket.ts`) broadcasts worker progress events to client subscribers:
  - `agent:started`: Triggered when an agent node starts processing.
  - `agent:progress`: Broadcasts intermediate status messages.
  - `agent:completed`: Delivers final structured output payload.
  - `agent:error`: Captures gracefully handled errors.

---

## 🗄️ 4. Database Schema (Prisma PostgreSQL)

Key database entities (`server/prisma/schema.prisma`):
- `User`: Accounts and JWT authentication records.
- `Interview`: Intake conversation history and status.
- `LearnerProfile`: Baseline skill levels and learning preferences.
- `Curriculum`: Syllabi linked to users and goals.
- `Module`: Phases and module boundaries.
- `Lesson`: Textbook content, visual blueprints, and completion status.
- `Quiz`: MCQ questions, options, correct answers, and student scores.
- `Resource`: Indexed study materials and SourceTrust scores.

---

## 🛡️ 5. Zod Validation & Type Boundaries

All HTTP requests and agent outputs enforce strict Zod schemas:
- Request validation middleware (`server/src/middleware/validate.ts`).
- Agent structured output parsing via `zodToJsonSchema` / structured output formatters.
- Prisma entities are mapped to clean DTOs before responding to client requests.
