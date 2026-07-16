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
1. Baseline skills mapping: Identify the key technologies or topics related to their goal and map them to their experience level (e.g. Python: "intermediate", ML: "beginner", GenAI: "none").
2. Core learning style: Pick "visual", "practical", "text", or "balanced" based on their preferred formatting and practical work preferences.
3. Weak areas: List of concepts or topics where they need foundational build-ups, remediation, extra help, or detailed flowcharts.

Output as a structured JSON object matching the requested schema.`,
  ],
]);
