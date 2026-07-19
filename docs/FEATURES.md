# AstraLearn AI — Application Features Guide

AstraLearn AI is an autonomous, agent-driven academy powered by a 10-agent LangGraph pipeline. It replaces static online video courses with a dynamic, living curriculum that continuously adapts to student goals, comprehends learning styles, verifies study material credibility, and tunes instruction based on performance.

---

## 🌟 Core Feature Modules

### 1. 💬 Adaptive Intake Interview (`/dashboard/counselor` & `/interview/[id]`)
- **Primary Agent**: `Counselor Agent` (Agent 01)
- **Description**: Conversational diagnostic onboarding that interviews students to uncover target subjects, timeline expectations, prior experience, and weekly hours.
- **Key Capabilities**:
  - Multi-turn conversational memory.
  - Dynamically synthesizes goals into a structured diagnostic payload.
  - Hand-off to Learner Profiler upon interview completion.

---

### 2. 👤 Learner Cognitive Profiling (`/dashboard/profiler`)
- **Primary Agent**: `Learner Profiler` (Agent 02)
- **Description**: Transforms raw interview transcripts into a quantitative cognitive profile.
- **Key Capabilities**:
  - Evaluates baseline knowledge score (0–100%).
  - Identifies preferred learning modality (Visual, Conceptual, Practical, Structural).
  - Outlines prerequisite gaps and cognitive pacing recommendations.

---

### 3. 🔍 Sourcing Board & Vector RAG (`/dashboard/sourcetrust`)
- **Primary Agents**: `Librarian Board` (Agent 03) & `Source Verifier` (Agent 04)
- **Description**: Automated academic web search, document indexing, and credibility scoring system.
- **Key Capabilities**:
  - Web resource indexing with Pinecone vector database.
  - **SourceTrust Algorithm**: Scores materials across Author Authority, Peer Review Status, Domain Credibility, and Recency.
  - Filters out unverified or hallucinated study materials.

---

### 4. 🗺️ Dynamic Curriculum Architect (`/dashboard/curriculum`)
- **Primary Agent**: `Curriculum Architect` (Agent 05)
- **Description**: Generates multi-phase hierarchical syllabi tailored to student profiles.
- **Key Capabilities**:
  - Breaks goals into structured Phases, Modules, and Lessons.
  - Enforces dependency constraints (e.g. prerequisite modules must precede advanced topics).
  - Persisted in PostgreSQL database via Prisma transactions.

---

### 5. 📅 Temporal Schedule Planner (`/dashboard/schedule`)
- **Primary Agent**: `Schedule Planner` (Agent 06)
- **Description**: Maps curriculum modules onto calendar dates and daily time blocks.
- **Key Capabilities**:
  - Calculates daily/weekly workload based on user availability.
  - Tracks target deadlines and milestones.

---

### 6. 📖 Interactive AI Classroom (`/dashboard/classroom`)
- **Primary Agent**: `Master Teacher` (Agent 07)
- **Description**: Delivers comprehensive, step-by-step textbook lessons with interactive code snippets.
- **Key Capabilities**:
  - Markdown content rendering with syntax highlighting.
  - Real-world application examples and core summary takeaways.
  - Socket.io live streaming of generated lesson content.

---

### 7. 📊 Visual Explainer & Blueprints (`/dashboard/visuals`)
- **Primary Agent**: `Visual Explainer` (Agent 08)
- **Description**: Renders interactive concept diagrams, state machines, and mind maps.
- **Key Capabilities**:
  - Generates valid `Mermaid.js` syntax for architectural blueprints.
  - Renders diagrams inline alongside textbook lessons.

---

### 8. 📝 Knowledge Verification Examiner (`/dashboard/examiner`)
- **Primary Agent**: `Examiner Agent` (Agent 09)
- **Description**: Evaluates student understanding through automated multiple-choice and conceptual quizzes.
- **Key Capabilities**:
  - Generates context-aware quiz questions based on completed lessons.
  - Computes immediate accuracy scores and detailed question feedback.

---

### 9. ⚡ Adaptive Path Recalibrator (`/dashboard/coach`)
- **Primary Agent**: `Adaptive Coach` (Agent 10)
- **Description**: Autonomous feedback loop that tunes the student's curriculum path.
- **Key Capabilities**:
  - Injects remedial sub-lessons if quiz scores drop below threshold (70%).
  - Fast-tracks advanced students by unlocking upcoming modules.
  - Wraps curriculum updates in atomic database transactions (`prisma.$transaction`).
