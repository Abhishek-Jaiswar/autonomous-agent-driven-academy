"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Trash2,
  Loader2,
  Compass,
  BookOpen,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveGoalId(localStorage.getItem("astralearn_goal_id"));
    }
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("astralearn_token") : "";
      const res = await fetch("http://localhost:5000/curriculum/projects", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch user projects:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenWorkspace(project: UserProject) {
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_goal_id", project.id);
      setActiveGoalId(project.id);
    }
    router.push("/dashboard/classroom");
  }

  function handleViewRoadmap(project: UserProject) {
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_goal_id", project.id);
      setActiveGoalId(project.id);
    }
    router.push("/dashboard/curriculum");
  }

  async function handleDeleteProject(goalId: string) {
    setDeletingId(goalId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("astralearn_token") : "";
      const res = await fetch(`http://localhost:5000/curriculum/project/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== goalId));
        if (activeGoalId === goalId) {
          localStorage.removeItem("astralearn_goal_id");
          setActiveGoalId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeletingId(null);
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
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Progress</span>
                      <span className="text-card-foreground font-bold">{project.progressPercentage}%</span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-2" />
                    <div className="text-[11px] text-muted-foreground">
                      {project.completedLessons} of {project.totalLessons} lessons completed
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <Button
                      onClick={() => handleOpenWorkspace(project)}
                      className="w-full justify-between"
                      size="sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Open AI Classroom
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRoadmap(project)}
                        className="flex-1"
                      >
                        <Compass className="mr-1.5 h-3.5 w-3.5" /> Roadmap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deletingId === project.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
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
