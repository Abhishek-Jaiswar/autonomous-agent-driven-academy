# AstraLearn AI Project Standards & Code Quality Guidelines

This document defines the strict folder structures, engineering principles, and developer rules for the **AstraLearn AI** codebase. Every module, agent, route, and component must comply with these guidelines to ensure maintainability, reliability, and security at production scale.

---

## 1. Folder Structure

The project is structured as a monorepo containing a Next.js frontend (`client`) and a Node.js/Express TypeScript backend (`server`).

### 1.1. Backend (`server/`)
```
server/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # SQL migrations
├── src/
│   ├── config/              # Infrastructure clients (redis, pinecone, prisma)
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── pinecone.ts
│   ├── controllers/         # HTTP route handlers (request validation, service delegation)
│   ├── routes/              # Express API routing definitions
│   ├── services/            # Core business logic (DB queries, transactional updates)
│   ├── graph/               # LangGraph and Deep Agent engine definitions
│   │   ├── nodes/           # Isolated agent nodes (counselor, librarian, examiner, etc.)
│   │   ├── edges/           # Conditional routing and graph transitions
│   │   ├── state.ts         # LangGraph state annotation schemas
│   │   └── school.graph.ts  # Graph compilation and executor entrypoints
│   ├── workers/             # BullMQ worker pool handlers
│   │   ├── agent.worker.ts  # Worker entrypoint for long-running agent tasks
│   │   └── index.ts         # Worker process listener
│   ├── types/               # Global TypeScript models and custom interfaces
│   ├── utils/               # Utilities (logger, text embedding generators, etc.)
│   ├── app.ts               # Express configuration (middleware, error handlers)
│   └── server.ts            # Entrypoint (HTTP listener + Socket.io gateway)
├── package.json
├── tsconfig.json
└── tsconfig.release.json
```

### 1.2. Frontend (`client/`)
```
client/
├── app/                     # Next.js App Router (pages and layouts)
│   ├── dashboard/           # Main portal workspace
│   │   ├── classroom/       # Lesson study room
│   │   ├── curriculum/      # Syllabus planner and roadmap view
│   │   ├── sourcetrust/     # Resources verification board
│   │   ├── layout.tsx       # Sidebar, Header, and AgentConsole wrapper
│   │   └── page.tsx         # Dashboard landing redirect
│   ├── interview/           # Q&A Intake counseling panel
│   ├── layout.tsx           # Global layouts and providers (WebSocket, Auth)
│   ├── page.tsx             # Goal Studio (home goal entrypoint)
│   └── globals.css          # Design system CSS tokens & Tailwind imports
├── components/              # Shared UI components
│   ├── dashboard/           # Dashboard widgets (AgentConsole, ResourceCard)
│   └── ui/                  # Reusable atom-level items (Button, Input, Skeleton)
├── lib/                     # Helper functions
│   ├── api.ts               # HTTP client integration
│   ├── socket.ts            # Real-time WebSocket connection manager
│   ├── types.ts             # Frontend TypeScript interfaces
│   └── utils.ts             # Tailwind merging utilities (cn)
├── public/                  # Static assets (logos, images)
├── package.json
└── tsconfig.json
```

---

## 2. Core Engineering Principles

### 2.1. Separation of Concerns (SoC)
* **Routes**: Must strictly map HTTP requests to controllers. No business or validation logic.
* **Controllers**: Responsible for validating input (using Zod), mapping statuses, and delegating to services. They must not make direct database queries or trigger agent graphs directly.
* **Services**: Contain business operations, transaction handling, and database updates.
* **Workers (Queue)**: Execute the heavy, asynchronous agent cycles.
* **Graph Nodes**: Strictly execute prompt reasoning, tool calls, or subagent tasks. They must not manage Express requests or handle database connections.

### 2.2. Statelessness & Cache-Backed Session State
* The Express server and BullMQ workers must remain completely stateless.
* Storing active sessions in global JavaScript variables (e.g. `new Map()`) is strictly prohibited.
* Active conversation state and agent checkpoints must be persisted in **Redis** (via LangGraph checkpointers) or **PostgreSQL** (via Prisma models).

### 2.3. Event-Driven Concurrency (The Non-Blocking Rule)
* Heavy computations (curriculum generation, source validation, document chunking) must never be executed on the primary Express event loop.
* Long jobs must be submitted to the **BullMQ** queue. The server must immediately return a `202 Accepted` status with a `jobId`.
* All execution milestones and reasoning logs must stream to the client in real-time via **WebSockets** (Socket.io) backed by Redis Pub/Sub.

### 2.4. Explicit Interface Typing & Validation
* All request payloads and WebSocket events must be validated at the boundary using **Zod**.
* Database schemas (Prisma output) must never be exposed directly to the client. Controllers must map database entities into strict view-model transfer objects (DTOs).

---

## 3. Strict Development Rules

### Rule 1: No Ad-Hoc Agent Tooling
All agent nodes must use the **Deep Agents SDK** execution environment harness (e.g. virtual filesystem, built-in sandboxes, standard subagents `task` tools) rather than writing custom filesystems or parsing libraries inside the node files.

### Rule 2: Single-Responsibility Agent Roles
Each of the 9 agent roles must remain strictly scoped to its domain. The Teacher agent does not evaluate quizzes, and the Librarian agent does not modify the curriculum structure. Cross-agent transitions must happen via explicit conditional routing edges in the LangGraph workflow or via state updates.

### Rule 3: Database Transactions for Curriculum Mutability
Updates to the user's curriculum (such as the Adaptive Coach adding remedial lessons or altering upcoming modules) must be wrapped in a database transaction (`prisma.$transaction`) to prevent half-written schedules and database inconsistencies.

### Rule 4: Structured LLM Output
All LLM prompts generating machine-readable data (curriculum phase lists, resource trust scores, quiz questions, evaluation feedback) must enforce JSON schemas using structured output modes. Plaintext parsing of LLM outputs for configuration data is prohibited.

### Rule 5: Frontend Error Boundaries & Loading States
* Every component that fetches data asynchronously or depends on WebSockets must render a visual **Skeleton** state during loading.
* Major dashboards (Classroom, Resource Board, Curriculum Map) must be wrapped in React **Error Boundaries** to prevent backend agent failures from crashing the entire client portal.
