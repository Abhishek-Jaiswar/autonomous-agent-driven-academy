// ─── Shared Types (mirrors server/src/types/interview.types.ts) ───────────────

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CandidateProfile {
  skills: string[];
  experience?: number;
  projects: string[];
  technologies: string[];
  claims: string[];
}

export interface SkillScore {
  score: number;
  confidence: number;
}

export type InterviewStatus = "idle" | "running" | "completed";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface InterviewState {
  interviewId: string;
  role: string;
  status: InterviewStatus;
  startedAt: string;
  completedAt: string;
  candidateProfile: CandidateProfile;
  currentQuestion: string;
  lastAnswer: string;
  questionCount: number;
  conversation: ConversationMessage[];
  coveredTopics: string[];
  pendingTopics: string[];
  skillScores: Record<string, SkillScore>;
  difficultyLevel: DifficultyLevel;
}

// ─── Request / Response types ─────────────────────────────────────────────────

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
