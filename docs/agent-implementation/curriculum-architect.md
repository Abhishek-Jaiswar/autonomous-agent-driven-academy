# Curriculum Architect Agent Implementation Specification

## 1. Overview
The **Curriculum Architect Agent** acts as the educational syllabus designer. It takes the user's Profile goals, timeline constraints, and the list of verified `INCLUDED` resources to construct a logical, phased syllabus consisting of modules, lessons, and practical activities.

* **Execution Context**: BullMQ Job Worker (`generate-curriculum` job).
* **Trigger Event**: Fired after the Source Verifier finishes resource screening.
* **Database Target**: `Phase`, `Module`, `Lesson`, and `Activity` tables.

---

## 2. Zod Generation Schema
The Architect uses Gemini structured output to generate a strict curriculum JSON payload.

```typescript
import { z } from "zod";

export const curriculumArchitectSchema = z.object({
  phases: z.array(
    z.object({
      title: z.string().describe("e.g. Phase 1: Foundations"),
      order: z.number().int(),
      modules: z.array(
        z.object({
          title: z.string().describe("e.g. Module 1: Prompt Design"),
          order: z.number().int(),
          lessons: z.array(
            z.object({
              title: z.string().describe("e.g. Lesson 1: Zero-shot Prompting"),
              order: z.number().int(),
              suggestedPractical: z.string().optional().describe("Description of a hands-on activity, if applicable"),
              references: z.array(z.string()).describe("Titles of verified resources this lesson covers"),
            })
          ),
        })
      ),
    })
  ),
});
```

---

## 3. Prompt Template
```
You are the Curriculum Architect Agent for AstraLearn AI.
Your job is to design a personalized syllabus for the student's learning goal.

Goal: "{goalText}"
Timeline: {durationDays} days
Profile Weak Areas: {weakAreasList}
Verified Study Resources:
{verifiedResourcesList}

Design a logical learning path. Map the topics to the verified resources. 
Ensure you insert extra foundation lessons or visual explainers covering their designated weak areas.
Output the syllabus as structured JSON.
```

---

## 4. Execution & Database Transactions
To prevent database corruption and half-written schedules, writing the syllabus must be wrapped in a Prisma database transaction:

```typescript
await db.$transaction(async (tx) => {
  for (const p of generatedPhases) {
    const phase = await tx.phase.create({
      data: { curriculumId, title: p.title, order: p.order }
    });
    
    for (const m of p.modules) {
      const module = await tx.module.create({
        data: { phaseId: phase.id, title: m.title, order: m.order }
      });
      
      for (const l of m.lessons) {
        await tx.lesson.create({
          data: {
            moduleId: module.id,
            title: l.title,
            order: l.order,
            status: "LOCKED",
            // reference mappings, etc.
          }
        });
      }
    }
  }
});
```

---

## 5. Collaboration Handoff
Once the transaction resolves, control passes immediately to the **Schedule Planner Agent** to schedule lessons chronologically.
