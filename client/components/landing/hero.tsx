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
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "../ui/badge";

const PRESET_GOALS = [
  "Indian Polity (1987 - 2026)",
  "Generative AI & RAG Systems",
  "Class 12 Quantum Physics",
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
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 px-4 max-w-7xl mx-auto">
      {/* Dynamic Ambient Glow Mesh Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-primary/20 via-accent/20 to-purple-600/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-60 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Grid Layout: Left Content, Right Dashboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Side: Copywriting & High-Intent CTA */}
        <div className="lg:col-span-6 text-start flex flex-col items-start space-y-6">
          {/* Version Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground border border-border/80 shadow-xs backdrop-blur-md hover:bg-secondary transition-all">
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-mono">
              NEW
            </Badge>
            <span className="flex items-center gap-1.5 font-medium text-foreground/90">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Next-Gen Autonomous Agentic Academy
            </span>
          </div>

          {/* Core Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1] text-start">
            Learn Anything
            <span className="block mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-purple-500">
              10x Faster With AI.
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-start max-w-xl font-normal">
            AstraLearn replaces static linear video courses with <strong className="text-foreground font-semibold">10 specialized AI agents</strong>. 
            They interview your goals, curate verified web resources, design custom syllabi, and recalibrate your path in real time.
          </p>

          {/* High-Intent Target Input Bar */}
          <div className="w-full max-w-lg text-start space-y-3 pt-2">
            <div className="relative rounded-2xl border border-border/80 bg-card/90 p-2 shadow-2xl backdrop-blur-xl focus-within:ring-2 focus-within:ring-primary/40 transition-all flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 w-full flex-1">
                <Bot className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2 font-medium"
                />
              </div>
              <Button
                size="lg"
                onClick={() => handleLaunch()}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/95 font-semibold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] shrink-0"
              >
                Launch Academy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground text-start">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Try:
              </span>
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleLaunch(preset)}
                  className="px-2 py-1 rounded-md bg-secondary/60 hover:bg-secondary text-secondary-foreground border border-border/60 transition-all text-[11px] font-medium cursor-pointer hover:scale-105"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Social Proof / Metrics Pill Bar */}
          <div className="pt-6 border-t border-border/60 grid grid-cols-3 gap-4 w-full max-w-lg">
            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <Bot className="w-4 h-4 text-primary" />
                10 Agents
              </div>
              <p className="text-[11px] text-muted-foreground">State Graph Pipeline</p>
            </div>

            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <Search className="w-4 h-4 text-accent" />
                SourceTrust
              </div>
              <p className="text-[11px] text-muted-foreground">Vector RAG Verified</p>
            </div>

            <div className="space-y-0.5 text-start">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Adaptive
              </div>
              <p className="text-[11px] text-muted-foreground">Self-Tuning Syllabi</p>
            </div>
          </div>
        </div>

        {/* Right Side: Sleek Browser Showcase using /dashboard-hero.png */}
        <div className="lg:col-span-6 relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-80 bg-gradient-to-tr from-primary/25 via-accent/30 to-purple-600/25 rounded-full blur-3xl -z-10" />

          {/* Browser Window Frame */}
          <div className="relative rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-primary/15 group">
            {/* Top Bar */}
            <div className="h-10 border-b border-border bg-muted/50 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[11px] font-mono text-muted-foreground ml-2 hidden sm:inline">
                  astralearn.ai/dashboard/overview
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Zap className="w-3 h-3 animate-pulse" /> 10-Agent Graph Active
              </div>
            </div>

            {/* Showcase Image: dashboard-hero.png */}
            <div className="relative aspect-[16/10] w-full bg-background overflow-hidden">
              <Image
                src="/dashboard-hero.png"
                alt="AstraLearn AI Platform Overview Dashboard"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                priority
              />
            </div>

            {/* Floating Glass Badge 1 (Top Left) */}
            <div className="absolute top-12 left-4 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3 flex items-center gap-2.5 max-w-[200px] transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-primary font-mono">
                  Intake Counselor
                </span>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Diagnostic Interview
                </span>
              </div>
            </div>

            {/* Floating Glass Badge 2 (Bottom Right) */}
            <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3 flex items-center gap-2.5 max-w-[210px] transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-accent shrink-0 border border-border shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-accent font-mono">
                  SourceTrust Board
                </span>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  98% Credibility Verified
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
