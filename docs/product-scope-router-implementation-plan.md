# AstraLearn Scope-Aware Product Plan

## 1. Product Positioning

AstraLearn should not behave like a generic AI tutor that tries to generate an entire course from a vague prompt. It should behave like an autonomous learning product that first understands the size of the user's goal, then chooses the right learning flow, token budget, and pricing path.

### USP

**AstraLearn turns any learning goal into the right-sized learning experience: an instant concept explanation, a focused lesson, a module, a project path, or a full adaptive course.**

The product advantage is not just AI content generation. The advantage is controlled educational orchestration:

- It identifies whether the user asked for a concept, topic, module, course, career path, or project path.
- It avoids wasting tokens on oversized generation.
- It gives free value for small goals.
- It gates long-form personalized courses behind paid plans.
- It generates broad curricula progressively instead of all at once.
- It adapts lessons using profiler data, verified resources, assessments, and coach feedback.

## 2. Core Problem

User goals vary wildly in scope:

- "What is JWT?" is a concept.
- "Teach me Express middleware" is a topic or lesson.
- "Learn authentication" is a module.
- "I want to learn backend" is a course or career path.
- "I want to build an ecommerce backend" is a project path.

If the system treats all of these the same, it will:

- hit rate limits early,
- spend too many tokens on free users,
- generate huge content that users may never open,
- produce shallow plans for broad goals,
- and make monetization unclear.

The solution is to add a scope classification and routing layer before expensive agent workflows.

## 3. Locked Product Principle

The Profiler does not only describe the learner.

**The Profiler decides the product flow.**

After the Counselor interview, the Profiler must output:

```ts
interface GoalClassification {
  scope:
    | "concept"
    | "topic"
    | "lesson"
    | "module"
    | "course"
    | "career_path"
    | "project_path";
  complexity: "low" | "medium" | "high" | "very_high";
  estimatedDurationDays: number;
  tokenBudgetClass: "tiny" | "small" | "medium" | "large";
  requiresPaidPlan: boolean;
  recommendedFlow:
    | "instant_answer"
    | "mini_lesson"
    | "roadmap"
    | "starter_module"
    | "full_course"
    | "project_plan";
  shouldAskClarifyingQuestions: boolean;
  reasoning: string;
}
```

This classification becomes the routing contract for every downstream agent.

## 4. Product Tiers

| Goal Scope | Free Tier Behavior | Paid Tier Behavior |
| --- | --- | --- |
| concept | Short explanation, diagram, mini-check | Saved lesson, richer practice |
| topic | Focused mini lesson | Multi-lesson topic pack |
| lesson | One generated lesson | Full lesson with practice, quiz, memory |
| module | Outline plus first lesson | Full module with assessments |
| course | High-level roadmap plus first lesson preview | Full personalized course plan |
| career_path | Preview roadmap and diagnostic summary | Deep diagnostic, long plan, projects |
| project_path | Project breakdown preview | Milestone-based guided build |

Free users should always receive something useful, but not the full long-form workflow.

## 5. Post-Profiler Agent Flows

### Flow A: Concept

Example: "What is JWT?"

```text
Counselor
-> Profiler + Scope Classifier
-> Teacher
-> Visual Explainer
-> Examiner mini-check
```

Output:

- short explanation,
- simple diagram,
- 3-question understanding check,
- no curriculum,
- no broad resource indexing.

### Flow B: Topic or Lesson

Example: "Learn Express middleware."

```text
Counselor
-> Profiler + Scope Classifier
-> Librarian
-> Source Verifier
-> Teacher
-> Visual Explainer
-> Examiner
```

Output:

- one focused lesson,
- verified source citations,
- diagram,
- short quiz,
- optional practice task.

### Flow C: Module

Example: "Learn backend authentication."

```text
Counselor
-> Profiler + Scope Classifier
-> Librarian
-> Source Verifier
-> Curriculum Architect
-> Schedule Planner
-> Teacher generates first lesson only
```

Output:

- compact module outline,
- 3-7 lessons,
- first lesson unlocked,
- remaining lesson content generated on demand.

