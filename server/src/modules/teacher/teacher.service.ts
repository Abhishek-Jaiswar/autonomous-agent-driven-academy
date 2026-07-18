import { db } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import { llm } from "../../llm/model.js";
import { teacherLessonContentPrompt, teacherDoubtRagPrompt } from "../../llm/prompts/teacher/teacher.prompt.js";
import { visualExplainerPrompt } from "../../llm/prompts/explainer/explainer.prompt.js";
import { embeddingsClient } from "../../utils/embeddings.js";
import { pineconeIndex } from "../../config/pinecone.js";

export const teacherService = {
  /**
   * Teacher Agent + Visual Explainer Agent:
   * Generates comprehensive textbook study guide and Mermaid diagram on-demand.
   */
  async getOrGenerateLessonContent(lessonId: string) {
    logger.info(`[TeacherService] Fetching lesson content for lessonId [${lessonId}]`);

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: true,
        activities: true,
        agentLogs: { orderBy: { createdAt: "asc" } },
        module: {
          include: {
            phase: {
              include: {
                curriculum: {
                  include: {
                    goal: {
                      include: { profile: true, resources: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found for ID: ${lessonId}`);
    }

    // If both content and diagram exist, return early
    if (lesson.content && lesson.diagram) {
      return lesson;
    }

    const goal = lesson.module.phase.curriculum.goal;
    const profile = goal.profile;

    // 1. Gather mapped resources for this lesson or fallback to all included goal resources
    let lessonResources = lesson.resources;
    if (lessonResources.length === 0) {
      lessonResources = goal.resources.filter((r) => r.status === "INCLUDED");
    }

    const resourceExcerpts = lessonResources.length > 0
      ? lessonResources.map((r, i) => `Resource #${i + 1} (${r.title}): ${r.url || "N/A"}`).join("\n")
      : "Standard curriculum references.";

    const skillBaselineText = profile?.skillBaseline
      ? JSON.stringify(profile.skillBaseline)
      : "General beginner";
    const learningStyle = profile?.learningStyle || "practical";
    const weakAreasText = profile?.weakAreas?.length ? profile.weakAreas.join(", ") : "None";

    let updatedContent = lesson.content;
    let updatedDiagram = lesson.diagram;

    // 2. Generate lesson text content if missing
    if (!updatedContent) {
      logger.info(`[TeacherAgent] Generating textbook study guide for "${lesson.title}"...`);
      const formattedContentPrompt = await teacherLessonContentPrompt.format({
        lessonTitle: lesson.title,
        skillBaselineText,
        learningStyle,
        weakAreasText,
        resourceExcerpts,
      });

      const response = await llm.invoke(formattedContentPrompt);
      updatedContent = typeof response.content === "string" ? response.content : String(response.content);
    }

    // 3. Generate visual Mermaid diagram if missing
    if (!updatedDiagram) {
      logger.info(`[VisualExplainerAgent] Generating visual diagram for "${lesson.title}"...`);
      const formattedDiagramPrompt = await visualExplainerPrompt.format({
        lessonTitle: lesson.title,
        lessonSummary: updatedContent.slice(0, 1000), // summary snippet
      });

      const response = await llm.invoke(formattedDiagramPrompt);
      let rawMermaid = typeof response.content === "string" ? response.content : String(response.content);
      
      // Clean up markdown code blocks if the LLM wrapped it in ```mermaid ... ```
      rawMermaid = rawMermaid.replace(/```mermaid/gi, "").replace(/```/g, "").trim();
      updatedDiagram = rawMermaid;
    }

    // 4. Save back to PostgreSQL
    const updatedLesson = await db.lesson.update({
      where: { id: lessonId },
      data: {
        content: updatedContent,
        diagram: updatedDiagram,
      },
      include: {
        resources: true,
        activities: true,
        agentLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    // Create AgentLog checkpoint
    await db.agentLog.create({
      data: {
        lessonId,
        agentName: "TeacherAgent",
        message: `Teacher Agent compiled study guide and Visual Explainer built Mermaid diagram for "${lesson.title}".`,
        level: "INFO",
      },
    });

    logger.info(`[TeacherService] Successfully updated lesson [${lessonId}] with textbook and diagram.`);
    return updatedLesson;
  },

  /**
   * Teacher Agent Grounded RAG Doubt Resolution:
   * Answers a student's doubt by querying Pinecone vectors filtered by mapped resource IDs.
   */
  async answerStudentDoubt(goalId: string, lessonId: string, doubt: string) {
    logger.info(`[TeacherAgent] Processing RAG doubt for goal [${goalId}], lesson [${lessonId}]: "${doubt}"`);

    // 1. Get mapped resources for lesson
    const mappedResources = await db.resource.findMany({
      where: { lessonId, status: "INCLUDED" },
    });

    const resourceIds = mappedResources.map((r) => r.id);

    // 2. Embed student doubt vector (1024 dims)
    const doubtEmbedding = await embeddingsClient.embedQuery(doubt);

    // 3. Query Pinecone with filter
    const filterCondition: Record<string, any> = resourceIds.length > 0
      ? { resourceId: { $in: resourceIds } }
      : { goalId };

    const queryResponse = await pineconeIndex.query({
      vector: doubtEmbedding,
      topK: 5,
      filter: filterCondition,
      includeMetadata: true,
    });

    // 4. Format context chunks
    const matches = queryResponse.matches || [];
    const contextChunks = matches
      .map((m, i) => {
        const metadata = m.metadata as any;
        return `Excerpt #${i + 1} (Source: ${metadata?.title || "Course Material"}):\n${metadata?.text || ""}`;
      })
      .join("\n\n");

    const fallbackContext = contextChunks || "No specific vector excerpts retrieved. Provide a general educational answer based on standard principles.";

    // 5. Invoke Gemini with RAG prompt
    const formattedPrompt = await teacherDoubtRagPrompt.format({
      studentDoubt: doubt,
      retrievedContextChunks: fallbackContext,
    });

    const response = await llm.invoke(formattedPrompt);
    const answerText = typeof response.content === "string" ? response.content : String(response.content);

    // Extract sources used
    const citedSources = Array.from(
      new Set(matches.map((m) => (m.metadata as any)?.title).filter(Boolean))
    );

    // Log trace
    await db.agentLog.create({
      data: {
        lessonId,
        agentName: "TeacherAgent",
        message: `Teacher Agent answered doubt "${doubt.slice(0, 40)}..." using ${matches.length} scoped RAG vector chunks.`,
        level: "INFO",
      },
    });

    return {
      answer: answerText,
      sources: citedSources,
      matchedChunksCount: matches.length,
    };
  },
};
