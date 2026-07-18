# AstraLearn Teacher System - Implementation Plan

This implementation plan assumes you already have:

* ✅ Counselor Agent
* ✅ Profiler Agent

and that the Profiler produces a finalized **Learner Profile**.

The remaining implementation should focus on transforming that profile into an adaptive learning experience.

---

# Phase 1 — Curriculum Generation

## Goal

Convert the learner profile into a complete learning roadmap.

## New Agent

```
Curriculum Architect
```

### Input

```ts
interface LearnerProfile {
  goal: string;
  normalizedGoal: string;
  duration: number;
  baselineSkills: SkillMap;
  weakAreas: string[];
  learningStyle: "visual" | "voice" | "mixed";
  preferences: {};
  constraints: {};
}
```

---

### Responsibilities

Generate

* learning roadmap
* module sequence
* milestones
* projects
* revision schedule
* assessment schedule

Example

```
Backend Developer

Phase 1

Programming Fundamentals

↓

Phase 2

JavaScript

↓

Phase 3

Node.js

↓

Phase 4

Express

↓

Phase 5

SQL

↓

Phase 6

Authentication

↓

Phase 7

Deployment

↓

Final Project
```

---

### Output

```ts
interface Curriculum {
    modules: Module[]
    estimatedWeeks:number
    milestones:Milestone[]
    assessments:Assessment[]
}
```

Store in

```
curriculum table
```

---

# Phase 2 — Knowledge Preparation

The Teacher should never generate lessons from memory.

Everything should come from a Retrieval Layer.

```
Teacher
      │
      ▼
Vector Search

      ▼

Resources
```

Resources include

```
Markdown Notes

Slides

Books

Official Docs

Images

Flowcharts

Code Examples

Videos

Practice Questions

Projects
```

---

## Resource Metadata

Every chunk should contain metadata.

```
{
 module:"Node.js",

 lesson:"Promises",

 difficulty:"beginner",

 learningType:"visual",

 prerequisites:["functions"],

 estimatedDuration:45,

 tags:["async","promise"]
}
```

This will allow precise retrieval.

---

# Phase 3 — Teacher Agent

This becomes the largest agent in the system.

Instead of

```
LLM

↓

Answer
```

Create an orchestrator.

```
Teacher Agent

↓

Lesson Planner

↓

Retriever

↓

Teaching Strategy

↓

Renderer

↓

Homework Generator

↓

Progress Writer
```

---

# Internal Nodes

## 1. Lesson Planner

Input

```
Current Progress

Learner Profile

Today's Goal

Previous Session
```

Output

```
Today's Lesson

Learning Objective

Estimated Time

Required Resources
```

Example

```
Lesson

Promises

Objectives

Understand Promise States

Create Promise

Consume Promise

Error Handling
```

---

## 2. Resource Retriever

Uses

```
Vector DB

↓

Top K

↓

Rerank

↓

Context
```

Returns

```
Code

Notes

Examples

Diagrams

Videos

Exercises
```

---

## 3. Teaching Strategy

This node decides

```
How should I teach?
```

Instead of

```
Answer user
```

it generates

```
Explain

↓

Check Understanding

↓

Exercise

↓

Continue
```

---

Example

```
Step 1

Analogy

↓

Step 2

Visual Diagram

↓

Step 3

Code Example

↓

Step 4

Mini Exercise

↓

Step 5

Reflection Question
```

---

# Renderer Layer

Don't create three teachers.

Create one teacher.

Three renderers.

```
Teacher

↓

Renderer
```

```
Renderer

Voice

Visual

Video
```

---

## Voice Renderer

Produces

```
Natural Explanation

Speech Script

SSML

Voice Segments
```

For

```
OpenAI TTS

ElevenLabs

Cartesia
```

---

## Visual Renderer

Produces

```
Mermaid

SVG

Flowchart

Canvas

Animation

Slides
```

Example

```
Promise Lifecycle

Pending

↓

Resolved

↓

Rejected
```

---

## Video Renderer

Produces

```
Narration

Scene Plan

Slide Sequence

Animations

Timeline
```

Later you can integrate

```
Remotion

HeyGen

Synthesia

Runway
```

---

# Interactive Teaching Loop

Every lesson should follow this loop.

```
Teacher

↓

Explain

↓

Ask Question

↓

Student Responds

↓

Evaluate

↓

Decision
```

Decision

```
Correct?

YES

↓

Continue

NO

↓

Explain Again
```

