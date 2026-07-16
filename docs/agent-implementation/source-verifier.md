# Source Verifier Agent (SourceTrust) Implementation Specification

## 1. Overview
The **Source Verifier Agent** implements the **SourceTrust Engine**. Its primary responsibility is to score each candidate resource compiled by the Librarian, filtering out low-quality, outdated, or unverified documents to prevent hallucinations from entering the curriculum.

* **Execution Context**: BullMQ Job Worker (`generate-curriculum` job).
* **Skill Dependency**: Custom SourceTrust Skill (`skills/source_trust/SKILL.md`).
* **Database Target**: `Resource` table.

---

## 2. SourceTrust Scoring Matrix (Heuristics)
The verification logic calculates a final score (from 0 to 100) based on these strict guidelines:

* **Official Source**: `+40` (e.g. OpenAI official docs, सीबीएसई syllabus).
* **University or Government source**: `+35` (e.g. Stanford lecture notes, NCERT textbooks).
* **Known Framework / Documentation**: `+35` (e.g. HuggingFace guides, React docs).
* **Explicit Author / Date metadata**: `+10`.
* **Recent or versioned content**: `+10` (Fresh tech content).
* **Direct goal alignment**: `+15`.
* **Random Blog / Unknown PDF**: `-25`.
* **Outdated technical material**: `-20` (e.g. RAG tutorial from 2019).
* **No author / anonymous source**: `-15`.

### Trust Labels
* **`85-100`**: **Verified** (Included in path).
* **`70-84`**: **Strong** (Included).
* **`50-69`**: **Use with caution** (Included, marked with warning).
* **`< 50`**: **Rejected** (Excluded from curriculum).

---

## 3. Zod Schema & LLM structured Prompt
The verifier calls Gemini using structured output to evaluate the metadata.

```typescript
import { z } from "zod";

export const trustScoringSchema = z.object({
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      type: z.string(),
      trustScore: z.number().int().min(0).max(100),
      trustLabel: z.enum(["Verified", "Strong", "Caution", "Rejected"]),
      reason: z.string().describe("Heuristic breakdown justifying the score"),
      status: z.enum(["INCLUDED", "REJECTED"]),
    })
  ),
});
```

### Prompt Template
```
You are the Source Verifier Agent for AstraLearn AI.
Your job is to run the SourceTrust Heuristic evaluation on these candidate resources:
{candidateResourcesList}

For each resource:
1. Apply the heuristic scoring matrix (+40 official docs, +35 university, -25 random blog, -20 outdated tech).
2. Assign a trust score (0-100) and a label (Verified, Strong, Caution, Rejected).
3. If the score is >= 50, mark status as INCLUDED. If < 50, mark as REJECTED.
4. Output the results as structured JSON.
```

---

## 4. Database Actions
* **Resource Status Update**: Updates PostgreSQL `Resource` rows with the calculated `trustScore`, `trustLabel`, `reason`, and `status`.
* **AgentLog Sync**: Records logs: `"SourceVerifier reviewed 8 assets. 5 Verified/Included, 3 Rejected."`
* **Real-time Broadcaster**: Emits `agent-log` websocket notifications for each evaluated item (e.g. `"SourceVerifier verified OpenAI documentation — Trust Score: 96"`).
