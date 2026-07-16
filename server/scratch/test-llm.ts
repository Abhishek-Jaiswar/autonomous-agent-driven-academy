import { llm } from "../src/llm/model.js";
import { PARSERS } from "../src/llm/parsers/index.js";
import { PROMPTS } from "../src/llm/prompts/index.js";

async function test() {
  console.log("Starting test LLM...");
  try {
    // Test 1: Simple call
    console.log("Calling llm.invoke...");
    const res = await llm.invoke("Say hello!");
    console.log("Simple invoke result:", res.content);

    // Test 2: Structured output
    console.log("\nCalling withStructuredOutput...");
    const structuredLlm = llm.withStructuredOutput(PARSERS.candidateProfile);
    const profile = await structuredLlm.invoke(`
      I am a backend developer. I have worked on Node.js and PostgreSQL. 
      I built a payment microservice and optimized query speed by 50%.
    `);
    console.log("Structured profile result:", JSON.stringify(profile, null, 2));

    // Test 3: Prompt formatting
    console.log("\nFormatting prompt...");
    const formatted = await PROMPTS.questionGeneration.formatMessages({
      role: "Backend Engineer",
      skills: "Node.js, PostgreSQL",
      technologies: "Node.js, Postgres",
      claims: "built payment microservice, optimized queries by 50%",
      difficulty: "easy",
      questionCount: "2",
      history: "Interviewer: Tell me about your background.\n\nCandidate: I am a backend developer...",
    });
    console.log("Calling with prompt...");
    const res2 = await llm.invoke(formatted);
    console.log("Question generation result:", res2.content);

    console.log("\nAll tests completed successfully!");
  } catch (e: any) {
    console.error("\n💥 Error running test:", e);
  }
}

test();
