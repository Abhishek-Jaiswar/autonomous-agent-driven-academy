# AstraLearn AI Prototype Agent Brief

## Copy-Paste Prompt For A Prototype-Building Agent

You are building a hackathon-ready prototype for **AstraLearn AI**, an autonomous multi-agent, multimodal learning management system for individual learners.

Build a polished working prototype using mock data. The prototype should demonstrate the full learner journey:

1. A learner enters a goal, such as:
   - "I want to learn Generative AI and build a RAG product recommendation system for jobs."
   - "I want to prepare Indian Polity for UPSC in 45 days."
   - "I want to study Class 12 Physics: Electromagnetic Induction."
2. The system runs a dynamic AI interview and asks personalized follow-up questions.
3. The system generates a learner profile.
4. The system discovers mock learning resources from videos, articles, books, docs, papers, and official sources.
5. A SourceTrust layer scores and filters resources for authenticity.
6. A curriculum architect agent builds phases, modules, lessons, practicals, quizzes, and tests.
7. A teacher agent teaches the current module using text plus visual explanation placeholders.
8. A quiz or practical agent conducts an activity.
9. An evaluator agent scores the learner and gives feedback.
10. An adaptive coach updates the next lesson based on learner performance.

The prototype must not feel like a generic chatbot. It should feel like a personal AI school built around the learner's goal.

Use mock data and deterministic flows where needed. Do not depend on real web scraping, real payments, or real user authentication for the MVP. The UI should look like a serious learning product, not a landing page. The first screen should be the actual app experience.

Core product message:

> AstraLearn AI is a personal autonomous AI school. It interviews the learner, verifies resources, creates a curriculum, teaches with multimodal support, evaluates performance, and adapts the path continuously.

Important differentiation:

> This is not just NotebookLM-style source chat. NotebookLM helps users understand uploaded sources. AstraLearn starts before sources exist: it interviews the learner, discovers and verifies resources, designs a curriculum, teaches, conducts practicals and quizzes, evaluates answers, and adapts the next steps.

Build the prototype around **Personal Mode** only. Include **Institute Mode** as a future roadmap card or disabled tab, not as a working feature.

## Product Name

Recommended name: **AstraLearn AI**

Tagline:

> Your personal AI school, built around your goal.

## Product Vision

AstraLearn AI is an autonomous, multi-agent, multimodal LMS for individual learners. The learner gives a high-level goal. The system asks intelligent follow-up questions, creates a learner profile, finds and verifies learning resources, builds a curriculum, teaches the learner, conducts tests and practicals, evaluates performance, and adapts the journey.

The system should feel like a team of AI education specialists:

- counselor
- librarian
- source verifier
- curriculum designer
- teacher
- visual explainer
- lab instructor
- examiner
- progress coach

## Target User

Primary user for the hackathon MVP:

- Individual learner preparing for a job, exam, school subject, or project.

Example users:

- A student who wants to learn Generative AI and build a job-ready project.
- A UPSC aspirant preparing Indian Polity.
- A Class 12 student learning science chapters.
- A beginner trying to learn a technical skill with structure.

## Scope For Hackathon MVP

Build only the individual learner flow.

Must-have:

- Goal input
- Dynamic interview simulation
- Learner profile generation
- Mock resource discovery
- SourceTrust verification scores
- Curriculum generation
- Current lesson teaching view
- Quiz or practical activity
- Evaluation and adaptive next step
- Progress dashboard

Nice-to-have:

- Voice/audio teaching placeholder
- Diagram or visual explanation placeholder
- Mode switch: exam prep, job project, school learning, fast revision
- Roadmap card for future Institute Mode

Do not build:

- Full institute dashboard
- Real student invitations
- Real teacher approval workflow
- Real live web scraping
- Full authentication
- Payment system

## Main Demo Flow

Use this as the primary demo scenario:

Goal:

> I want to learn Generative AI and build a RAG product recommendation system for jobs.

Dynamic interview questions:

1. What is your current level in Python and machine learning?
2. How many days can you spend on this goal?
3. Do you want more theory, more practicals, or a balanced path?
4. Are you targeting portfolio projects, interview preparation, or both?
5. Do you prefer videos, docs, diagrams, or hands-on tasks?

Mock learner answers:

- Python: intermediate
- Machine learning: beginner
- Timeline: 21 days
- Preference: practical-heavy
- Target: job-ready portfolio project
- Learning style: visual plus hands-on

Generated learner profile:

