import { Annotation } from "@langchain/langgraph";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
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
  normalizedGoal?: string | undefined;
  domain?: string | undefined;
  targetOutcome?: string | undefined;
  deliverable?: string | undefined;
  scopeIntent?: GoalScope | "unknown" | undefined;
  desiredFlow?: RecommendedFlow | "unknown" | undefined;
  realWorldUseCase?: string | undefined;
  timelinePressure?: "low" | "medium" | "high" | "unknown" | undefined;
  baselineHints: CounselorSignal[];
  constraints: CounselorSignal[];
  preferences: CounselorSignal[];
}

export interface CounselorTurnData {
  assistantMessage: string;
  currentStage: CounselorStage;
  stageLabel: string;
  confidence: number;
  extractedSignals: CounselorSignals;
  quickReplies: string[];
  isComplete: boolean;
  completionReason?: string;
}

export interface ProfileRisk {
  type: string;
  severity: "low" | "medium" | "high";
  note: string;
}

export interface NormalizedGoal {
  title: string;
  category: string;
  targetOutcome: string;
  deliverable?: string | undefined;
  durationDays: number;
}

export type GoalScope =
  | "concept"
  | "topic"
  | "lesson"
  | "module"
  | "course"
  | "career_path"
  | "project_path";

export type GoalComplexity = "low" | "medium" | "high" | "very_high";

export type TokenBudgetClass = "tiny" | "small" | "medium" | "large";

export type RecommendedFlow =
  | "instant_answer"
  | "mini_lesson"
  | "roadmap"
  | "starter_module"
  | "full_course"
  | "project_plan";

export interface GoalClassification {
  scope: GoalScope;
  complexity: GoalComplexity;
  estimatedDurationDays: number;
  tokenBudgetClass: TokenBudgetClass;
  requiresPaidPlan: boolean;
  recommendedFlow: RecommendedFlow;
  shouldAskClarifyingQuestions: boolean;
  reasoning: string;
}

export interface ProblemContext {
  whyNow?: string | undefined;
  realWorldUseCase?: string | undefined;
  targetProject?: string | undefined;
  jobRole?: string | undefined;
  successScenario?: string | undefined;
}

export interface LearnerConstraints {
  dailyTimeMinutes?: number | undefined;
  schedulePattern?: "weekday" | "weekend" | "irregular" | undefined;
  deviceAccess?: string[] | undefined;
  budget?: "free_only" | "low" | "paid_ok" | undefined;
}

export interface LearningPreferences {
  explanationDepth?: "simple" | "medium" | "deep" | undefined;
  practiceBias?: "theory_first" | "build_first" | "mixed" | undefined;
  feedbackStyle?: "direct" | "encouraging" | "socratic" | undefined;
  preferredArtifacts?: string[] | undefined;
  learningStyle?: "visual" | "practical" | "text" | "balanced" | undefined;
  dailyTimeCommitment?: string | undefined;
  assessmentMode?: "quiz" | "project" | "mixed" | undefined;
}

export interface SuccessCriteria {
  finalDeliverable?: string | undefined;
  measurableOutcomes?: string[] | undefined;
  evaluationMethod?: "quiz" | "project" | "portfolio" | "exam" | "interview" | undefined;
}

export interface ProfilePreferences {
  learningStyle: "visual" | "practical" | "text" | "balanced";
  dailyTimeCommitment?: string | undefined;
  assessmentMode: "quiz" | "project" | "mixed";
}

export interface AgentDirectives {
  librarian: string[];
  curriculumArchitect: string[];
  teacher: string[];
  examiner: string[];
}

export interface LearnerProfileData {
  goalId: string;
  category: string;
  durationDays: number;
  goalText: string;
  learnerSummary: string;
  normalizedGoal: NormalizedGoal;
  goalClassification: GoalClassification;
  problemContext?: ProblemContext | undefined;
  constraints?: LearnerConstraints | undefined;
  learningPreferences?: LearningPreferences | undefined;
  successCriteria?: SuccessCriteria | undefined;
  prerequisiteGaps: string[];
  skillBaseline: Record<string, string>; // e.g. { Python: "intermediate", GenAI: "beginner" }
  preferences: ProfilePreferences;
  learningStyle: "visual" | "practical" | "text" | "balanced";
  weakAreas: string[];
  risks: ProfileRisk[];
  agentDirectives: AgentDirectives;
}

const emptyCounselorSignals = (): CounselorSignals => ({
  baselineHints: [],
  constraints: [],
  preferences: [],
});

export const defaultGoalClassification = (): GoalClassification => ({
  scope: "topic",
  complexity: "medium",
  estimatedDurationDays: 7,
  tokenBudgetClass: "small",
  requiresPaidPlan: false,
  recommendedFlow: "mini_lesson",
  shouldAskClarifyingQuestions: true,
  reasoning: "Default classification until the Profiler compiles the learner model.",
});

export const SchoolStateAnnotation = Annotation.Root({
  // Core Identifiers
  goalId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  
  goalText: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  category: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  durationDays: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  // Counselor Q&A State
  counselorQuestions: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  counselorStage: Annotation<CounselorStage>({
    reducer: (_, update) => update,
    default: () => "goal_clarity",
  }),

  counselorStageLabel: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "Goal Clarity",
  }),

  counselorConfidence: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  counselorSignals: Annotation<CounselorSignals>({
    reducer: (_, update) => update,
    default: emptyCounselorSignals,
  }),

  counselorQuickReplies: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  completionReason: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  
  currentQuestionIndex: Annotation<number>({
    reducer: (current, update) => {
      // If we receive an explicit index set, use it; otherwise increment
      if (typeof update === "number") return update;
      return current + 1;
    },
    default: () => 0,
  }),

  lastUserResponse: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  // Conversation history
  conversation: Annotation<ChatMessage[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  // Compiled profile
  profile: Annotation<LearnerProfileData>({
    reducer: (_, update) => update,
    default: () => ({
      goalId: "",
      category: "",
      durationDays: 0,
      goalText: "",
      learnerSummary: "",
      normalizedGoal: {
        title: "",
        category: "",
        targetOutcome: "",
        durationDays: 0,
      },
      goalClassification: defaultGoalClassification(),
      prerequisiteGaps: [],
      skillBaseline: {},
      preferences: {
        learningStyle: "balanced",
        assessmentMode: "mixed",
      },
      learningStyle: "balanced",
      weakAreas: [],
      risks: [],
      agentDirectives: {
        librarian: [],
        curriculumArchitect: [],
        teacher: [],
        examiner: [],
      },
    }),
  }),
  
  isComplete: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false,
  }),
});

export type SchoolState = typeof SchoolStateAnnotation.State;
export type SchoolStateInput = Partial<typeof SchoolStateAnnotation.State>;
