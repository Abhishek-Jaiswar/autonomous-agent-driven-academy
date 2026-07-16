"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Compass, ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { useGetCurriculumQuery } from "@/lib/redux/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CurriculumMap() {
  const router = useRouter();

  // Retrieve goalId from localStorage
  const [goalId, setGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      setGoalId(savedGoalId);
    }
  }, []);

  const [pollInterval, setPollInterval] = useState(0);

  // Fetch Curriculum with auto-polling if data is empty (still generating)
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

  if (isLoading || !goalId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-slate-400 text-sm font-mono animate-pulse">Loading curriculum details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/20 text-red-400 max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Error Loading Curriculum
          </CardTitle>
          <CardDescription className="text-red-300/80">
            Make sure the backend is active and your network connection is stable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} className="bg-red-900 hover:bg-red-800 text-white">
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

  // Navigate to classroom for a specific lesson
  function handleLessonClick(lessonId: string, status: string) {
    if (status === "LOCKED") return;
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_active_lesson_id", lessonId);
    }
    router.push("/dashboard/classroom");
  }

  return (
    <div className="space-y-6">
      
      {/* ── Dashboard Top Cards (dashboard-01 style) ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Goal */}
        <Card className="border-slate-900 bg-slate-900/50 md:col-span-2">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">Active Learning Target</span>
            <CardTitle className="text-lg font-bold text-white line-clamp-1">{goal?.goalText}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Category: <span className="text-violet-300 font-medium capitalize">{goal?.category.replace("_", " ")}</span></p>
          </CardContent>
        </Card>

        {/* Card 2: Duration */}
        <Card className="border-slate-900 bg-slate-900/50">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">Study Duration</span>
            <CardTitle className="text-2xl font-black text-violet-400 flex items-baseline gap-1">
              {goal?.durationDays} <span className="text-xs font-normal text-slate-400">Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Planned Schedule
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Resources Count */}
        <Card className="border-slate-900 bg-slate-900/50">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">Verified Materials</span>
            <CardTitle className="text-2xl font-black text-indigo-400">
              {resources.filter((r: any) => r.status === "INCLUDED").length} <span className="text-xs font-normal text-slate-400">Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> SourceTrust Screened
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Main Dashboard Layout Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column (2-Span): The Syllabus Roadmap */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
            <Compass className="w-5 h-5 text-violet-400" />
            Personalized Syllabus Map
          </h2>

          {isGenerating ? (
            <Card className="border-slate-900 bg-slate-900/30 py-16 text-center">
              <CardContent className="space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Syllabus Architecture in Progress...</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Our Curriculum Architect and Scheduler agents are structuring your syllabus modules. This screen will auto-refresh.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {phases.map((phase: any, phaseIdx: number) => (
                <Card key={phase.id} className="border-slate-900 bg-slate-900/30">
                  <CardHeader className="border-b border-slate-900/60 pb-3 bg-slate-900/10">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-violet-500/30 text-violet-400 text-xs">
                        Phase {phaseIdx + 1}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">ID: {phase.id.slice(0, 8)}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-200 mt-1">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    
                    {/* Render Modules in Phase */}
                    {phase.modules?.map((mod: any) => (
                      <div key={mod.id} className="space-y-2 border-l-2 border-slate-800 pl-4 py-1">
                        <h4 className="text-sm font-semibold text-slate-300">{mod.title}</h4>
                        
                        {/* Render Lessons in Module */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {mod.lessons?.map((les: any) => {
                            const isLocked = les.status === "LOCKED";
                            const isDone = les.status === "COMPLETED";
                            
                            return (
                              <div
                                key={les.id}
                                onClick={() => handleLessonClick(les.id, les.status)}
                                className={`p-3 rounded-lg border flex items-center justify-between transition-all select-none ${
                                  isLocked
                                    ? "bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed"
                                    : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-violet-500/50 hover:bg-slate-900 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  {isLocked ? (
                                    <Lock className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                                  ) : isDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                  ) : (
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0 pulse-dot" />
                                  )}
                                  <span className="text-xs font-medium truncate">{les.title}</span>
                                </div>
                                {!isLocked && <ArrowRight className="w-3.5 h-3.5 text-slate-500" />}
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

        {/* Right Column: Sourcing Board Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Verified Sourcing
          </h2>

          <Card className="border-slate-900 bg-slate-900/50 flex flex-col h-fit">
            <CardHeader className="border-b border-slate-900 pb-3">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">SourceTrust Index</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Discovery search results ranked by credibility points
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {resources.length === 0 ? (
                <p className="text-slate-600 text-xs italic">No resources evaluated yet...</p>
              ) : (
                resources.map((res: any) => {
                  const isRejected = res.status === "REJECTED";
                  return (
                    <div
                      key={res.id}
                      className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                        isRejected
                          ? "bg-red-950/5 border-red-950/20 text-slate-500"
                          : "bg-slate-950/60 border-slate-900 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate text-slate-200">{res.title}</span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-mono py-0.5 px-1.5 rounded ${
                            isRejected
                              ? "bg-red-950/30 text-red-400 border border-red-900/30"
                              : "bg-green-950/30 text-green-400 border border-green-900/30"
                          }`}
                        >
                          {res.trustScore}/100
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{res.reason}</p>
                      {res.url && !isRejected && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:text-violet-300 hover:underline inline-block mt-0.5"
                        >
                          View Resource URL ↗
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