Never continue blindly.

---

# Understanding Evaluation

Teacher should evaluate after every concept.

Output

```
Concept

Promises

Confidence

82%

Misconceptions

Promise vs Callback

Recommendation

Revise
```

---

# Homework Generator

At end of lesson.

Generate

```
Practice

↓

Coding Exercise

↓

Mini Project

↓

Reflection

↓

Reading
```

Example

```
Build

Weather API

using

Promises
```

---

# Session Report

Teacher produces

```ts
interface LessonReport{

lessonCompleted:boolean

topicsCovered:string[]

timeSpent:number

understanding:number

homework:string[]

weakAreas:string[]

confidence:number

}
```

Saved after every lesson.

---

# Phase 4 — Examiner Agent

Examiner never teaches.

Responsibilities

```
Quiz Generation

Coding Assessment

Project Review

Concept Questions

Difficulty Selection

Score Calculation
```

---

## Assessment Types

```
MCQ

Coding

Debugging

Fill Blank

Explain

Architecture

Project
```

---

## Coding Evaluation

Instead of

LLM only

Use

```
Student Code

↓

Compile

↓

Run Tests

↓

Static Analysis

↓

LLM Review

↓

Final Score
```

Metrics

```
Correctness

Performance

Readability

Best Practices

Edge Cases
```

---

## Examiner Output

```ts
interface AssessmentReport{

knowledgeScore:number

codingScore:number

problemSolving:number

mastery:number

feedback:string

recommendation:string

}
```

---

# Phase 5 — Coach Agent

This agent works across weeks.

Not individual lessons.

Input

```
Lesson Reports

Assessment Reports

Attendance

Daily Time

Projects

Revision History
```

---

## Responsibilities

Detect

```
Burnout

Consistency

Learning Velocity

Motivation

Plateaus

Skill Growth
```

---

Example

```
Week 1

70%

↓

Week 2

76%

↓

Week 3

76%

↓

Week 4

77%
```

Coach

```
Learning Plateau Detected
```

---

Generate advice

```
Spend

2

days

reviewing

Async Programming
```

---

# Coach Report

```ts
interface CoachReport{

overallProgress:number

strengths:string[]

weaknesses:string[]

riskLevel:string

motivationScore:number

nextRecommendations:string[]

}
```

---

# Phase 6 — Learning Memory

Instead of storing only chat.

Maintain

```
Knowledge Graph
```

```
Programming

Variables

95%

↓

Functions

91%

↓

Objects

80%

↓

Promises

42%

↓

Async Await

25%
```

Every lesson updates this graph.

---

# Progress Engine

Teacher queries

```
Knowledge Graph

↓

Find Lowest Mastery

↓

Teach Next
```

instead of

```
Next Lesson
```

This creates adaptive learning.

---

# Data Flow

```text
Student
    │
    ▼
Counselor Agent
    │
    ▼
Profiler Agent
    │
    ▼
Curriculum Architect
    │
    ▼
Curriculum DB
    │
    ▼
Teacher Agent
 ├─────────────┐
 │             │
 ▼             ▼
Vector DB   Knowledge Graph
 │             │
 └──────┬──────┘
        ▼
 Lesson Session
        │
        ▼
 Session Report
        │
 ┌──────┴────────┐
 ▼               ▼
Examiner      Coach
 │               │
 └──────┬────────┘
        ▼
Progress Engine
        │
        ▼
Knowledge Graph Update
        │
        ▼
Next Lesson
```

# Suggested implementation order

Since you're building this as an MVP, implement the system in the following order to keep it incremental and testable:

1. **Curriculum Architect** — Generate personalized roadmaps from the learner profile.
2. **Knowledge Base & Vector Pipeline** — Ingest and index learning resources with rich metadata.
3. **Teacher Core** — Lesson planning, retrieval, adaptive teaching loop, and session reports.
4. **Homework Generator** — Produce exercises and projects tied to each lesson.
5. **Knowledge Graph** — Track mastery per concept and prerequisites.
6. **Examiner** — Generate and evaluate quizzes, coding tasks, and projects.
7. **Coach** — Analyze long-term trends, motivation, and learning velocity.
8. **Principal (Future)** — Monitor all agent reports, adjust curriculum, change teaching strategies, and coordinate the academy autonomously.

This sequence lets you deliver value early while building toward a fully autonomous multi-agent academy, where every agent has a clearly defined responsibility and communicates through structured reports rather than free-form conversation.
