"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetCurriculumQuery, useGetUserProjectsQuery, useGetUserAnalyticsQuery } from "@/store/api/auth/auth-api";

export type AgentId =
  | "counselor"
  | "profiler"
  | "sourcetrust"
  | "verifier"
  | "curriculum"
  | "schedule"
  | "classroom"
  | "visuals"
  | "examiner"
  | "coach";

interface AgentGateGuardProps {
  agentId: AgentId;
  agentNumber: string; // e.g. "02"
  agentName: string;   // e.g. "Profiler Agent"
  children: React.ReactNode;
}

export function AgentGateGuard({
  agentId,
  agentNumber,
  agentName,
  children,
}: AgentGateGuardProps) {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData, isLoading: isLoadingProjects } = useGetUserProjectsQuery();
  const { data: analyticsData } = useGetUserAnalyticsQuery();

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

  const { data: curriculumData, isLoading: isLoadingCurriculum } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  if (isLoadingProjects || (goalId && isLoadingCurriculum)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Verifying agent workspace permissions...
        </p>
      </div>
    );
  }

  // Check state gating
  const goal = curriculumData?.data;
  const profile = goal?.profile;
  const phases = goal?.curriculum?.phases || [];
  const analytics = analyticsData?.data;

  // Strict gating checks based on graph execution outputs
  const isInterviewComplete = Boolean(
    profile?.skillBaseline && Object.keys(profile.skillBaseline).length > 0
  );
  const isCurriculumReady = phases.length > 0;
  const completedLessons = analytics?.completedLessons || 0;
  const hasCompletedLesson = completedLessons > 0;

  let isUnlocked = false;
  let lockReason = "Complete your intake interview with the Counselor Agent to unlock this workspace.";

  switch (agentId) {
    case "counselor":
      isUnlocked = true; // Always unlocked for project intake
      break;
    case "profiler":
    case "sourcetrust":
    case "verifier":
      isUnlocked = isInterviewComplete;
      lockReason = "Complete your diagnostic counseling interview (Agent 01) to compile your learner profile and unlock resources.";
      break;
    case "curriculum":
    case "schedule":
      isUnlocked = isCurriculumReady;
      lockReason = "Click 'Build curriculum' on your compiled profile to allow the Curriculum Architect & Schedule Planner to build your syllabus.";
      break;
    case "classroom":
    case "visuals":
    case "examiner":
      isUnlocked = isCurriculumReady;
      lockReason = "Syllabus architecture generation in progress. AI Classroom and sub-agents will unlock once curriculum phases are compiled.";
      break;
    case "coach":
      isUnlocked = hasCompletedLesson;
      lockReason = "The Adaptive Coach unlocks after you complete at least one lesson or attempt a quiz in the AI Classroom.";
      break;
    default:
      isUnlocked = true;
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto my-12 space-y-4">
        <Card className="border-amber-500/30 bg-card text-center p-6">
          <CardHeader className="space-y-3 pb-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-amber-500 border-amber-500/30">
                AGENT {agentNumber} LOCKED
              </Badge>
              <CardTitle className="text-xl font-bold text-card-foreground mt-1">
                {agentName} Unavailable
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {lockReason}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              onClick={() => router.push(isInterviewComplete ? "/dashboard/profiler" : "/dashboard/counselor")}
              className="w-full sm:w-auto font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isInterviewComplete ? "View Learner Profiler (Agent 02)" : "Go to Counselor Agent Intake"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