- Goal type: job/project
- Target outcome: RAG product recommendation system
- Timeline: 21 days
- Skill baseline: Python intermediate, ML beginner, GenAI beginner
- Preferred style: visual explanations and practicals
- Weak areas predicted: embeddings, vector databases, retrieval evaluation, prompt design

## Agent Architecture

The prototype should show these agents as visible steps in the UI. They can be mock agents, but the user should understand what each one does.

### 1. Goal Intake Agent

Purpose:

- Accepts the learner's raw goal.
- Identifies learning domain, outcome type, urgency, and complexity.

Inputs:

- User goal text
- Optional selected category

Outputs:

- Goal category
- Target outcome
- Initial learning domain

Example output:

```json
{
  "category": "job_project",
  "domain": "Generative AI",
  "target_outcome": "Build a RAG product recommendation system",
  "difficulty": "intermediate"
}
```

### 2. Dynamic Interview Agent

Purpose:

- Asks custom follow-up questions based on the goal.
- Avoids fixed forms.

Inputs:

- Parsed goal
- User answer history

Outputs:

- Personalized questions
- Learner constraints

Prototype behavior:

- Show 4-6 generated questions.
- Use preset answers for quick demo.
- Allow user to click answer chips or type.

### 3. Learner Profile Agent

Purpose:

- Converts interview answers into a structured profile.

Outputs:

- Current level
- Timeline
- Learning style
- Target milestone
- Weak areas
- Recommended intensity

### 4. Resource Discovery Agent

Purpose:

- Finds mock resources for the goal.

Resource types:

- Official documentation
- University lectures
- YouTube tutorials
- Articles
- Books
- Research papers
- Practice datasets
- Tools and libraries

Important:

- Use mock data for resources.
- Do not require real scraping in the prototype.

### 5. SourceTrust Verification Agent

Purpose:

- Prevents low-quality or hallucinated materials from entering the curriculum.
- Scores each resource by authenticity, relevance, freshness, and credibility.

Scoring model:

- Official source: +40
- University or government source: +35
- Known documentation: +35
- Has author or organization: +10
- Recent or versioned: +10
- Matches learner goal: +15
- Cross-validated by multiple sources: +15
- Unknown blog or random PDF: -25
- Outdated technical content: -20
- No author/date/source: -15

Trust labels:

- 85-100: Verified
- 70-84: Strong
- 50-69: Use with caution
- Below 50: Rejected

UI requirement:

- Show each resource with trust score, reason, type, and whether it is included or rejected.

### 6. Resource Ranking Agent

Purpose:

- Selects the best resources for the learner's goal and level.

Ranking factors:

- Trust score
- Difficulty match
- Goal relevance
- Format preference
- Time efficiency

### 7. Curriculum Architect Agent

Purpose:

- Builds the learning path like a school syllabus.

Outputs:

- Phases
- Modules
- Lessons
- Practicals
- Quizzes
- Tests
- Capstone project
- Revision checkpoints

Example curriculum for GenAI project:

Phase 1: Foundations

- Python refresh for AI workflows
- LLM basics
- Prompt engineering
- Embeddings

Phase 2: RAG Core

- Document loading
- Chunking strategies
- Vector databases
- Retrieval pipelines
- Grounded generation

Phase 3: Product Recommender

- Product catalog ingestion
- User query understanding
- Similarity search
- Recommendation explanation
- Evaluation metrics

Phase 4: Portfolio Polish

- UI integration
- API design
- Deployment
- Resume bullet points
- Demo script

### 8. Schedule Planner Agent

Purpose:

- Converts the curriculum into daily or weekly tasks.

For the MVP:

- Generate a 21-day roadmap for the GenAI scenario.
- Show day number, topic, resource, practical, and assessment.

### 9. Teacher Agent

Purpose:

- Teaches the current lesson based on verified resources.
- Uses a tone and level matched to the learner.

Teaching requirements:

- Explain concept simply.
- Show key points.
- Include example.
- Cite or display source basis.
- Include "Ask doubt" interaction.

### 10. Visual Explanation Agent

Purpose:

- Creates or displays diagrams, flowcharts, mind maps, timelines, or visual placeholders.

For MVP:

- Use a static flow diagram for RAG:
  User Query -> Embedding -> Vector Search -> Retrieved Products -> LLM Response -> Recommendation.

### 11. Lab / Practical Agent

Purpose:

- Creates hands-on tasks.

Example practical:

