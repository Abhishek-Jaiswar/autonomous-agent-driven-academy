"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Brain,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useGetUserAnalyticsQuery } from "@/store/api/auth/auth-api";

interface UserAnalytics {
  totalProjects: number;
  totalLessons: number;
  completedLessons: number;
  overallProgress: number;
  totalAttempts: number;
  passedAttempts: number;
  quizPassRate: number;
  skillBaseline: Record<string, string>;
}

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading } = useGetUserAnalyticsQuery();
  const analytics: UserAnalytics | null = analyticsData?.data || null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Calculating learning analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-card-foreground">Analytics & Performance</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your learning milestones, evaluation accuracy, completed lessons, and skill baseline growth across all projects.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Total Workspaces</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{analytics?.totalProjects || 0}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Active & completed goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Lessons Mastery</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {analytics?.completedLessons || 0} / {analytics?.totalLessons || 0}
            </div>
            <Progress value={analytics?.overallProgress || 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Quiz Accuracy</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{analytics?.quizPassRate || 0}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {analytics?.passedAttempts || 0} of {analytics?.totalAttempts || 0} evaluations passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Learning Streak</CardTitle>
            <Zap className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">Active</div>
            <p className="text-[11px] text-muted-foreground mt-1">Autonomous coach tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Baseline Radar / Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Skill Baseline Index</CardTitle>
          </div>
          <CardDescription>
            Synthesized competency levels evaluated by the AI Profiler across your tech stack.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics?.skillBaseline || {}).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No skills profiled yet. Start a goal in Quick Start to generate your skill index.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(analytics?.skillBaseline || {}).map(([skill, level]) => (
                <div key={skill} className="rounded-lg border border-border p-3 bg-muted/30 flex justify-between items-center">
                  <span className="text-xs font-bold text-card-foreground">{skill}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