### Flow D: Course

Example: "I want to learn backend."

```text
Counselor
-> Profiler + Scope Classifier
-> Plan Gate
-> Curriculum Architect skeleton
-> Librarian + Source Verifier for initial pool
-> Schedule Planner
-> Teacher on demand
-> Examiner on demand
-> Coach after assessments
```

Output:

- phases,
- modules,
- lesson titles,
- milestones,
- first lesson only,
- no full lesson content upfront.

### Flow E: Career Path

Example: "I want to become a backend developer."

```text
Counselor
-> Profiler + Scope Classifier
-> Paid Gate
-> Deep Diagnostic
-> Curriculum Architect
-> Librarian
-> Source Verifier
-> Schedule Planner
-> Long-term Coach
```

Output:

- multi-month roadmap,
- skill baseline,
- prerequisite gaps,
- portfolio milestones,
- periodic coach reports.

### Flow F: Project Path

Example: "I want to build an ecommerce backend."

```text
Counselor
-> Profiler + Scope Classifier
-> Project Planner
-> Curriculum Architect
-> Librarian
-> Teacher
-> Examiner or Reviewer
-> Coach
```

Output:

- build milestones,
- task-based lessons,
- code/project assessments,
- deployable final artifact.

## 6. Progressive Generation Rule

Never generate a full course upfront.

For broad goals:

```text
Generate skeleton
-> unlock first lesson
-> generate lesson content on open
-> generate quiz after lesson content
-> generate remediation only after failed assessment
-> expand next module when needed
```

This protects:

- API limits,
- latency,
- paid plan margins,
- learner attention,
- and product quality.

## 7. Profiler Upgrade Requirements

The Profiler should output a decision-grade learner model.

Add these fields to the profile contract:

```ts
interface ProductAwareLearnerProfile {
  problemContext: {
    whyNow: string;
    realWorldUseCase: string;
    targetProject?: string;
    jobRole?: string;
    examName?: string;
    successScenario: string;
  };
  goalClassification: GoalClassification;
  verifiedSkillBaseline: Record<
    string,
    {
      level: "none" | "beginner" | "intermediate" | "advanced";
      confidence: number;
      evidence: "self_reported" | "diagnostic" | "inferred";
    }
  >;
  prerequisiteGaps: string[];
  constraints: {
    dailyTimeMinutes?: number;
    schedulePattern?: "weekday" | "weekend" | "irregular";
    deviceAccess?: string[];
    budget?: "free_only" | "low" | "paid_ok";
  };
  learningPreferences: {
    explanationDepth: "simple" | "medium" | "deep";
    practiceBias: "theory_first" | "build_first" | "mixed";
    feedbackStyle: "direct" | "encouraging" | "socratic";
    preferredArtifacts: string[];
  };
  successCriteria: {
    finalDeliverable?: string;
    measurableOutcomes: string[];
    evaluationMethod: "quiz" | "project" | "portfolio" | "exam" | "interview";
  };
}
```

## 8. Pricing and Gating Logic

Initial rule:

```ts
const requiresPaidPlan =
  scope === "course" ||
  scope === "career_path" ||
  scope === "project_path" ||
  estimatedDurationDays > 14 ||
  complexity === "very_high";
```

Free users can still receive:

- a compact roadmap,
- a prerequisite checklist,
- one starter lesson,
- and a clear upgrade path.

Paid users receive:

- full curriculum skeleton,
- verified resource pipeline,
- long-term coach reports,
- project milestones,
- assessments,
- adaptive remediation,
- and progress memory.

## 9. Development Implementation Plan

### Phase 1: Scope Classification Contract

Goal: Add product-aware routing data to the Profiler.

Tasks:

- Add `goalClassification` to graph state types.
- Add `goalClassification` to profile schema/persistence.
- Update Profiler structured output schema.
- Update Profiler prompt to classify scope and flow.
- Save classification into `Profile.normalizedGoal` or a dedicated JSON field.
- Emit classification in `profile-ready`.

Acceptance criteria:

