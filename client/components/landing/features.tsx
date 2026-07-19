"use client";

import React from "react";
import {
  MessageSquare,
  UserCheck,
  Search,
  ShieldCheck,
  Compass,
  CalendarDays,
  BookOpen,
  Presentation,
  CheckCircle2,
  GitGraph,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/badge";

const AGENT_LIST = [
  {
    id: "01",
    name: "Intake Counselor",
    role: "Diagnostic Interview",
    description:
      "Conducts conversational diagnostic interviews using multi-turn memory to uncover knowledge gaps, goals, and learning velocity.",
    icon: MessageSquare,
    badge: "Graph Entry",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    id: "02",
    name: "Learner Profiler",
    role: "Cognitive Profiling",
    description:
      "Synthesizes raw interview responses into structured learner profiles with baseline skill scores and preferred learning modalities.",
    icon: UserCheck,
    badge: "Profile State",
    gradient: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "03",
    name: "Librarian Board",
    role: "Resource Discovery",
    description:
      "Scours web databases and academic repos to index learning material, feeding into Pinecone vector storage for precise RAG search.",
    icon: Search,
    badge: "Pinecone RAG",
    gradient: "from-purple-500/20 to-pink-500/10",
  },
  {
    id: "04",
    name: "Source Verifier",
    role: "SourceTrust Verification",
    description:
      "Evaluates external resources with multi-attribute trust algorithms, discarding low-quality or hallucinated information.",
    icon: ShieldCheck,
    badge: "SourceTrust",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "05",
    name: "Curriculum Architect",
    role: "Syllabus Generation",
    description:
      "Generates multi-phase hierarchical curricula tailored precisely to user targets, skill levels, and prerequisites.",
    icon: Compass,
    badge: "Prisma DB",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "06",
    name: "Schedule Planner",
    role: "Temporal Mapping",
    description:
      "Maps syllabus modules into daily/weekly schedules, pacing topics based on user commitment and learning style.",
    icon: CalendarDays,
    badge: "Pace Allocation",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  {
    id: "07",
    name: "Master Teacher",
    role: "Interactive Classroom",
    description:
      "Delivers markdown lessons with step-by-step explanations, real-world examples, interactive code snippets, and key takeaways.",
    icon: BookOpen,
    badge: "AI Classroom",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    id: "08",
    name: "Visual Explainer",
    role: "Blueprint Generator",
    description:
      "Renders dynamic Mermaid.js architecture diagrams, mind maps, and flowcharts directly alongside theoretical lessons.",
    icon: Presentation,
    badge: "Mermaid.js",
    gradient: "from-rose-500/20 to-red-500/10",
  },
  {
    id: "09",
    name: "Examiner Agent",
    role: "Knowledge Verification",
    description:
      "Generates targeted multiple-choice quizzes and open evaluations to measure comprehension and grade performance.",
    icon: CheckCircle2,
    badge: "Quiz Evaluation",
    gradient: "from-lime-500/20 to-emerald-500/10",
  },
  {
    id: "10",
    name: "Adaptive Coach",
    role: "Remedial Path Tuning",
    description:
      "Monitors evaluation results and dynamically injects remedial sub-lessons or accelerates fast learners through upcoming modules.",
    icon: GitGraph,
    badge: "State Recalibration",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous AI Multi-Agent Engine
          </Badge>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Meet Your 10 Specialized AI Agents
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Unlike static linear courses, AstraLearn coordinates 10 autonomous agents in a state-machine graph. 
          Each agent operates independently yet streams real-time state updates to build your personalized academy.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENT_LIST.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="group relative rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Subtle top glow background */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${agent.gradient} rounded-bl-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60 -z-10`}
              />

              <div>
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
                        Agent {agent.id}
                      </span>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {agent.name}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                    {agent.badge}
                  </Badge>
                </div>

                {/* Subtitle / Role */}
                <p className="text-xs font-semibold text-primary/90 mb-2">
                  {agent.role}
                </p>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Card Footer Indicator */}
              <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Async Worker Active
                </span>
                <span className="group-hover:text-primary transition-colors">
                  Workspace Ready →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Architecture Highlight Banner */}
      <div className="mt-16 rounded-3xl border border-border bg-gradient-to-r from-card via-secondary/30 to-card p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-mono">
              Live Socket.io Engine & BullMQ Queues
            </Badge>
            <h3 className="text-2xl font-bold text-foreground">
              Powered by Asynchronous Workers & Vector RAG
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every agent graph execution is offloaded to background BullMQ queues. Progress, status logs, 
              and generated blueprints stream instantly to your browser standard WebSockets — ensuring zero page reloads.
            </p>
          </div>
          <div className="flex justify-start lg:justify-end">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/95 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Launch Academy Dashboard
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
