"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, AlertCircle, CheckCircle2, Sparkles, RefreshCw, BookOpen, ArrowRight } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCurriculumQuery, useGetUserProjectsQuery } from "@/store/api/auth/auth-api";

export default function AdaptiveCoachPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();

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
  const weakAreas = goal?.profile?.weakAreas || [];
  const phases = goal?.curriculum?.phases || [];

  // Find any remedial lessons injected into the syllabus
  const remedialLessons: any[] = [];
  phases.forEach((phase: any) => {
    phase.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        if (les.title?.toLowerCase().includes("remedial") || les.title?.toLowerCase().includes("review")) {
          remedialLessons.push({ ...les, moduleTitle: mod.title });
        }
      });
    });
  });

  return (
    <AgentGateGuard agentId="coach" agentNumber="10" agentName="Adaptive Coach Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 10: ADAPTIVE COACH
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-primary border-primary/30">
                Dynamic Path Tuning Engine
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              Dynamic Gap Remediation & Path Tuning
            </h1>
            <p className="text-xs text-muted-foreground">
              Intercepts quiz failures, generates targeted remedial lessons, and dynamically updates your database syllabus path.
            </p>
          </div>

          <Button onClick={() => router.push("/dashboard/classroom")} size="sm" className="text-xs">
            Return to AI Classroom <BookOpen className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Remediation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Injected Remedial Lessons
              </span>
              <CardTitle className="text-2xl font-bold text-primary mt-1">
                {remedialLessons.length} <span className="text-xs font-normal text-muted-foreground">Review Modules</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Identified Weak Concepts
              </span>
              <CardTitle className="text-2xl font-bold text-amber-500 mt-1">
                {weakAreas.length} <span className="text-xs font-normal text-muted-foreground">Focus Topics</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Path Adaptation Status
              </span>
              <CardTitle className="text-2xl font-bold text-emerald-500 mt-1">
                Active & Tuned
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Remediations & Weak Areas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Remedial Lessons Injected */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" /> Injected Remedial Review Modules
              </CardTitle>
              <CardDescription className="text-xs">
                Custom lessons inserted directly into your database syllabus by the Adaptive Coach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {remedialLessons.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No remedial lessons injected yet. The Adaptive Coach activates if a quiz score drops below 70%.
                </div>
              ) : (
                remedialLessons.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-card-foreground">{item.title}</span>
                      <Badge variant="default" className="text-[9px]">
                        {item.status || "UNLOCKED"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.moduleTitle}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Identified Weak Concept Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Active Concept Gaps
              </CardTitle>
              <CardDescription className="text-xs">
                Concepts flagged for extra practice and remediation tuning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weakAreas.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No active concept gaps recorded.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {weakAreas.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-amber-500/40 text-amber-500 text-xs py-1 px-2.5">
                      <AlertCircle className="w-3 h-3 mr-1.5" /> {skill}
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
