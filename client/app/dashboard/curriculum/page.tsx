"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Compass,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useGetCurriculumQuery, useGetUserProjectsQuery } from "@/store/api/auth/auth-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";

export default function CurriculumMap() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData, isLoading: isLoadingProjects } = useGetUserProjectsQuery();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      if (savedGoalId) {
        setGoalId(savedGoalId);
      } else if (userProjectsData?.data && userProjectsData.data.length > 0) {
        const latestGoalId = userProjectsData.data[0].id;
        localStorage.setItem("astralearn_goal_id", latestGoalId);
        setGoalId(latestGoalId);
      }
    }
  }, [userProjectsData]);

  const [pollInterval, setPollInterval] = useState(0);

  const { data, isLoading, error, refetch } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
    pollingInterval: pollInterval,
  });

  useEffect(() => {
    if (data?.data?.phases?.length === 0) {
      setPollInterval(5000);
    } else {
      setPollInterval(0);
    }
  }, [data]);

  if (isLoading || isLoadingProjects) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Curriculum Architect generating syllabus phases...
        </p>
      </div>
    );
  }

  if (!goalId) {
    return (
      <Card className="max-w-md mx-auto mt-12 text-center p-6 border-border">
        <CardHeader>
          <CardTitle>No Active Learning Goal</CardTitle>
          <CardDescription>
            You have not created any learning goals yet. Start a new goal to generate your custom curriculum roadmap.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard/counselor")}>
            <Compass className="mr-2 h-4 w-4" /> Start Counselor Intake
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 text-destructive max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Error Loading Curriculum
          </CardTitle>
          <CardDescription>
            Make sure the backend is active and your network connection is stable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  const goal = data?.data;
  const phases = goal?.curriculum?.phases || [];
  const resources = goal?.resources || [];
  const isGenerating = phases.length === 0;

  function handleLessonClick(lessonId: string, status: string) {
    if (status === "LOCKED") return;
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_active_lesson_id", lessonId);
    }
    router.push("/dashboard/classroom");
  }

  return (
    <AgentGateGuard agentId="curriculum" agentNumber="05" agentName="Curriculum Architect">
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 05: CURRICULUM ARCHITECT
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-violet-500 border-violet-500/30">
                Syllabus Architecture Compiled
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-500" />
              Structured Syllabus Map & Phases
            </h1>
            <p className="text-xs text-muted-foreground">
              Review your compiled syllabus phases and modules below before initiating the Schedule Planner.
            </p>
          </div>

          <Button
            onClick={() => router.push("/dashboard/schedule")}
            size="sm"
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" /> Initiate Schedule Planner (Agent 06) <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Dashboard Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Active Learning Target
              </span>
              <CardTitle className="text-lg font-bold text-card-foreground line-clamp-1">
                {goal?.goalText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Category: <span className="text-violet-500 font-semibold capitalize">{goal?.category?.replace("_", " ")}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Target Timeline
              </span>
              <CardTitle className="text-2xl font-black text-violet-500 flex items-baseline gap-1">
                {goal?.durationDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Goal Duration
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Verified Sources
              </span>
              <CardTitle className="text-2xl font-black text-indigo-500">
                {resources.filter((r: any) => r.status === "INCLUDED").length}{" "}
                <span className="text-xs font-normal text-muted-foreground">Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SourceTrust Approved
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Syllabus Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {isGenerating ? (
              <Card className="py-16 text-center">
                <CardContent className="space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
                  <h3 className="text-lg font-bold text-card-foreground">
                    Syllabus Architecture in Progress...
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Curriculum Architect is structuring your syllabus modules. This screen auto-refreshes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {phases.map((phase: any, phaseIdx: number) => (
                  <Card key={phase.id}>
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-violet-500/30 text-violet-500 text-xs font-mono">
                          Phase {phaseIdx + 1}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-card-foreground mt-1">
                        {phase.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {phase.modules?.map((mod: any) => (
                        <div key={mod.id} className="space-y-2 border-l-2 border-border pl-3 py-1">
                          <h4 className="text-xs font-semibold text-card-foreground">
                            Module: {mod.title}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {mod.lessons?.map((les: any) => {
                              const isLocked = les.status === "LOCKED";
                              const isDone = les.status === "COMPLETED";

                              return (
                                <div
                                  key={les.id}
                                  onClick={() => handleLessonClick(les.id, les.status)}
                                  className={`p-3 rounded-lg border flex items-center justify-between transition-all select-none text-xs ${
                                    isLocked
                                      ? "border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed"
                                      : "border-border bg-card text-card-foreground hover:border-violet-500/50 cursor-pointer"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {isLocked ? (
                                      <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    ) : isDone ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 animate-pulse" />
                                    )}
                                    <span className="truncate">{les.title}</span>
                                  </div>
                                  {!isLocked && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sourcing Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> SourceTrust References
                </CardTitle>
                <CardDescription className="text-xs">
                  Materials referenced by the Curriculum Architect.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {resources.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No materials linked.</p>
                ) : (
                  resources.slice(0, 5).map((res: any) => (
                    <div key={res.id} className="p-2.5 rounded-lg border border-border bg-muted/30 text-xs flex items-center justify-between">
                      <span className="truncate pr-2 font-medium">{res.title}</span>
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                        {res.trustScore}/100
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AgentGateGuard>
  );
}
