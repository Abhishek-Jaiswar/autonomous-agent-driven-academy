import { db } from "../src/config/database.js";
import { teacherService } from "../src/modules/teacher/teacher.service.js";
import { examinerService } from "../src/modules/examiner/examiner.service.js";
import { logger } from "../src/utils/logger.js";

async function testAllAgentsPipeline() {
  logger.info("Starting master end-to-end verification for all 10 AI Agents...");

  // 1. Locate an unlocked lesson in DB
  const lesson = await db.lesson.findFirst({
    where: { status: "UNLOCKED" },
    include: {
      module: {
        include: {
          phase: {
            include: {
              curriculum: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    logger.error("No UNLOCKED lesson found in DB. Please run test-curriculum-generation.ts first!");
    return;
  }

  const lessonId = lesson.id;
  const goalId = lesson.module.phase.curriculum.goalId;

  logger.info(`Testing with Lesson [${lessonId}] ("${lesson.title}") for Goal [${goalId}]`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Teacher Agent & Visual Explainer Agent
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: TEACHER & VISUAL EXPLAINER AGENTS ---");
    const teacherResult = await teacherService.getOrGenerateLessonContent(lessonId);
    
    console.log(`✅ Textbook Content Generated (Length: ${teacherResult.content?.length || 0} chars)`);
    console.log(`Snippet:\n"${teacherResult.content?.slice(0, 150)}..."`);
    
    console.log(`\n✅ Visual Explainer Diagram Generated (Length: ${teacherResult.diagram?.length || 0} chars)`);
    console.log(`Mermaid Snippet:\n${teacherResult.diagram?.slice(0, 120)}...`);

    if (!teacherResult.content || !teacherResult.diagram) {
      throw new Error("Teacher or Visual Explainer failed to generate lesson output!");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Grounded RAG Doubt Resolution
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: GROUNDED RAG DOUBT RESOLUTION ---");
    const doubtQuery = "What is the primary formula or law explained in this lesson?";
    const doubtResult = await teacherService.answerStudentDoubt(goalId, lessonId, doubtQuery);
    
    console.log(`✅ Doubt Question: "${doubtQuery}"`);
    console.log(`✅ Matched Vector Chunks: ${doubtResult.matchedChunksCount}`);
    console.log(`✅ Teacher Answer:\n"${doubtResult.answer.slice(0, 200)}..."`);
    console.log(`✅ Cited Sources: ${doubtResult.sources.join(", ") || "None"}`);

    if (!doubtResult.answer) {
      throw new Error("Teacher RAG doubt resolution returned empty response!");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Examiner Agent (Quiz Generation)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: EXAMINER AGENT (QUIZ GENERATION) ---");
    const quizActivity = await examinerService.getOrGenerateQuiz(lessonId);
    const questions = (quizActivity.payload as any)?.questions || [];
    
    console.log(`✅ Generated Quiz Activity ID: ${quizActivity.id}`);
    console.log(`✅ Total Questions: ${questions.length}`);
    questions.forEach((q: any, i: number) => {
      console.log(`   Q${i + 1}: ${q.question}`);
      console.log(`      Correct: ${q.correct}`);
    });

    if (questions.length === 0) {
      throw new Error("Examiner failed to generate quiz questions!");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Examiner & Adaptive Coach Agent (Passing Scenario >= 70%)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: EXAMINER & ADAPTIVE COACH (PASS SCENARIO) ---");
    const perfectAnswers: Record<number, string> = {};
    questions.forEach((q: any, i: number) => {
      perfectAnswers[i] = q.correct;
    });

    const passSubmission = await examinerService.evaluateQuizSubmission(
      quizActivity.id,
      perfectAnswers
    );

    console.log(`✅ Score: ${passSubmission.scorePercentage}% | Passed: ${passSubmission.passed}`);
    console.log(`✅ Adaptive Coach Outcome Action: ${passSubmission.coachOutcome.action}`);
    if (passSubmission.coachOutcome.unlockedLessonTitle) {
      console.log(`🔓 Unlocked Next Lesson: "${passSubmission.coachOutcome.unlockedLessonTitle}"`);
    }

    if (!passSubmission.passed) {
      throw new Error("Expected 100% quiz submission to pass!");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Examiner & Adaptive Coach Agent (Failing Scenario < 70%)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: EXAMINER & ADAPTIVE COACH (REMEDIATION FAIL SCENARIO) ---");
    const failingAnswers: Record<number, string> = {};
    questions.forEach((_q: any, i: number) => {
      failingAnswers[i] = "Wrong Answer";
    });

    const failSubmission = await examinerService.evaluateQuizSubmission(
      quizActivity.id,
      failingAnswers
    );

    console.log(`✅ Score: ${failSubmission.scorePercentage}% | Passed: ${failSubmission.passed}`);
    console.log(`✅ Adaptive Coach Outcome Action: ${failSubmission.coachOutcome.action}`);
    console.log(`🚨 Injected Remedial Review Lesson: "${failSubmission.coachOutcome.remedialLessonTitle}"`);

    if (failSubmission.passed || failSubmission.coachOutcome.action !== "INJECTED_REMEDIAL_LESSON") {
      throw new Error("Expected failing submission to trigger INJECTED_REMEDIAL_LESSON!");
    }

    // Verify remedial lesson in database
    const remedialLesson = await db.lesson.findUnique({
      where: { id: failSubmission.coachOutcome.remedialLessonId },
    });

    if (!remedialLesson) {
      throw new Error("Remedial lesson record not found in PostgreSQL!");
    }
    console.log(`✅ Verified Remedial Lesson in DB (ID: ${remedialLesson.id}, Status: ${remedialLesson.status})`);

    console.log("\n🎉 MASTER TEST PASSED: ALL 10 AI AGENTS ARE FULLY FUNCTIONAL!");
  } catch (error: any) {
    console.error("💥 Master Agent Pipeline test failed:", error.message || error);
  }
}

testAllAgentsPipeline();
