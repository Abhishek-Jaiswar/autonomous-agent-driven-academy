# Workspace Rules: AstraLearn AI Project Standards

These project-scoped rules ensure maintainability, type safety, and stateless execution for AstraLearn AI.

## 1. Folder Structure Constraints

Adhere strictly to the defined directories:
* **Client Pages & Views**: Must reside in `client/app/` (e.g. `/dashboard/classroom`, `/dashboard/curriculum`, `/dashboard/sourcetrust`).
* **Shared Components**: Must reside in `client/components/` and atom-level elements in `client/components/ui/`.
* **Backend Router & Endpoints**: Must reside in `server/src/routes/` and `server/src/controllers/`.
* **Business Services & DB Access**: Must reside in `server/src/services/` and database configurations in `server/src/config/`.
* **Multi-Agent Graphs & State**: Must reside in `server/src/graph/` (with nodes in `server/src/graph/nodes/` and edges in `server/src/graph/edges/`).
* **Async Background Queue Workers**: Must reside in `server/src/workers/`.

---

## 2. Coding Style & Conventions

- **Separation of Concerns**: Keep routes, controllers, services, graph nodes, and BullMQ workers fully decoupled. Never execute DB queries or LLM reasoning directly inside controllers or routes.
- **Asynchronous Execution (Non-Blocking)**: All heavy agent tasks (curriculum design, resource discovery, RAG indexing) must run asynchronously in BullMQ workers. Stream progress via Socket.io WebSockets to the client.
- **Stateless Server**: Do not store active sessions or checkpoints in Node memory. Use PostgreSQL for database records and Redis for LangGraph checkpointers.
- **Zod Boundaries**: Validate all HTTP request bodies and WebSocket message payloads at the interface boundaries using Zod.
- **Type Mapping**: Map database structures (Prisma entities) to clean Data Transfer Objects (DTOs) before sending data to the client. Do not return raw database models directly.
- **Structured LLM Output**: Enforce Zod/JSON schemas on all agent outputs that direct system flows (curriculum planning, resource trust scoring, evaluations).

---

## 3. Strict Development Rules

- **No Ad-Hoc Agent Tooling**: All agent nodes must use the **Deep Agents SDK** execution environment (filesystem, sandboxes, subagents `task` tools) instead of writing custom filesystems or API readers inside the node files.
- **Single-Responsibility Agent Roles**: Each of the 9 agent roles must remain strictly scoped to its domain. The Teacher agent does not evaluate quizzes, and the Librarian agent does not modify the curriculum structure.
- **Database Transactions**: Updates to the user's curriculum (such as the Adaptive Coach adding remedial lessons or altering upcoming modules) must be wrapped in a database transaction (`prisma.$transaction`) to prevent inconsistencies.
- **Frontend Error Boundaries & Loading States**: Wrap major dashboards (Classroom, Resource Board, Curriculum Map) in React Error Boundaries and render skeleton loader states during worker execution.
