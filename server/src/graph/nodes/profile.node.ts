import type { InterviewState } from "../state.js";
import { llm } from "../../llm/model.js";
import { PROMPTS } from "../../llm/prompts/index.ts";
import { PARSERS } from "../../llm/parsers/index.ts";
import { logger } from "../../utils/logger.js";

/**
 * Profile Node — Phase 3 (Candidate Profile Extraction)
 *
 * Responsibility: Extract candidate skills, projects, technologies, and
 * self-claims from their background introduction or first response.
 *
 * Uses:
 *  - llm.withStructuredOutput() to parse response directly into CandidateProfile format.
 *  - PROMPTS.profileExtraction ChatPromptTemplate.
 *
 * Saves result to:
 *  - state.candidateProfile
 */
export async function profileNode(
  state: InterviewState
): Promise<Partial<InterviewState>> {
  logger.info(
    `[profileNode] Extracting candidate profile for session [${state.interviewId}]`
  );

  // We extract from their last answer (which is their response to the opener / intro)
  const inputAnswer = state.lastAnswer || "";

  if (!inputAnswer.trim()) {
    logger.warn(`[profileNode] No input answer found in state. Skipping extraction.`);
    return {};
  }

  // Format the prompt
  const formattedPrompt = await PROMPTS.profileExtraction.formatMessages({
    intro: inputAnswer,
    role: state.role,
  });

  try {
    // Bind structured output schema to the model
    const structuredLlm = llm.withStructuredOutput(PARSERS.candidateProfile);

    // Call LLM
    const profile = await structuredLlm.invoke(formattedPrompt);

    logger.info(
      `[profileNode] Profile extracted successfully: ${profile.skills.length} skills, ${profile.technologies.length} tech.`
    );

    return {
      candidateProfile: profile,
    };
  } catch (error: any) {
    logger.error(
      `[profileNode] Failed to extract candidate profile: ${error.message}`,
      error.stack
    );
    // Fallback: return empty lists so validation/graph doesn't crash
    return {
      candidateProfile: {
        skills: [],
        projects: [],
        technologies: [],
        claims: [],
      },
    };
  }
}
