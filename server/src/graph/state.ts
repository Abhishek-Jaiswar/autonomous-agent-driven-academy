import { Annotation } from "@langchain/langgraph";
import type {
  ConversationMessage,
  CandidateProfile,
  SkillScore,
} from "../types/interview.types.js";

// ─── Interview State (LangGraph Annotation) ────────────────────────────────────
//
// This is the HEART of the interview system. Every node reads from and writes
// to this single state object. LangGraph merges partial updates using the
// reducer defined for each field.
//
// Reducer patterns used here:
//   ┌─────────────────────┬─────────────────────────────────────────────────┐
//   │ Reducer             │ When to use                                     │
//   ├─────────────────────┼─────────────────────────────────────────────────┤
//   │ last-write-wins     │ Scalar fields (string, number, status)          │
//   │ append              │ conversation — new messages added each turn     │
//   │ deduplicated union  │ coveredTopics — never repeat a topic            │
//   │ last-write-wins     │ pendingTopics — planner rewrites the full list  │
//   │ shallow merge       │ skillScores — new skill scores overwrite old    │
//   └─────────────────────┴─────────────────────────────────────────────────┘
//
// State must remain fully serializable — no functions, no class instances.
// This ensures it can be stored in Redis / PostgreSQL in later phases.

export const InterviewStateAnnotation = Annotation.Root({
  // ── Session Identity ──────────────────────────────────────────────────────
  interviewId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  role: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  status: Annotation<"idle" | "running" | "completed">({
    reducer: (_, update) => update,
    default: () => "idle" as const,
  }),

  startedAt: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  completedAt: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  // ── Candidate Profile (Phase 3) ───────────────────────────────────────────
  // The profile extraction node will populate this from the candidate's intro.
  candidateProfile: Annotation<CandidateProfile>({
    reducer: (_, update) => update,
    default: () => ({
      skills: [],
      projects: [],
      technologies: [],
      claims: [],
    }),
  }),

  // ── Current Interaction ────────────────────────────────────────────────────
  currentQuestion: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  lastAnswer: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  questionCount: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  // ── Conversation History ───────────────────────────────────────────────────
  // Append-only: nodes return NEW messages to add, not the full array.
  // The reducer handles combining them.
  conversation: Annotation<ConversationMessage[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  // ── Topic Management (Phase 6) ─────────────────────────────────────────────
  coveredTopics: Annotation<string[]>({
    reducer: (current, update) => [...new Set([...current, ...update])],
    default: () => [],
  }),

  pendingTopics: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  // ── Skill Evaluation (Phase 5) ─────────────────────────────────────────────
  // Shallow merge: new skill scores overwrite old ones for the same skill key.
  skillScores: Annotation<Record<string, SkillScore>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({}),
  }),

  // ── Adaptive Controls (Phase 6) ───────────────────────────────────────────
  difficultyLevel: Annotation<"easy" | "medium" | "hard">({
    reducer: (_, update) => update,
    default: () => "easy" as const,
  }),
});

// ─── Exported Types ───────────────────────────────────────────────────────────

/** Full interview state — use this type everywhere in nodes and services */
export type InterviewState = typeof InterviewStateAnnotation.State;