> Build a mini product search pipeline using 10 mock products, embeddings placeholder, and similarity search explanation.

For MVP:

- Show a practical task card with steps, expected output, and completion button.

### 12. Quiz Agent

Purpose:

- Generates topic-wise quizzes and tests.

For MVP:

- Use 3-5 mock MCQs after a lesson.

### 13. Evaluator Agent

Purpose:

- Scores quiz or practical.
- Gives feedback.
- Identifies weak topics.

Output:

```json
{
  "score": 60,
  "strengths": ["understands RAG flow"],
  "weak_areas": ["vector database purpose", "chunking strategy"],
  "feedback": "You understand the high-level pipeline, but need practice on retrieval quality."
}
```

### 14. Adaptive Coach Agent

Purpose:

- Updates the next lesson based on performance.

Example:

> You scored low on vector database concepts. Tomorrow's lesson has been adjusted to include a 20-minute visual explanation and one extra retrieval practice.

## SourceTrust Engine

This is a core differentiator.

The system must clearly communicate:

> AstraLearn does not blindly trust AI-found material. Every resource passes through a verification layer before entering the curriculum.

Resource card fields:

- Title
- Type
- Source
- Trust score
- Trust label
- Reason
- Included or rejected

Mock resource examples for GenAI:

1. OpenAI Embeddings Documentation
   - Type: official docs
   - Trust score: 96
   - Label: Verified
   - Reason: official documentation, versioned, directly relevant
   - Status: included

2. Hugging Face RAG Guide
   - Type: official docs/article
   - Trust score: 91
   - Label: Verified
   - Reason: trusted AI platform, relevant to RAG
   - Status: included

3. Stanford CS224N Lecture On Embeddings
   - Type: university lecture
   - Trust score: 89
   - Label: Verified
   - Reason: university source, strong conceptual foundation
   - Status: included

4. Random PDF: "Become GenAI Expert in 2 Days"
   - Type: PDF
   - Trust score: 31
   - Label: Rejected
   - Reason: unknown author, unrealistic claims, no citations
   - Status: rejected

5. Blog: "RAG Tutorial 2019"
   - Type: blog
   - Trust score: 48
   - Label: Rejected
   - Reason: outdated technical content
   - Status: rejected

Mock resource examples for UPSC Polity:

1. Official UPSC Syllabus
   - Trust score: 98
   - Status: included

2. NCERT Political Science Textbook
   - Trust score: 96
   - Status: included

3. Constitution of India Official Text
   - Trust score: 99
   - Status: included

4. Random Telegram Notes PDF
   - Trust score: 35
   - Status: rejected

Mock resource examples for Class 12 Physics:

1. NCERT Class 12 Physics Chapter
   - Trust score: 98
   - Status: included

2. CBSE Syllabus PDF
   - Trust score: 95
   - Status: included

3. University lecture animation
   - Trust score: 84
   - Status: included

4. Random exam shortcut blog
   - Trust score: 45
   - Status: rejected

## Required Screens

### Screen 1: Goal Studio

Purpose:

- Let the learner enter a goal.
- Show sample goal chips.

Elements:

- Goal input box
- Goal type selector: Job Project, Exam Prep, School Subject, Skill Building
- Timeline input
- Start button

### Screen 2: AI Interview

Purpose:

- Show the dynamic questioning flow.

Elements:

- Agent status panel
- Question cards
- Answer chips
- Generated learner profile summary

### Screen 3: SourceTrust Resource Board

Purpose:

- Show discovered resources and verification.

Elements:

- Resource cards
- Trust score bars
- Included/rejected status
- Filter tabs: All, Verified, Caution, Rejected

### Screen 4: Curriculum Map

Purpose:

- Show generated learning plan.

Elements:

- Phases
- Modules
- Daily roadmap
- Practical and quiz markers
- Capstone project card

### Screen 5: AI Classroom

Purpose:

- Teach the selected lesson.

Elements:

- Teacher explanation
- Visual diagram placeholder
- Source citations panel
- Ask doubt input
- Continue to quiz button

### Screen 6: Quiz / Practical

Purpose:

- Conduct assessment.

Elements:

- MCQ questions
- Practical task card
- Submit button

### Screen 7: Evaluation And Adaptive Plan

Purpose:

- Show score, feedback, weak areas, and updated next step.

Elements:

- Score card
- Strengths
- Weak areas
- Adaptive change note
- Updated next lesson

### Screen 8: Dashboard

Purpose:

