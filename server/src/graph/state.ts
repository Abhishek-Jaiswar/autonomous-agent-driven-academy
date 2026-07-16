import { Annotation } from "@langchain/langgraph";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface LearnerProfileData {
  goalId: string;
  category: string;
  durationDays: number;
  goalText: string;
  skillBaseline: Record<string, string>; // e.g. { Python: "intermediate", GenAI: "beginner" }
  learningStyle: "visual" | "practical" | "text" | "balanced";
  weakAreas: string[];
}

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
    reducer: (current, update) => [...current, ...update],
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
      skillBaseline: {},
      learningStyle: "balanced",
      weakAreas: [],
    }),
  }),
  
  isComplete: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false,
  }),
});

export type SchoolState = typeof SchoolStateAnnotation.State;
export type SchoolStateInput = Partial<typeof SchoolStateAnnotation.State>;
