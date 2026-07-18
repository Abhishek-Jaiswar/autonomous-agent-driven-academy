"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, BookOpen, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function QuickStartPage() {
  const router = useRouter();
  const [goalText, setGoalText] = useState("");
  const [category, setCategory] = useState<"job_project" | "exam_prep" | "school_subject">("job_project");
  const [durationDays, setDurationDays] = useState(14);
  const [isLoading, setIsLoading] = useState(false);

  const presets = [
    {
      title: "Master JWT Authentication & Microservices",
      category: "job_project",
      days: 7,
      label: "Backend Eng",
    },
    {
      title: "What is Next.js App Router and Server Actions?",
      category: "job_project",
      days: 3,
      label: "Frontend Dev",
    },
    {
      title: "AWS Certified Solutions Architect Associate Prep",
      category: "exam_prep",
      days: 30,
      label: "Cloud Cert",
    },
    {
      title: "Data Structures & Graph Algorithms in Python",
      category: "school_subject",
      days: 14,
      label: "Computer Science",
    },
  ];

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!goalText.trim()) return;

    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("astralearn_token") : "";
      const res = await fetch("http://localhost:5000/curriculum/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          goalText,
          category,
          durationDays,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.goalId) {
        localStorage.setItem("astralearn_goal_id", data.data.goalId);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to start goal:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function applyPreset(p: typeof presets[0]) {
    setGoalText(p.title);
    setCategory(p.category as any);
    setDurationDays(p.days);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h1 className="text-2xl font-bold text-card-foreground">Quick Start New Learning Goal</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter any topic, technology, exam, or project goal. Our AI Profiler & Curriculum Architect will analyze the scope and create a custom learning flow.
        </p>
      </div>

      {/* Preset Badges */}
      <div className="space-y-2">
        <Label className="text-xs font-mono uppercase text-muted-foreground">Quick Suggestions</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {presets.map((p) => (
            <Card
              key={p.title}
              onClick={() => applyPreset(p)}
              className="cursor-pointer hover:border-primary/50 transition-all p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-card-foreground">{p.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{p.title}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          ))}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configure Goal</CardTitle>
          <CardDescription>Customize your learning objective and desired timeframe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGoal} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="goalText">What do you want to learn or build?</Label>
              <Input
                id="goalText"
                placeholder="e.g. Master Docker containerization & Kubernetes deployment for Node.js microservices"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                required
                className="text-sm"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={category === "job_project" ? "default" : "outline"}
                  onClick={() => setCategory("job_project")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <Briefcase className="h-4 w-4 mb-1" />
                  <span className="text-xs">Project / Job</span>
                </Button>
                <Button
                  type="button"
                  variant={category === "exam_prep" ? "default" : "outline"}
                  onClick={() => setCategory("exam_prep")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <GraduationCap className="h-4 w-4 mb-1" />
                  <span className="text-xs">Exam Prep</span>
                </Button>
                <Button
                  type="button"
                  variant={category === "school_subject" ? "default" : "outline"}
                  onClick={() => setCategory("school_subject")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <BookOpen className="h-4 w-4 mb-1" />
                  <span className="text-xs">Concept / Subject</span>
                </Button>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Target Duration</Label>
                <span className="font-bold text-primary">{durationDays} days</span>
              </div>
              <Slider
                min={1}
                max={60}
                step={1}
                value={[durationDays]}
                onValueChange={(val: number[]) => setDurationDays(val[0])}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>1 day (Mini-Lesson)</span>
                <span>14 days (Topic)</span>
                <span>60 days (Full Course)</span>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !goalText.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aligning Agents...
                </>
              ) : (
                <>
                  Launch Learning Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
