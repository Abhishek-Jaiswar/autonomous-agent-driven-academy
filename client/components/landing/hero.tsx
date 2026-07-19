"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Zap,
  Bot,
  Compass,
  BookOpen,
  GitGraph,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Badge } from "../ui/badge";

const PRESET_GOALS = [
  "Learn Indian Polity (1987 - 2026)",
  "Master Generative AI RAG",
  "Class 12 Physics",
];

const Hero = () => {
  const router = useRouter();
  const [goalText, setGoalText] = useState("");

  const handleLaunch = (selectedGoal?: string) => {
    const target = selectedGoal || goalText;
    if (target.trim()) {
      router.push(`/dashboard?goal=${encodeURIComponent(target)}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 px-4 max-w-7xl mx-auto">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/3 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-primary/15 via-accent/20 to-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Side-by-Side Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Left-Aligned Content (text-start) */}
        <div className="lg:col-span-6 text-start flex flex-col items-start space-y-6">
          {/* Ticker / Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/80 text-secondary-foreground border border-border/80 shadow-xs backdrop-blur-md hover:bg-secondary transition-all">
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-mono">
              v1.0 LIVE
            </Badge>
            <span className="flex items-center gap-1.5 text-foreground/90 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              10-Agent Pipeline Matrix Active
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] text-start">
            The First Autonomous
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-purple-600">
              Agent-Driven Academy
            </span>
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-start max-w-xl">
            Stop scrolling through static video courses. AstraLearn deploys 10 specialized AI agents that interview your goals, curate verified resources, build custom syllabi, and adapt your learning path in real time.
          </p>

          {/* Interactive Quick-Target Input Bar */}
          <div className="w-full max-w-lg text-start space-y-3">
            <div className="relative rounded-2xl border border-border bg-card/90 p-2 shadow-xl backdrop-blur-md focus-within:ring-2 focus-within:ring-primary/40 transition-all flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 px-3 w-full flex-1">
                <Bot className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="What topic do you want to learn today?"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                />
              </div>
              <Button
                size="lg"
                onClick={() => handleLaunch()}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.02] shrink-0"
              >
                Start Academy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Target Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground text-start">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Presets:</span>
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleLaunch(preset)}
                  className="px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/60 transition-colors text-[11px] font-medium cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-border/60 w-full max-w-lg">
            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <Bot className="w-4 h-4 text-primary" />
                10 Agents
              </div>
              <p className="text-[11px] text-muted-foreground">Real-time collaboration</p>
            </div>

            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <Search className="w-4 h-4 text-accent" />
                Vector RAG
              </div>
              <p className="text-[11px] text-muted-foreground">Pinecone material index</p>
            </div>

            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                SourceTrust
              </div>
              <p className="text-[11px] text-muted-foreground">Verified credibility</p>
            </div>
          </div>
        </div>

        {/* Right Column: Dashboard Image Showcase */}
        <div className="lg:col-span-6 relative">
          {/* Dashboard Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-72 bg-gradient-to-tr from-primary/20 via-accent/25 to-purple-500/20 rounded-full blur-3xl -z-10" />

          {/* Browser Window Frame */}
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-primary/10 group">
            {/* Top Bar */}
            <div className="h-10 border-b border-border bg-muted/40 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[11px] font-mono text-muted-foreground ml-2 hidden sm:inline">
                  astralearn.ai/dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Zap className="w-3 h-3 animate-pulse" /> 10-Agent Graph
              </div>
            </div>

            {/* Dashboard Screenshot Image */}
            <div className="relative aspect-[16/10] w-full bg-background overflow-hidden">
              <Image
                src="/astralearn_hero_dashboard.png"
                alt="AstraLearn AI Academy Dashboard"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                priority
              />
            </div>

            {/* Floating Agent Badge 1 (Top Left) */}
            <div className="absolute top-12 left-4 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3 flex items-center gap-2.5 max-w-[190px] transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-primary font-mono">
                  Counselor
                </span>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Intake Interview
                </span>
              </div>
            </div>

            {/* Floating Agent Badge 2 (Bottom Right) */}
            <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3 flex items-center gap-2.5 max-w-[200px] transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-accent shrink-0 border border-border shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-accent font-mono">
                  SourceTrust
                </span>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  98% Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
