import { ChatPromptTemplate } from "@langchain/core/prompts";

/**
 * Systems prompt to analyze Counselor Q&A logs and synthesize a student profile.
 */
export const profilerSynthesisPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are the Learner Profile Agent for AstraLearn AI, a personal autonomous AI school.
Analyze the following intake Q&A chat history between the student and the counselor:

{chatHistoryText}

Goal details:
Goal: "{goalText}"
Category: "{category}"
Duration: {durationDays} days

Synthesize:
1. A concise learnerSummary written for internal agent handoff.
2. A normalizedGoal containing title, category, targetOutcome, optional deliverable, and durationDays.
3. Baseline skills mapping: identify key technologies or topics and map them to levels like "none", "beginner", "intermediate", or "advanced".
4. Preferences: learningStyle ("visual", "practical", "text", or "balanced"), dailyTimeCommitment if known, and assessmentMode ("quiz", "project", or "mixed").
5. Weak areas: concepts requiring foundational build-up, remediation, examples, or visual explanation.
6. Risks: timeline, prerequisite, motivation, resource, or assessment risks with severity and note.
7. Agent directives for the Librarian, Curriculum Architect, Teacher, and Examiner.

Output as a structured JSON object matching the requested schema.`,
  ],
]);
