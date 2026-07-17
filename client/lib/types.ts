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

export type CounselorStage =
  | "goal_clarity"
  | "baseline"
  | "constraints"
  | "success_target"
  | "review"
  | "complete";

export interface CounselorSignal {
  label: string;
  value: string;
  confidence: number;
}

export interface CounselorSignals {
  normalizedGoal?: string;
  domain?: string;
  targetOutcome?: string;
  deliverable?: string;
  timelinePressure?: "low" | "medium" | "high" | "unknown";
  baselineHints?: CounselorSignal[];
  constraints?: CounselorSignal[];
  preferences?: CounselorSignal[];
  stageLabel?: string;
}

export interface ProfileRisk {
  type: string;
  severity: "low" | "medium" | "high";
  note: string;
}

export interface LearnerProfileReview {
  learnerSummary?: string;
  normalizedGoal?: {
    title?: string;
    category?: string;
    targetOutcome?: string;
    deliverable?: string;
    durationDays?: number;
  };
  skillBaseline?: Record<string, string>;
  learningStyle?: "visual" | "practical" | "text" | "balanced";
  preferences?: {
    learningStyle?: "visual" | "practical" | "text" | "balanced";
    dailyTimeCommitment?: string;
    assessmentMode?: "quiz" | "project" | "mixed";
  };
  weakAreas?: string[];
  risks?: ProfileRisk[];
  agentDirectives?: {
    librarian?: string[];
    curriculumArchitect?: string[];
    teacher?: string[];
    examiner?: string[];
  };
}

export interface CounselorInterviewResponse {
  counselorQuestions: string[];
  currentQuestionIndex: number;
  currentStage: CounselorStage;
  stageLabel: string;
  confidence: number;
  extractedSignals: CounselorSignals;
  quickReplies: string[];
  completionReason?: string;
  isComplete: boolean;
  conversation: ConversationMessage[];
  profile?: LearnerProfileReview;
}
