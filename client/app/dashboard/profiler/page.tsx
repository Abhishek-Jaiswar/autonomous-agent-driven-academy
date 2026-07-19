"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Sparkles, CheckCircle2, AlertCircle, Compass, BarChart2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGetCurriculumQuery, useGetUserProjectsQuery, useTriggerLibrarianMutation } from "@/store/api/auth/auth-api";

export default function ProfilerAgentPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();
  const [triggerLibrarian, { isLoading: isTriggeringLibrarian }] = useTriggerLibrarianMutation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      if (savedGoalId) {
        setGoalId(savedGoalId);
      } else if (userProjectsData?.data && userProjectsData.data.length > 0) {
        setGoalId(userProjectsData.data[0].id);
      }
    }
  }, [userProjectsData]);

  const { data: curriculumData } = useGetCurriculumQuery(goalId, { skip: !goalId });
  const goal = curriculumData?.data;
  const profile = goal?.profile;

  const rawSkillBaseline = profile?.skillBaseline;
  const skillBaseline: Array<{ name: string; level: string }> = Array.isArray(rawSkillBaseline)
    ? rawSkillBaseline.map((item: any) => ({ name: item.skill || item.name || "Skill", level: item.level || "Intermediate" }))
    : rawSkillBaseline && typeof rawSkillBaseline === "object"
    ? Object.entries(rawSkillBaseline).map(([skill, level]) => ({ name: skill, level: String(level) }))
    : [];
  const weakAreas = profile?.weakAreas || [];
  const learningStyle = profile?.learningStyle || "practical";

  async function handleInitiateLibrarian() {
    if (!goalId) return;
    try {
      await triggerLibrarian({ goalId }).unwrap();
      router.push("/dashboard/sourcetrust");
    } catch (err) {
      console.error("Failed to trigger Librarian:", err);
      router.push("/dashboard/sourcetrust");
    }
  }

  return (
    <AgentGateGuard agentId="profiler" agentNumber="02" agentName="Profiler Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 02: PROFILER
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-indigo-500 border-indigo-500/30">
                Learner Model Synthesized
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              Learner Profile & Skill Baseline Synthesis
            </h1>
            <p className="text-xs text-muted-foreground">
              Analyzes intake interview data into machine-readable learner vectors guiding the Curriculum Architect and Teacher.
            </p>
          </div>

          <Button
            onClick={handleInitiateLibrarian}
            disabled={isTriggeringLibrarian}
            size="sm"
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isTriggeringLibrarian ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            )}
            Initiate Resource Discovery (Agent 03: Librarian) <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Top Cards: Learner Persona Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Synthesized Learning Style
              </span>
              <CardTitle className="text-lg font-bold text-primary capitalize flex items-center gap-2 mt-1">
                <BrainCircuit className="w-5 h-5" />
                {learningStyle} Learner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Optimized for interactive code exercises, visual blueprints, and concise step-by-step breakdowns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Goal Classification
              </span>
              <CardTitle className="text-lg font-bold text-card-foreground capitalize mt-1">
                {goal?.category?.replace("_", " ") || "Custom Path"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Target Timeline: <strong>{goal?.durationDays || 14} Days</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Profile Readiness
              </span>
              <CardTitle className="text-lg font-bold text-emerald-500 mt-1">
                {profile ? "100% Complete" : "Pending Intake"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Progress value={profile ? 100 : 30} className="h-2" />
              <p className="text-[11px] text-muted-foreground font-mono">
                {profile ? "Ready for Librarian Resource Discovery" : "Awaiting interview data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Skills Baseline & Weak Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Baseline Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Synthesized Skill Baseline
              </CardTitle>
              <CardDescription className="text-xs">
                Evaluated prior knowledge mapping derived from Counselor Agent intake questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillBaseline.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No skill baseline recorded yet. Complete the Counselor diagnostic interview to map skills.
                </div>
              ) : (
                skillBaseline.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-card-foreground">{item.skill || item.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {item.level || "Intermediate"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Weak Areas & Concept Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Focus Areas & Concept Gaps
              </CardTitle>
              <CardDescription className="text-xs">
                Topics prioritized for deep-dive textbook chapters and visual explainer diagrams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weakAreas.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  No explicit weakness gaps flagged. The Profiler assumes a standard balanced curriculum pace.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {weakAreas.map((area: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-amber-500/40 text-amber-500 text-xs py-1 px-2.5">
                      <AlertCircle className="w-3 h-3 mr-1.5" /> {area}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AgentGateGuard>
  );
}
