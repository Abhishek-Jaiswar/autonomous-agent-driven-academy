"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Trash2,
  Loader2,
  Calendar,
  Sparkles,
  Layers,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useGetUserProjectsQuery, useDeleteUserProjectMutation } from "@/store/api/auth/auth-api";

interface UserProject {
  id: string;
  goalText: string;
  category: string;
  durationDays: number;
  createdAt: string;
  scope: string;
  recommendedFlow: string;
  requiresPaidPlan: boolean;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  profile?: {
    interviewChat?: any[];
    skillBaseline?: any;
    counselorStage?: string;
  };
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const { data: projectsData, isLoading } = useGetUserProjectsQuery();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteUserProjectMutation();

  const projects: UserProject[] = projectsData?.data || [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveGoalId(localStorage.getItem("astralearn_goal_id"));
    }
  }, []);

  function getProjectStep(project: UserProject) {
    const profile = project.profile || {};
    const isInterviewComplete = Boolean(
      profile.skillBaseline && Object.keys(profile.skillBaseline).length > 0
    );

    if (!isInterviewComplete) {
      return {
        stepNumber: 1,
        totalSteps: 3,
        stepTitle: "Step 1/3: Diagnostic Interview",
        statusText: "Complete intake interview with Counselor Agent",
        route: "/dashboard/counselor",
      };
    }

    if (project.totalLessons === 0) {
      return {
        stepNumber: 2,
        totalSteps: 3,
        stepTitle: "Step 2/3: Generating Syllabus",
        statusText: "Architect & Librarian building learning modules",
        route: "/dashboard/curriculum",
      };
    }

    return {
      stepNumber: 3,
      totalSteps: 3,
      stepTitle: `Step 3/3: Active Classroom (${project.completedLessons}/${project.totalLessons} Done)`,
      statusText: `${project.progressPercentage}% Completed`,
      route: "/dashboard/classroom",
    };
  }

  function handleResumeWorkspace(project: UserProject, targetRoute: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_goal_id", project.id);
      localStorage.removeItem("astralearn_active_lesson_id");
      setActiveGoalId(project.id);
    }
    router.push(targetRoute);
  }

  async function handleDeleteProject(goalId: string) {
    try {
      await deleteProject(goalId).unwrap();
      if (activeGoalId === goalId) {
        localStorage.removeItem("astralearn_goal_id");
        setActiveGoalId(null);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Loading your learning workspaces...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-card-foreground">My Workspaces</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your AI-powered learning projects, track progress, and switch between active workspaces.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/quickstart")}>
          <Plus className="mr-1.5 h-4 w-4" /> New Learning Goal
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold text-card-foreground">No learning workspaces created yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start your first AI learning path or instant concept check to create a project workspace.
            </p>
            <Button onClick={() => router.push("/dashboard/quickstart")}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Quick Start a Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isActive = project.id === activeGoalId;
            const stepInfo = getProjectStep(project);

            return (
              <Card key={project.id} className={`flex flex-col justify-between transition-all ${isActive ? "border-primary shadow-sm" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={isActive ? "default" : "outline"} className="text-[10px] uppercase">
                      {isActive ? "ACTIVE WORKSPACE" : project.category.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {project.scope}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-card-foreground line-clamp-2 mt-2">
                    {project.goalText}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 text-muted-foreground mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()} · {project.durationDays} days
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Step Checker Badge */}
                  <div className="p-2.5 rounded-lg border border-border bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-card-foreground">
                      <span className="flex items-center gap-1.5 text-primary font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        {stepInfo.stepTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{stepInfo.statusText}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Progress</span>
                      <span className="text-card-foreground font-bold">{project.progressPercentage}%</span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-2" />
                  </div>

                  {/* Single Action Button: Resume Learning Workspace */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      onClick={() => handleResumeWorkspace(project, stepInfo.route)}
                      className="flex-1 justify-between font-bold"
                      size="sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4" /> Resume Learning Workspace
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      title="Delete Project"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
