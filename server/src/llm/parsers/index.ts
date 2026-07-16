import { z } from "zod";

/**
 * Output Parsers
 *
 * Structured Zod-based schemas for LLM responses.
 * Using structured outputs (instead of free-form parsing) ensures:
 *  - Type-safe LLM outputs
 *  - No brittle regex/string parsing
 *  - Clear validation errors when the model deviates
 */

export const CandidateProfileSchema = z.object({
  skills: z
    .array(z.string())
    .describe("List of technical or software engineering skills mentioned by the candidate"),
  projects: z
    .array(z.string())
    .describe("Engineering projects or systems they have built or worked on"),
  technologies: z
    .array(z.string())
    .describe("Specific programming languages, frameworks, libraries, databases, or developer tools"),
  claims: z
    .array(z.string())
    .describe("Specific technical assertions or accomplishments to probe (e.g. 'reduced API response times', 'implemented OAuth')"),
});

export const PARSERS = {
  candidateProfile: CandidateProfileSchema,

  // TODO: Phase 5 — answer evaluation parser
  // answerEvaluation: AnswerEvaluationSchema

  // TODO: Phase 7 — final interview report parser
  // interviewReport: InterviewReportSchema
} as const;
