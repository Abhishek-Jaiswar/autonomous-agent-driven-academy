import { z } from "zod";

// ─── Domain Types ──────────────────────────────────────────────────────────────

/** A single turn in the interview conversation */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/** What we know about the candidate (populated in Phase 3) */
export interface CandidateProfile {
  skills: string[];
  experience?: number; // years of experience
  projects: string[];
  technologies: string[];
  claims: string[]; // self-claims the AI will probe (e.g. "built a real-time system")
}

/** Per-skill evaluation summary (populated in Phase 5) */
export interface SkillScore {
  score: number; // 0–10
  confidence: number; // 0–1
}

// ─── Request Schemas (Zod) ─────────────────────────────────────────────────────

/** POST /interview/start */
export const StartInterviewSchema = z.object({
  role: z
    .string()
    .min(1, "role is required")
    .max(150, "role must be 150 characters or fewer"),
  candidateIntro: z
    .string()
    .max(2000, "intro must be 2000 characters or fewer")
    .optional(),
});

/** POST /interview/message (Phase 2) */
export const SubmitAnswerSchema = z.object({
  interviewId: z.string().uuid("interviewId must be a valid UUID"),
  answer: z
    .string()
    .min(1, "answer cannot be empty")
    .max(5000, "answer must be 5000 characters or fewer"),
});

// ─── Inferred Request DTOs ─────────────────────────────────────────────────────

export type StartInterviewDto = z.infer<typeof StartInterviewSchema>;
export type SubmitAnswerDto = z.infer<typeof SubmitAnswerSchema>;

// ─── Response Shapes ───────────────────────────────────────────────────────────

export interface StartInterviewResponse {
  interviewId: string;
  role: string;
  question: string;
  startedAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}
