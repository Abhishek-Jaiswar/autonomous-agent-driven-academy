# Product Requirement Document (PRD)
## Project Name: AstraLearn AI
### Status: Draft | Release: 1.0.0 (Production-Scale MVP)

---

## 1. Executive Summary & Core Value Proposition

AstraLearn AI is an autonomous, multi-agent, multimodal learning management system (LMS) designed for individual learners. Unlike generic AI chatbots or passive document-chat tools (like Google NotebookLM), AstraLearn operates as a personal, end-to-end autonomous AI school built entirely around the learner's goal.

The system guides the user through the entire educational lifecycle:
1. **Intake & Profiling**: Interviews the student dynamically to determine their skill baseline, style, and timeline.
2. **Resource Curation**: Discovers learning assets from web/docs/videos and validates them using a custom **SourceTrust Verification Engine** to filter out low-quality/outdated materials.
3. **Syllabus Architecture**: Designs a modular curriculum and schedules lessons into a day-by-day roadmap.
4. **Active Classroom**: Teaches concepts with interactive doubt-solving and visual diagrams.
5. **Evaluation & Adaptation**: Runs quizzes and coding practicals, grades submissions, and dynamically injects remedial content if the user struggles.

---

## 2. Target Audience & Personas

The system targets individual self-motivated learners preparing for career transitions, competitive exams, academic coursework, or project implementations.

* **Persona 1: The Job Seeker (Career Pivot)**
  * *Goal*: "Learn Generative AI and build a RAG product recommendation system for jobs in 21 days."
  * *Need*: Hands-on coding exercises, portfolio-ready capstones, and industry-standard technical concepts.
* **Persona 2: The Exam Aspirant (Academic/Government)**
  * *Goal*: "Prepare Indian Polity for UPSC in 45 days."
  * *Need*: Broad theoretical coverage, official syllabus matching, structural timelines, and mock tests.
* **Persona 3: The K-12/College Student (Topic Deep-Dive)**
  * *Goal*: "Learn Class 12 Physics: Electromagnetic Induction."
  * *Need*: Simplistic conceptual explanations, interactive visual diagrams, and formula numerical practice.

---

## 3. Product Features & Dynamic Workflows (The 9-Stage Loop)

AstraLearn is divided into 9 logical system states:

```
[Goal Intake] ➔ [Counselor Interview] ➔ [Profile Compiler] ➔ [Librarian Discovery] ➔ [SourceTrust Score]
      ➔ [Curriculum Generation] ➔ [Classroom / Teacher] ➔ [Quiz / Lab] ➔ [Evaluator / Coach Adaptation]
```

### 3.1. Goal Studio
* **Requirement**: Provide a clean portal for the student to enter their goal, select a target category (Job Prep, Exam Prep, Academics), and choose a timeline duration (in days).
* **Presets**: Preconfigure quick-start chips for the three core demo personas (GenAI, UPSC Polity, Class 12 Physics).

### 3.2. Counselor Q&A Interview
* **Requirement**: Run a dynamic 3-5 turn interview instead of static form fields. The counselor agent asks questions sequentially (e.g. baseline Python level, time constraints, learning style, primary output target) using quick-select response chips.

### 3.3. Learner Profile Compiler
* **Requirement**: Consolidate responses into a structured JSON `LearnerProfile` detailing:
  - Timeline capacity
  - Practical-to-theoretical ratio
  - Skill baseline ratings
  - Target outcomes
  - Predicted friction points (weak areas)

### 3.4. Librarian Discovery & SourceTrust Board
* **Requirement**: Gather educational assets and run them through the **SourceTrust Heuristics Engine**.
* **SourceTrust Scoring Matrix**:
  - *Official Document / Standard Spec*: `+40`
  - *University / Government course material*: `+35`
  - *Trusted Framework / Platform documentation*: `+35`
  - *Has Author/Organization metadata*: `+10`
  - *Recent / Versioned content*: `+10`
  - *Matches Learner baseline*: `+15`
  - *Unknown blog / Random PDF*: `-25`
  - *Outdated technical tutorials*: `-20`
  - *No citation / anonymous source*: `-15`
* **Filtering Logic**:
  - `85-100` ➔ **Verified** (Included in curriculum)
  - `70-84` ➔ **Strong** (Included)
  - `50-69` ➔ **Caution** (Included with caution banner)
  - `< 50` ➔ **Rejected** (Excluded, displayed in audit board)

### 3.5. Curriculum Generation & Day Scheduler
* **Requirement**: The Curriculum Architect designs modules (Phases, Modules, Lessons) and maps them into a daily timeline (e.g. Day 1 to Day 21).

### 3.6. AI Classroom
* **Requirement**: Renders the active lesson. Displays:
  - Conceptual explanation (markdown).
  - Mermaids.js visual diagrams (explaining RAG pipelines or physical loops).
  - Citation panel showing the SourceTrust assets used to generate the lesson.
  - Interactive "Ask Doubt" console supporting conversational QA.

### 3.7. Quiz & Coding Labs
* **Requirement**: Test comprehension.
  - *Theoretical courses*: Serve 3-5 multiple-choice questions.
  - *Technical/Job courses*: Serve a practical task card with step-by-step instructions.

### 3.8. Evaluation & Adaptive Coach
* **Requirement**: The Examiner grades the quiz. If the score is `< 70%`, the **Adaptive Coach** immediately alters the upcoming path:
  - Generates a remedial lesson covering the failed concepts.
  - Injects this lesson directly into the database as the "Next Lesson" block.
  - Appends the weakness to the user's `AGENTS.md` memory profile.

### 3.9. Progress Dashboard
* **Requirement**: Renders overall metrics: progress percentage, modules covered, SourceTrust stats (total verified resources read), profile warnings, and a disabled tab for "Institute Mode".

