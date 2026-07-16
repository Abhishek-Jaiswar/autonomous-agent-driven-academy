# Visual Explainer Agent Implementation Specification

## 1. Overview
The **Visual Explainer Agent** generates visual conceptual explanations (flowcharts, pipelines, sequence charts, mind maps) to assist the student's understanding. It produces diagrams formatted in **Mermaid.js** syntax, which are rendered dynamically in the Next.js frontend.

* **Execution Context**: Express controller (`GET /classroom/lesson/:lessonId`) or BullMQ worker (pre-generating during curriculum layout).
* **Database Target**: `Lesson.diagram` text column.

---

## 2. Mermaid.js Generation Guidelines
To prevent Mermaid syntax rendering failures:
* **Graph Type**: Stick to standard types (e.g. `graph TD` for vertical flows, `graph LR` for horizontal pipelines, or `sequenceDiagram` for API handoffs).
* **Quotes**: Wrap node labels containing special characters, spaces, or parentheses in double quotes (e.g. `A["Load File (JSON)"]`).
* **Clean Formatting**: Output ONLY the raw Mermaid diagram code. No wrapping Markdown blocks (like ```mermaid ... ```) in the final API output, or parse it cleanly to extract only the graph code.

---

## 3. Prompt Template
```
You are the Visual Explainer Agent for AstraLearn AI.
Your job is to generate a visual diagram illustrating the concept or system architecture of this lesson:
Lesson Title: "{lessonTitle}"
Lesson Excerpts:
{lessonContentExcerpt}

Generate a clear flowchart or sequence diagram using Mermaid.js syntax.
For example, if the lesson explains RAG, generate a flow showing:
User Query -> Embedding -> Vector DB Search -> Chunks -> LLM -> Response.

Ensure you follow strict Mermaid rules:
- Quote all nodes with spaces.
- Do not use HTML tags in node labels.
- Output ONLY the raw Mermaid code block starting with 'graph TD' or 'graph LR'.
```

---

## 4. Integration Flow
1. During curriculum architecture (or on first lesson fetch), the backend triggers the Visual Explainer.
2. The agent returns the raw Mermaid code block.
3. The server updates the database:
   ```typescript
   await db.lesson.update({
     where: { id: lessonId },
     data: { diagram: generatedMermaidCode }
   });
   ```
4. The Next.js frontend fetches the lesson payload, parses the `diagram` string, and feeds it to the `<Mermaid />` render component.
