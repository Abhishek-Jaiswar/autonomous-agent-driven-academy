"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  FolderKanban,
  Zap,
  MessageSquare,
  Compass,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle,
  Lock,
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

import { useGetUserAnalyticsQuery } from "@/store/api/auth/auth-api"

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
  const profile = goal?.profile
  const phases = goal?.curriculum?.phases || []
  const resources = goal?.resources || []

  const isGoalStarted = Boolean(goal?.id)
  const isInterviewComplete = Boolean(
    profile?.skillBaseline && Object.keys(profile.skillBaseline).length > 0
  )
  const isCurriculumReady = phases.length > 0

  // Overall User Analytics across all projects
  const { data: analyticsData } = useGetUserAnalyticsQuery()
  const analytics = analyticsData?.data

  // Active Project Current Lesson Lookup
  let currentLesson: any = null
  let currentModuleTitle = ""

  phases.forEach((phase: any) => {
    phase.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        if (!currentLesson && les.status !== "LOCKED" && les.status !== "COMPLETED") {
          currentLesson = les
          currentModuleTitle = mod.title
        }
      })
    })
  })

  if (!currentLesson && phases.length > 0) {
    currentLesson = phases[0]?.modules[0]?.lessons[0]
    currentModuleTitle = phases[0]?.modules[0]?.title
  }

  // All 10 Agents Matrix Data
  const agentMatrix = [
    {
      id: "counselor",
      number: "01",
      name: "Counselor Agent",
      role: "Intake & Goal Diagnostics",
      url: "/dashboard/counselor",
      icon: <MessageSquare className="w-4 h-4 text-primary" />,
      status: profile ? "Profile Compiled" : goal ? "Active Intake" : "Ready",
      isLocked: false,
    },
    {
      id: "profiler",
      number: "02",
      name: "Learner Profiler",
      role: "Skill Baseline & Style Synthesis",
      url: "/dashboard/profiler",
      icon: <BrainCircuit className="w-4 h-4 text-indigo-500" />,
      status: profile ? "Synthesized" : "Pending Intake",
      isLocked: !isGoalStarted,
    },
    {
      id: "sourcetrust",
      number: "03",
      name: "Librarian Board",
      role: "Web Resource Discovery & RAG",
      url: "/dashboard/sourcetrust",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />,
      status: resources.length > 0 ? `${resources.length} Discovered` : "Pending",
      isLocked: !isGoalStarted,
    },
    {
      id: "verifier",
      number: "04",
      name: "Source Verifier",
      role: "SourceTrust Credibility Engine",
      url: "/dashboard/verifier",
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      status: resources.length > 0 ? `${resources.filter((r: any) => r.status === "INCLUDED").length} Verified` : "Pending",
      isLocked: !isGoalStarted,
    },
    {
      id: "curriculum",
      number: "05",
      name: "Curriculum Architect",
      role: "Syllabus Phase & Module Builder",
      url: "/dashboard/curriculum",
      icon: <Compass className="w-4 h-4 text-violet-500" />,
      status: phases.length > 0 ? `${phases.length} Phases Active` : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
    {
      id: "schedule",
      number: "06",
      name: "Schedule Planner",
      role: "Calendar & Pace Allocation",
      url: "/dashboard/schedule",
      icon: <Calendar className="w-4 h-4 text-violet-500" />,
      status: isCurriculumReady ? `${goal?.durationDays || 14} Days Mapped` : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
    {
      id: "classroom",
      number: "07",
      name: "AI Classroom (Teacher)",
      role: "Interactive Lessons & Textbook",
      url: "/dashboard/classroom",
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      status: isCurriculumReady ? "Classroom Active" : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
    {
      id: "visuals",
      number: "08",
      name: "Visual Explainer",
      role: "Mermaid.js Concept Diagrams",
      url: "/dashboard/visuals",
      icon: <Layers className="w-4 h-4 text-primary" />,
      status: isCurriculumReady ? "Blueprints Active" : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
    {
      id: "examiner",
      number: "09",
      name: "Examiner Agent",
      role: "Knowledge Check MCQ Quizzes",
      url: "/dashboard/examiner",
      icon: <Award className="w-4 h-4 text-amber-500" />,
      status: isCurriculumReady ? "Evaluations Ready" : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
    {
      id: "coach",
      number: "10",
      name: "Adaptive Coach",
      role: "Path Tuning & Remediation",
      url: "/dashboard/coach",
      icon: <Zap className="w-4 h-4 text-primary" />,
      status: isCurriculumReady ? "Path Tuner Active" : "Locked",
      isLocked: !isCurriculumReady && !isInterviewComplete,
    },
  ]

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
            Track your 10-agent autonomous learning pipeline, jump between dedicated workspace pages, and monitor real-time graph updates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard/quickstart")}>
            <Plus className="mr-1.5 h-4 w-4" /> Start New Project
          </Button>
          <Button onClick={() => router.push("/dashboard/projects")} variant="outline">
            <FolderKanban className="mr-1.5 h-4 w-4" /> All Workspaces
          </Button>
        </div>
      </div>

      {/* Overall User Analytics Summary Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Overall Progress</span>
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-primary mt-1">
              {analytics?.overallProgress || 0}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={analytics?.overallProgress || 0} className="h-2" />
            <p className="text-[11px] text-muted-foreground font-mono">
              {analytics?.completedLessons || 0} of {analytics?.totalLessons || 0} lessons completed overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Total Workspaces</span>
              <FolderKanban className="h-4 w-4 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              {analytics?.totalProjects || 0} <span className="text-xs font-normal text-muted-foreground">Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">User created goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>Quiz Accuracy</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              {analytics?.quizPassRate || 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              {analytics?.passedAttempts || 0} of {analytics?.totalAttempts || 0} evaluations passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-mono">
              <span>10-Agent Pipeline</span>
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-card-foreground mt-1">
              Active Graph
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground font-mono">Sequential state gating active</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Autonomous 10-Agent Workspaces Pipeline Matrix ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Autonomous 10-Agent Pipeline Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Track the state of all 10 specialized agent workspaces in your learning graph. Select an active agent page to jump into its environment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {agentMatrix.map((agent) => (
            <Card
              key={agent.id}
              className={`flex flex-col justify-between transition-all ${
                agent.isLocked
                  ? "opacity-60 bg-muted/20 border-border"
                  : "hover:border-primary/50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] font-mono uppercase">
                    AGENT {agent.number}
                  </Badge>
                  <Badge
                    variant={agent.isLocked ? "outline" : "secondary"}
                    className="text-[9px] font-mono"
                  >
                    {agent.isLocked ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    ) : (
                      <span className="text-emerald-500">{agent.status}</span>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-xs font-bold text-card-foreground flex items-center gap-1.5 mt-2">
                  {agent.icon} {agent.name}
                </CardTitle>
                <CardDescription className="text-[11px] line-clamp-2">
                  {agent.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  onClick={() => router.push(agent.url)}
                  disabled={agent.isLocked}
                  size="sm"
                  variant={agent.isLocked ? "outline" : "default"}
                  className="w-full text-[11px] justify-between h-8"
                >
                  <span>{agent.isLocked ? "Locked" : "Open Workspace"}</span>
                  {agent.isLocked ? <Lock className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">
                    Active Lesson
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
                10 specialized agents working in harmony to orchestrate your personalized learning graph.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>01: Counselor Intake Alignment</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>02: Profiler Skill Baseline</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>03: Librarian Web Discovery</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>04: Source Verifier Heuristics</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>05: Curriculum Architect Syllabi</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>06: Schedule Planner Calendar</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>07: Teacher Textbook Generation</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>08: Visual Explainer Blueprints</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>09: Examiner MCQ Evaluations</span>
              </div>
              <div className="flex items-center gap-2 text-card-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>10: Adaptive Remediation Tuning</span>
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