- "What is JWT?" classifies as `concept`.
- "Learn Express middleware" classifies as `topic` or `lesson`.
- "Learn backend" classifies as `course` or `career_path`.
- "Build ecommerce backend" classifies as `project_path`.

### Phase 2: Flow Router

Goal: Route downstream agents by scope.

Tasks:

- Add a service function such as `resolvePostProfilerFlow(profile)`.
- Update `profilerNode` so it queues or returns the correct next action.
- Add queue job names for:
  - `generate-mini-lesson`,
  - `generate-module`,
  - `generate-course-skeleton`,
  - `generate-project-plan`.
- Keep existing `generate-curriculum` as the module/course path initially.

Acceptance criteria:

- Concept goals do not trigger full sourcing and curriculum generation.
- Course goals generate a skeleton, not full content.
- Teacher still generates lesson content on demand.

### Phase 3: Plan Gate

Goal: Protect long-form flows behind product limits.

Tasks:

- Add plan metadata to user/session context.
- Add `requiresPaidPlan` checks before full course/project generation.
- Return a free preview object when locked.
- Add frontend upgrade messaging based on `goalClassification`.

Acceptance criteria:

- Free users can see a roadmap preview for broad goals.
- Free users cannot trigger full long-form generation.
- Paid users can continue into full generation.

### Phase 4: Progressive Curriculum Generation

Goal: Stop generating too much content upfront.

Tasks:

- Ensure Curriculum Architect creates only phases/modules/lesson titles.
- Ensure Teacher content generation remains on-demand.
- Ensure Examiner generation remains on-demand.
- Add optional `generationStatus` metadata for lessons/modules.
- Add background expansion for next module only when current module nears completion.

Acceptance criteria:

- Starting a course does not generate every lesson body.
- Opening a lesson generates only that lesson's content and diagram.
- Quiz generation occurs only when requested or after lesson content exists.

### Phase 5: Product-Grade Profiler

Goal: Make the profile useful for real-world learning plans.

Tasks:

- Add `problemContext`.
- Add `constraints`.
- Add `learningPreferences`.
- Add `successCriteria`.
- Add `prerequisiteGaps`.
- Add diagnostic confidence per skill.

Acceptance criteria:

- The profile can explain why the plan is shaped the way it is.
- Curriculum Architect can use prerequisites and constraints.
- Teacher can adapt explanation depth and practice style.
- Coach can use motivation/risk data.

### Phase 6: Paid Course Experience

Goal: Make long-form learning feel like a product, not a giant generated document.

Tasks:

- Add course dashboard states:
  - roadmap,
  - current lesson,
  - upcoming milestones,
  - source trust panel,
  - progress memory.
- Add module unlock logic.
- Add weekly coach report placeholder.
- Add project/capstone milestone support.

Acceptance criteria:

- A broad goal feels like an adaptive course.
- The user sees progress and next actions.
- Long-form generation cost is distributed over usage.

## 10. Current Codebase Integration Points

Likely files to update first:

- `server/src/graph/state.ts`
- `server/src/graph/nodes/profiler.node.ts`
- `server/src/llm/prompts/profiler/profiler.prompt.ts`
- `server/src/modules/profile/profile.service.ts`
- `server/prisma/schema.prisma`
- `server/src/config/queue.ts`
- `server/src/workers/agent.worker.ts`
- `server/src/modules/curriculum/curriculum.service.ts`
- `client/app/dashboard/curriculum/page.tsx`
- `client/components/dashboard/profiler/ProfileReview.tsx`

## 11. Product Narrative

AstraLearn should communicate this clearly:

> "Tell AstraLearn what you want to learn. It first sizes your goal, then builds the right learning experience: a quick concept lesson, a focused module, or a full adaptive course. Long courses are generated progressively, verified through trusted sources, and adjusted as you learn."

This makes the product feel responsible, economical, and trustworthy.

## 12. Immediate Next Step

Implement Phase 1:

**Profiler Scope Classification Contract**

This is the foundation. Once the Profiler can classify goal scope and recommended flow, every other agent can become cost-aware, product-aware, and easier to monetize.
