"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, BookOpen, CheckCircle2, Lock, ArrowRight, Compass, Sliders, Loader2, Sparkles } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCurriculumQuery, useGetUserProjectsQuery, useTriggerScheduleMutation, useTriggerRagIndexingMutation } from "@/store/api/auth/auth-api";

export default function SchedulePlannerPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();
  const [triggerSchedule, { isLoading: isScheduling }] = useTriggerScheduleMutation();
  const [triggerRagIndexing, { isLoading: isIndexing }] = useTriggerRagIndexingMutation();

  const [customDays, setCustomDays] = useState<number>(14);

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
  const phases = goal?.curriculum?.phases || [];

  useEffect(() => {
    if (goal?.durationDays) {
      setCustomDays(goal.durationDays);
    }
  }, [goal]);

  const allLessons: any[] = [];
  phases.forEach((phase: any) => {
    phase.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        allLessons.push({
          ...les,
          moduleTitle: mod.title,
          phaseTitle: phase.title,
        });
      });
    });
  });

  const durationDays = customDays || goal?.durationDays || 14;
  const lessonsPerDay = Math.max(1, Math.ceil(allLessons.length / durationDays));

  async function handleGenerateScheduleAndRag() {
    if (!goalId) return;
    try {
      await triggerSchedule({ goalId, durationDays }).unwrap();
      await triggerRagIndexing({ goalId }).unwrap();
      router.push("/dashboard/classroom");
    } catch (err) {
      console.error("Failed to generate schedule & RAG indexing:", err);
      router.push("/dashboard/classroom");
    }
  }

  const isWorking = isScheduling || isIndexing;

  return (
    <AgentGateGuard agentId="schedule" agentNumber="06" agentName="Schedule Planner Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 06: SCHEDULE PLANNER
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/30">
                User Pace & Vector RAG Pipeline
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              Daily Workload & Vector RAG Allocation
            </h1>
            <p className="text-xs text-muted-foreground">
              Customize your target duration, map daily lessons, and trigger textbook RAG vector indexing before entering classroom.
            </p>
          </div>

          <Button
            onClick={handleGenerateScheduleAndRag}
            disabled={isWorking}
            size="sm"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isWorking ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isWorking ? "Indexing RAG Database..." : "Index Vector RAG & Enter Classroom"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Custom Pace Controls Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> Target Pace & Workload Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Adjust your target study duration below to recalculate daily workload.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-card-foreground">Target Study Duration (Days)</label>
                <div className="flex items-center gap-2 mt-1">
                  {[7, 14, 21, 30].map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={customDays === days ? "default" : "outline"}
                      onClick={() => setCustomDays(days)}
                      className="h-8 text-xs font-mono"
                    >
                      {days} Days
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-muted-foreground">Daily Pace:</span>
                  <span className="font-bold text-primary">~{lessonsPerDay} lessons / day</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-muted-foreground">Est. Daily Hours:</span>
                  <span className="font-bold text-emerald-500">~{Math.round(lessonsPerDay * 45)} mins</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Planned Timeline
              </span>
              <CardTitle className="text-2xl font-bold text-violet-500 mt-1 flex items-baseline gap-1">
                {durationDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Daily Workload
              </span>
              <CardTitle className="text-2xl font-bold text-card-foreground mt-1 flex items-baseline gap-1">
                ~{lessonsPerDay} <span className="text-xs font-normal text-muted-foreground">Lessons / Day</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Total Modules Planned
              </span>
              <CardTitle className="text-2xl font-bold text-emerald-500 mt-1">
                {allLessons.length} <span className="text-xs font-normal text-muted-foreground">Lessons Total</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Chronological Syllabus Schedule Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-500" /> Planned Calendar Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Lessons organized sequentially across your study days. Day 1, Lesson 1 is unlocked and ready for vector indexing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allLessons.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No scheduled lessons available yet. Initiate Curriculum Architect first.
              </div>
            ) : (
              allLessons.map((item: any, idx: number) => {
                const dayNumber = Math.floor(idx / lessonsPerDay) + 1;
                const isLocked = item.status === "LOCKED";
                const isDone = item.status === "COMPLETED";

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : isLocked
                        ? "border-border bg-muted/20 text-muted-foreground opacity-60"
                        : "border-violet-500/40 bg-card text-card-foreground font-bold shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        Day {dayNumber}
                      </Badge>

                      <div>
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-violet-500 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-card-foreground">{item.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.phaseTitle} • {item.moduleTitle}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={isDone ? "default" : isLocked ? "outline" : "secondary"}
                      className="text-[9px] uppercase font-mono shrink-0"
                    >
                      {item.status || "UNLOCKED"}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AgentGateGuard>
  );
}