---

## 4. Technical Architecture & Infrastructure

To support production scale from release 1.0.0, the backend is built as a stateful, event-driven distributed system.

```
+------------------------------------------------------------------------------------+
|                                    Client Layer                                    |
|                             Next.js + Tailwind CSS + WS                            |
+-------------------------------------------------+----------------------------------+
                                                  |
                                                  | HTTP / WebSockets
                                                  v
+-------------------------------------------------+----------------------------------+
|                                 Application Layer                                  |
|                          Express API Gateway + Socket.io                           |
+------------------+------------------------------+--------------------+-------------+
                   |                              |                    |
                   | SQL Reads/Writes             | Queue Job          | Read/Write
                   v                              v                    v
+------------------+-------+             +--------+-------+   +--------+-------------+
|    Database Layer        |             |  Queue Layer   |   |   Agent Engine Layer |
| PostgreSQL + Prisma ORM  |             | Redis + BullMQ |   | Deep Agents SDK      |
+--------------------------+             +--------+-------+   +--------+-------------+
                                                  |                    |
                                                  | Worker Execution   | Embed / Query
                                                  v                    v
                                         +--------+-------+   +--------+-------------+
                                         | Worker Pool    |   | Vector Database      |
                                         | Node Workers   |   | Pinecone DB          |
                                         +----------------+   +----------------------+
```

### 4.1. Technology Stack
* **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons, Mermaid.js.
* **Backend**: Node.js + Express (TypeScript).
* **Database**: PostgreSQL with Prisma ORM.
* **Vector DB**: Pinecone (using Google Gemini `text-embedding-004` model).
* **Job Queue & Cache**: Redis (IORedis) + BullMQ.
* **Real-time Sync**: Socket.io (WebSockets).
* **AI Orchestrator**: LangGraph + Deep Agents SDK.

### 4.2. Asynchronous Job Processing
* Long-running agent flows (Curriculum generation, PDF text chunking, and Vector ingestion) are queued as jobs in Redis via BullMQ.
* Workers pick up the jobs, execute the agent pipelines, and stream progress logs to the client via WebSockets.
* This prevents HTTP request timeouts and server thread blocking.

---

## 5. Relational Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  goals     Goal[]
  createdAt DateTime @default(now())
}

model Goal {
  id             String       @id @default(uuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  goalText       String
  category       String       // "job_project" | "exam_prep" | "school_subject"
  durationDays   Int
  profile        Profile?
  curriculum     Curriculum?
  createdAt      DateTime     @default(now())
}

model Profile {
  id            String   @id @default(uuid())
  goalId        String   @unique
  goal          Goal     @relation(fields: [goalId], references: [id])
  skillBaseline Json     // Baseline skills level
  learningStyle String   // visual, practical, text
  weakAreas     String[]
}

model Curriculum {
  id        String   @id @default(uuid())
  goalId    String   @unique
  goal      Goal     @relation(fields: [goalId], references: [id])
  phases    Phase[]
  createdAt DateTime @default(now())
}

model Phase {
  id           String     @id @default(uuid())
  curriculumId String
  curriculum   Curriculum @relation(fields: [curriculumId], references: [id])
  title        String
  order        Int
  modules      Module[]
}

model Module {
  id      String   @id @default(uuid())
  phaseId String
  phase   Phase    @relation(fields: [phaseId], references: [id])
  title   String
  order   Int
  lessons Lesson[]
}

model Lesson {
  id           String     @id @default(uuid())
  moduleId     String
  module       Module     @relation(fields: [moduleId], references: [id])
  title        String
  content      String?    @db.Text
  diagram      String?    @db.Text // Mermaid diagram code
  order        Int
  status       String     @default("LOCKED") // LOCKED | UNLOCKED | COMPLETED | ADAPTIVE
  resources    Resource[]
  activities   Activity[]
  agentLogs    AgentLog[]
}

model Resource {
  id         String   @id @default(uuid())
  lessonId   String
  lesson     Lesson   @relation(fields: [lessonId], references: [id])
  title      String
  url        String?
  type       String   // doc, lecture, book, video
  trustScore Int
  trustLabel String   // Verified, Strong, Caution, Rejected
  reason     String
  status     String   // INCLUDED | REJECTED
}

model Activity {
  id       String   @id @default(uuid())
  lessonId String
  lesson   Lesson   @relation(fields: [lessonId], references: [id])
  type     String   // QUIZ | PRACTICAL
  payload  Json     // Questions/task descriptions
  attempts Attempt[]
}

model Attempt {
  id         String   @id @default(uuid())
  activityId String
  activity   Activity @relation(fields: [activityId], references: [id])
  submission Json
  score      Int
  feedback   Json     // Evaluator feedback (strengths, weak areas)
  createdAt  DateTime @default(now())
}

model AgentLog {
  id        String   @id @default(uuid())
  lessonId  String?
  lesson    Lesson?  @relation(fields: [lessonId], references: [id])
  agentName String   // Counselor, Librarian, Examiner, etc.
  message   String
  level     String   // INFO | WARNING
  createdAt DateTime @default(now())
}
```

---

## 6. Non-Functional Requirements (NFR)

* **Performance & Latency**: 
  - Sub-second UI updates for student actions.
  - Long agent runs (curriculum building) must display active console log stream within `300ms` of initiation.
* **Cost Constraints**:
  - Utilize Google AI Studio Gemini API free tiers for development.
  - Standardize on Pinecone serverless indices and Redis memory limits to fit within standard free/hobby tiers.
* **Security & Isolation**:
  - Agent workspace processes must run within separate sandbox scopes.
  - Virtual filesystem paths must enforce strict directory bounds (preventing arbitrary path traversals).
