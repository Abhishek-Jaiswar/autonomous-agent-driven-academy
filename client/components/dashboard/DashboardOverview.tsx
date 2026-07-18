"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  BrainCircuit,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  FolderKanban,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DashboardOverviewProps {
  curriculumData: any
  onReset: () => void
}

export function DashboardOverview({
  curriculumData,
  onReset,
}: DashboardOverviewProps) {
  const router = useRouter()
  const goal = curriculumData?.data
  const phases = goal?.curriculum?.phases || []
  const resources = goal?.resources || []

  // Progress Calculations
  let totalLessons = 0
  let completedLessons = 0
  let currentLesson: any = null
  let currentModuleTitle = ""

  phases.forEach((phase: any) => {
    phase.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        totalLessons++
        if (les.status === "COMPLETED") {
          completedLessons++
        }
        if (!currentLesson && les.status !== "LOCKED" && les.status !== "COMPLETED") {
          currentLesson = les
          currentModuleTitle = mod.title
        }
      })
    })
  })

  if (!currentLesson && totalLessons > 0) {
    currentLesson = phases[0]?.modules[0]?.lessons[0]
    currentModuleTitle = phases[0]?.modules[0]?.title
  }

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const includedResourcesCount = resources.filter((r: any) => r.status === "INCLUDED").length

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card">
        <div className="space-y-1 max-w-2xl">
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            WELCOME TO ASTRALEARN AI
          </Badge>
          <h1 className="text-2xl font-extrabold text-card-foreground">
            {goal?.goalText ? `Active Target: ${goal.goalText}` : "Welcome to Your AI Academy Workspace"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your multi-project learning progress, attempt knowledge check quizzes, and switch between active workspaces.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard/quickstart")}>
            <Plus className="mr-1.5 h-4 w-4" /> Start New Project
          </Button>
          <Button onClick={() => router.push("/dashboard/projects")} variant="outline">
            <FolderKanban className="mr-1.5 h-4 w-4" /> All Projects
          </Button>
        </div>
      </div>

      {/* Analytics & Report Summary Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Current Progress</span>
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-primary mt-1">
              {progressPercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-[11px] text-muted-foreground font-mono">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Timeline</span>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              {goal?.durationDays || 7} <span className="text-xs font-normal text-muted-foreground">Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Autonomous pace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Verified Sources</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              {includedResourcesCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">Included</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">SourceTrust Board verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Learning Streak</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">Agentic Coach tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Lesson Quick Resume Card */}
          {currentLesson && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-[10px]">
                    ACTIVE MODULE: {currentModuleTitle}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Lesson {completedLessons + 1}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground mt-2">
                  {currentLesson.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {currentLesson.content?.slice(0, 180)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 flex justify-end">
                <Button
                  onClick={() => {
                    localStorage.setItem("astralearn_active_lesson_id", currentLesson.id)
                    router.push("/dashboard/classroom")
                  }}
                  size="sm"
                >
                  Open AI Classroom <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Adaptive Coach Diagnostics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" />
                Adaptive Coach Diagnostics & Weak Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal?.profile?.weakAreas && goal.profile.weakAreas.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-card-foreground">
                        Identified Concept Gaps
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        The Profiler & Adaptive Coach detected specific gaps to prioritize during your lesson reviews.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {goal.profile.weakAreas.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  Completing lessons and knowledge check quizzes generates coach diagnostics.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Capabilities */}
        <div className="space-y-6">
          <Card className="flex flex-col justify-between h-full">
            <CardHeader>
              <Badge variant="outline" className="w-fit text-[10px]">
                ASTRA ACADEMY
              </Badge>
              <CardTitle className="text-base font-bold mt-2 text-card-foreground">
                Autonomous AI Education Stack
              </CardTitle>
              <CardDescription className="text-xs">
                9 specialized agents working in harmony to orchestrate your personalized learning.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Counselor & Intake Alignment</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Curriculum Architect Syllabi</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>SourceTrust Web Scraping & RAG</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Teacher Textbook & Diagram Generation</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Examiner Quiz & Adaptive Remediation</span>
              </div>
            </CardContent>

            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={onReset}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Reset Current Active Session
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