- Show progress overview.

Elements:

- Progress percentage
- Current phase
- Trust-verified resources used
- Weak areas
- Upcoming practical
- Institute Mode future card

## UI Direction

The app should feel like a serious AI education product.

Design principles:

- First screen should be the app, not a marketing landing page.
- Keep the layout dense but clean.
- Use dashboards, panels, tabs, progress bars, resource cards, and timeline views.
- Avoid overdecorated hero sections.
- Avoid making it look like a generic chatbot.
- Use distinct zones for agents, curriculum, resources, and classroom.

Suggested visual structure:

- Left sidebar: learning journey steps
- Main area: active screen
- Right panel: active agents and learner profile

Suggested color feel:

- Professional, modern, not too playful.
- Avoid making everything one color.
- Use trust colors carefully:
  - green for verified
  - amber for caution
  - red for rejected
  - blue or neutral for active learning

## Mock Data Requirements

Include at least three demo presets:

### Demo Preset 1: Generative AI Job Project

Goal:

> Learn Generative AI and build a RAG product recommendation system for jobs.

Timeline:

> 21 days

Key modules:

- LLM basics
- Prompting
- Embeddings
- Vector databases
- RAG architecture
- Product recommendation pipeline
- Evaluation
- Deployment

Final project:

> RAG Product Recommendation Assistant

### Demo Preset 2: UPSC Indian Polity

Goal:

> Prepare Indian Polity for UPSC in 45 days.

Key modules:

- Constitution basics
- Fundamental rights
- Parliament
- President and governor
- Judiciary
- Federalism
- Constitutional bodies
- Previous year question practice

Final test:

> UPSC-style mock polity test

### Demo Preset 3: Class 12 Physics

Goal:

> Learn Electromagnetic Induction for Class 12 board exams.

Key modules:

- Magnetic flux
- Faraday's law
- Lenz's law
- Motional EMF
- AC generator
- Numericals
- Board exam practice

Practical:

> Simulated coil and magnet experiment

## Prototype Logic

The prototype can use a simple state machine:

1. `goal_input`
2. `interview`
3. `profile_ready`
4. `resources_verified`
5. `curriculum_ready`
6. `lesson_active`
7. `assessment_active`
8. `evaluation_ready`
9. `dashboard`

Agent progress should be animated or visibly updated:

- Running
- Completed
- Needs learner input

## Evaluation Behavior

For the MVP, use deterministic quiz scoring.

Example:

- If learner selects two wrong answers out of five, score is 60%.
- Weak areas are mapped to question tags.
- Adaptive coach modifies the next lesson.

Example adaptive response:

> You are doing well with the RAG pipeline, but your answers show confusion around chunking and vector databases. AstraLearn has added a short visual lesson and one extra mini-practical before moving to full project implementation.

## Pitch Notes For The Prototype

Problem:

> Online learning is fragmented. Learners do not know what to study, which sources to trust, how to practice, or whether they are improving.

Solution:

> AstraLearn AI creates a personal AI school around each learner's goal. It interviews the learner, verifies resources, creates a curriculum, teaches, tests, evaluates, and adapts.

Core innovation:

> Multi-agent pedagogy plus verified resources.

Differentiation:

> Unlike AI note tools, AstraLearn does the complete learning loop from goal to curriculum to teaching to assessment to adaptation.

Trust advantage:

> SourceTrust prevents unreliable materials from entering the learning path.

Future expansion:

> Institute Mode will let teachers create verified AI-powered tracks for batches of students while preserving teacher control.

## Future Institute Mode

Do not build this fully in the MVP. Show it as a future roadmap.

Future features:

- Institute dashboard
- Teacher creates course boundary
- AI suggests curriculum
- Teacher approves resources
- Students join with class code
- AI teaches within teacher-approved content
- Batch analytics
- Student progress reports

Positioning:

> Personal Mode proves the adaptive learning engine. Institute Mode scales the same engine to classrooms and coaching centers.

## Acceptance Criteria

The prototype is successful if a judge can understand and experience this in under five minutes:

1. The learner enters a goal.
2. AstraLearn asks smart personalized questions.
3. AstraLearn verifies learning resources with SourceTrust.
4. AstraLearn creates a structured curriculum.
5. AstraLearn teaches one lesson.
6. AstraLearn conducts a quiz or practical.
7. AstraLearn evaluates and adapts the next step.

The prototype should make the judge say:

> This feels like an AI school, not just an AI chatbot.
