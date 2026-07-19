"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, HelpCircle, CheckCircle2, XCircle, BarChart3, RefreshCw, BookOpen, BrainCircuit } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetUserAnalyticsQuery, useGetUserProjectsQuery } from "@/store/api/auth/auth-api";

export default function ExaminerAgentPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();
  const { data: analyticsData } = useGetUserAnalyticsQuery();
  const analytics = analyticsData?.data;

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

  return (
    <AgentGateGuard agentId="examiner" agentNumber="09" agentName="Examiner Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 09: EXAMINER
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-amber-500 border-amber-500/30">
                Assessment & Knowledge Evaluation
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              Knowledge Check Quizzes & Evaluation Metrics
            </h1>
            <p className="text-xs text-muted-foreground">
              Generates targeted 3-question MCQ evaluations per lesson, grades submissions, and triggers the Adaptive Coach on scores under 70%.
            </p>
          </div>

          <Button onClick={() => router.push("/dashboard/classroom")} size="sm" className="text-xs">
            Attempt Quiz in AI Classroom <BookOpen className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Evaluation Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Overall Quiz Accuracy
              </span>
              <CardTitle className="text-2xl font-bold text-amber-500 mt-1">
                {analytics?.quizPassRate || 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Average score across all attempted evaluations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Passed Evaluations
              </span>
              <CardTitle className="text-2xl font-bold text-emerald-500 mt-1">
                {analytics?.passedAttempts || 0} <span className="text-xs font-normal text-muted-foreground">Quizzes Passed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Scored 70%+ on knowledge check</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Total Attempts Submitted
              </span>
              <CardTitle className="text-2xl font-bold text-card-foreground mt-1">
                {analytics?.totalAttempts || 0} <span className="text-xs font-normal text-muted-foreground">Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Evaluated by Examiner Agent</p>
            </CardContent>
          </Card>
        </div>

        {/* Examiner Guidelines & Assessment Protocol */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Assessment & Mastery Protocol
            </CardTitle>
            <CardDescription className="text-xs">
              How the Examiner Agent measures student retention and hands off control to the Adaptive Coach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <h4 className="font-bold text-card-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Score 70%+ (Passing Score)
              </h4>
              <p>
                The Examiner Agent marks the active lesson as <strong>COMPLETED</strong>, unlocks the next lesson in the syllabus, and updates your overall progress percentage.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <h4 className="font-bold text-card-foreground flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-500" /> Score Below 70% (Remediation Trigger)
              </h4>
              <p>
                If your score falls below 70%, the Examiner Agent extracts your missed concepts and hands control immediately to <strong>Agent 10: Adaptive Coach</strong> to inject a targeted remedial review lesson.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgentGateGuard>
  );
}
