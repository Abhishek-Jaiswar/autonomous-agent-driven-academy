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
        // Grab the first unlocked but incomplete lesson as active
        if (!currentLesson && les.status !== "LOCKED" && les.status !== "COMPLETED") {
          currentLesson = les
          currentModuleTitle = mod.title
        }
      })
    })
  })

  // Fallback active lesson if all complete or locked
  if (!currentLesson && totalLessons > 0) {
    // Default to first lesson
    currentLesson = phases[0]?.modules[0]?.lessons[0]
    currentModuleTitle = phases[0]?.modules[0]?.title
  }

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const includedResourcesCount = resources.filter((r: any) => r.status === "INCLUDED").length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Target Goal Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-900 bg-slate-900/40">
        <div className="space-y-1 max-w-2xl">
          <Badge className="bg-violet-900/30 border border-violet-700/30 text-violet-400 font-mono text-[9px]">
            ACTIVE ACADEMY TARGET
          </Badge>
          <h1 className="text-xl font-bold text-white">{goal?.goalText}</h1>
          <p className="text-xs text-slate-400 capitalize">
            Track Category:{" "}
            <span className="text-violet-300 font-medium font-mono">
              {goal?.category?.replace("_", " ") || "No Category"}
            </span>
          </p>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white text-xs shrink-0 self-start md:self-center"
        >
          Reset Session
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Card */}
        <Card className="border-slate-900 bg-slate-900/30">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              Academy Progress
            </span>
            <CardTitle className="text-2xl font-black text-violet-400">
              {progressPercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </CardContent>
        </Card>

        {/* Study Duration */}
        <Card className="border-slate-900 bg-slate-900/30">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              Syllabus Timeline
            </span>
            <CardTitle className="text-2xl font-black text-indigo-400">
              {goal?.durationDays}{" "}
              <span className="text-xs font-normal text-slate-400">Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              100% Custom Pace
            </div>
          </CardContent>
        </Card>

        {/* Sources Trust */}
        <Card className="border-slate-900 bg-slate-900/30">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              SourceTrust Board
            </span>
            <CardTitle className="text-2xl font-black text-green-400">
              {includedResourcesCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                Sources
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Screened and Audited
            </div>
          </CardContent>
        </Card>

        {/* Target Milestone */}
        <Card className="border-slate-900 bg-slate-900/30">
          <CardHeader className="pb-2">
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              Target Milestone
            </span>
            <CardTitle className="text-base font-bold text-slate-200 line-clamp-1">
              Capstone Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Award className="w-4 h-4 text-indigo-400" />
              Evaluated Assessment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (2-Span): Resume Card & Adaptive Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Learning Card */}
          {currentLesson && (
            <Card className="border-slate-900 bg-linear-to-tr from-violet-950/20 via-slate-900/40 to-slate-900/20 border-violet-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-violet-950/40 text-violet-400 border border-violet-900/40 font-mono text-[9px]">
                    ACTIVE MODULE: {currentModuleTitle}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Lesson {completedLessons + 1}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-white mt-2">
                  {currentLesson.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-normal line-clamp-2">
                  {currentLesson.content?.slice(0, 180)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 flex justify-end">
                <Button
                  onClick={() => {
                    localStorage.setItem("astralearn_active_lesson_id", currentLesson.id)
                    router.push("/dashboard/classroom")
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-6 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-600/10"
                >
                  Resume Study Classroom <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Adaptive Insights Card */}
          <Card className="border-slate-900 bg-slate-900/40">
            <CardHeader className="pb-3 border-b border-slate-900/60">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                Adaptive Coach Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {goal?.profile?.weakAreas && goal.profile.weakAreas.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Concepts Under Review
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        The Evaluator Agent identified gaps in database and chunking strategies. Focus study paths on visual diagrams.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Target Core Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {goal.profile.weakAreas.map((skill: string) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-slate-950 border border-slate-900 text-slate-400 font-mono text-[10px]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Completing lessons and knowledge check quizzes generates coach diagnostics.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Institute Teaser Card */}
        <div className="space-y-6">
          <Card className="border-slate-900 bg-linear-to-b from-slate-900/60 to-slate-950 border-border/30 overflow-hidden flex flex-col justify-between h-full min-h-[350px]">
            <div>
              <div className="h-28 bg-gradient-to-tr from-violet-900 to-indigo-900 relative flex items-center justify-center p-4">
                <div className="absolute top-0 right-0 p-2">
                  <Badge className="bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono">
                    ROADMAP
                  </Badge>
                </div>
                <Users className="w-12 h-12 text-white/40 absolute" />
                <div className="text-center z-10 space-y-1">
                  <h3 className="text-white font-black text-sm tracking-wide">
                    ASTRA FOR INSTITUTES
                  </h3>
                  <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono">
                    Institute mode
                  </p>
                </div>
              </div>

              <CardContent className="p-4 space-y-3.5">
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  Scale your adaptive learning graphs to complete school classrooms, coaching cohorts, or team workspaces.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Teacher syllabus boundaries</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Batch and cohort progress analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Student verification invitations</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 border-t border-slate-900/60">
              <Button
                disabled
                className="w-full bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed text-xs font-semibold"
              >
                Launch Soon
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
