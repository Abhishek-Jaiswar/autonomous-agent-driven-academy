"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  AlertCircle,
  Compass,
  Award,
  Loader2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Video,
  FileText,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle,
  Lock,
  Layers,
  SlidersHorizontal,
  Split,
  Eye,
} from "lucide-react";

import {
  useGetCurriculumQuery,
  useGetUserProjectsQuery,
  useGetLessonDetailsQuery,
  useSubmitLessonDoubtMutation,
  useSubmitQuizAnswerMutation,
} from "@/store/api/auth/auth-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TextbookReader } from "@/components/dashboard/classroom/TextbookReader";
import { TeacherDoubtAssistant } from "@/components/dashboard/classroom/TeacherDoubtAssistant";
import { MermaidDiagram } from "@/components/dashboard/classroom/MermaidDiagram";

export default function Classroom() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mode Selection Dropdown state: "reading" | "video" | "diagram" | "chat" | "quiz" | "split"
  const [studyMode, setStudyMode] = useState<string>("reading");

  // Doubt Chat Assistant state
  const [doubtHistory, setDoubtHistory] = useState<
    Array<{ doubt: string; answer: string; sources?: string[] }>
  >([]);

  // Quiz evaluation state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Auto-hydrate user projects if goalId is unselected
  const { data: userProjectsData } = useGetUserProjectsQuery();

  // Restore session values on mount or from user projects
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
      setActiveLessonId(localStorage.getItem("astralearn_active_lesson_id"));
    }
  }, [userProjectsData]);

  const { data, isLoading, error, refetch: refetchCurriculum } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  const { data: lessonData, isLoading: isFetchingLesson } = useGetLessonDetailsQuery(activeLessonId, {
    skip: !activeLessonId,
  });

  const [submitDoubt, { isLoading: isAnsweringDoubt }] = useSubmitLessonDoubtMutation();
  const [submitQuiz, { isLoading: isSubmittingQuiz }] = useSubmitQuizAnswerMutation();

  const goal = data?.data;
  const phases = goal?.curriculum?.phases || [];
  const resources = goal?.resources || [];
  const fetchedLesson = lessonData?.data;

  // Auto-detect & validate active lesson where the user left off for this project
  useEffect(() => {
    if (phases.length === 0) return;

    const allLessons: any[] = [];
    phases.forEach((phase: any) => {
      phase.modules?.forEach((mod: any) => {
        mod.lessons?.forEach((les: any) => {
          allLessons.push(les);
        });
      });
    });

    if (allLessons.length === 0) return;

    const isCurrentIdValid =
      activeLessonId &&
      allLessons.some((l) => l.id === activeLessonId && l.status !== "LOCKED");

    if (!isCurrentIdValid) {
      const activeLeftOff =
        allLessons.find((l) => l.status === "UNLOCKED") ||
        allLessons.find((l) => l.status !== "LOCKED") ||
        allLessons[0];

      if (activeLeftOff?.id) {
        setActiveLessonId(activeLeftOff.id);
        if (typeof window !== "undefined") {
          localStorage.setItem("astralearn_active_lesson_id", activeLeftOff.id);
        }
      }
    }
  }, [phases, activeLessonId]);

  function handleSelectLesson(lesId: string, status?: string) {
    if (status === "LOCKED") return; // Strict lock check: cannot skip to locked lesson
    setActiveLessonId(lesId);
    setQuizResult(null);
    setSelectedAnswers({});
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_active_lesson_id", lesId);
    }
  }

  // Active lesson fallback lookup
  let activeLesson: any = fetchedLesson;
  let activeModuleTitle = "Current Module";

  if (!activeLesson) {
    for (const phase of phases) {
      for (const mod of phase.modules || []) {
        for (const les of mod.lessons || []) {
          if (les.id === activeLessonId) {
            activeLesson = les;
            activeModuleTitle = mod.title;
            break;
          }
        }
        if (activeLesson) break;
      }
      if (activeLesson) break;
    }
  }

  // Calculate overall course completion progress
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;

  phases.forEach((p: any) => {
    p.modules?.forEach((m: any) => {
      m.lessons?.forEach((l: any) => {
        totalLessonsCount++;
        if (l.status === "COMPLETED") completedLessonsCount++;
      });
    });
  });

  const progressPercentage =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Handle Doubt submission via RTK Mutation
  async function handleSendDoubtText(doubtText: string) {
    if (!activeLessonId || !goalId) return;

    try {
      const res = await submitDoubt({
        lessonId: activeLessonId,
        goalId,
        doubt: doubtText,
      }).unwrap();

      if (res.success && res.data) {
        setDoubtHistory((prev) => [
          ...prev,
          {
            doubt: doubtText,
            answer: res.data.answer,
            sources: res.data.sources,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to answer doubt:", err);
    }
  }

  // Quiz submission via RTK Mutation
  const quizActivity = activeLesson?.activities?.find((act: any) => act.type === "QUIZ");
  const quizPayload = quizActivity?.payload as any;
  const quizQuestions = quizPayload?.questions || [];

  async function handleCompleteQuiz() {
    if (!quizActivity?.id || Object.keys(selectedAnswers).length === 0) return;

    try {
      const res = await submitQuiz({
        activityId: quizActivity.id,
        answers: selectedAnswers,
      }).unwrap();

      if (res.success && res.data) {
        setQuizResult(res.data);
        refetchCurriculum();
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    }
  }

  if (isLoading || !goalId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Entering AI Classroom...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" /> Access Error
          </CardTitle>
          <CardDescription>
            Failed to fetch classroom contents. Please select a valid active project.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const studyModeOptions = [
    { value: "reading", label: "📖 Reading Mode (Textbook & Audio)", icon: <BookOpen className="w-4 h-4 text-primary" /> },
    { value: "video", label: "🎬 Video & Multimedia Mode", icon: <Video className="w-4 h-4 text-indigo-500" /> },
    { value: "diagram", label: "📐 Visual Diagram Blueprint", icon: <Compass className="w-4 h-4 text-violet-500" /> },
    { value: "chat", label: "💬 Teacher Doubt Assistant (RAG)", icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
    { value: "quiz", label: "📝 Examiner Quiz Evaluation", icon: <Award className="w-4 h-4 text-amber-500" /> },
    { value: "split", label: "⚡ Split Mode (Reading + Diagram)", icon: <Split className="w-4 h-4 text-primary" /> },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Header Banner & Study Mode Selector Dropdown Bar */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 07: TEACHER CLASSROOM
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/30">
                {activeLesson?.status || "ACTIVE LESSON"}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {activeLesson?.title || "Select a lesson to begin"}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Module: <strong>{activeModuleTitle}</strong> • Target: {goal?.goalText}
            </p>
          </div>

          {/* Mode Selector & Progress Summary */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Dropdown Selector */}
            <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border">
              <SlidersHorizontal className="w-4 h-4 text-primary shrink-0 ml-1.5" />
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {studyModeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Progress Indicator */}
            <div className="flex items-center gap-3 border-l border-border pl-3">
              <div className="text-right">
                <div className="text-xs font-bold text-card-foreground">{progressPercentage}% Complete</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {completedLessonsCount} of {totalLessonsCount} Lessons
                </div>
              </div>
              <div className="w-14">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Render Workspace based on Selected Study Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2-Span): Content area based on studyMode */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode 1: Reading Mode */}
          {studyMode === "reading" && (
            <div className="space-y-6">
              {isFetchingLesson ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 border border-border rounded-xl bg-card">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground font-mono">
                    Teacher Agent compiling study guide...
                  </p>
                </div>
              ) : activeLesson?.content ? (
                <TextbookReader
                  title={activeLesson.title}
                  moduleTitle={activeModuleTitle}
                  content={activeLesson.content}
                  status={activeLesson.status}
                  isLoading={isFetchingLesson}
                />
              ) : (
                <Card className="border-border">
                  <CardContent className="py-12 text-center text-muted-foreground text-xs italic">
                    Select an unlocked lesson from the curriculum list on the right to view study material.
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Mode 2: Video / Multimedia Mode */}
          {studyMode === "video" && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-bold text-card-foreground flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-500" />
                  Interactive Video & Audio Synthesizer
                </CardTitle>
                <CardDescription className="text-xs">
                  Visual audio explanation generated for "{activeLesson?.title}".
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="aspect-video w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800 p-6 text-center text-slate-100 shadow-inner">
                  <Video className="w-12 h-12 text-primary mb-3 animate-pulse" />
                  <h3 className="text-base font-bold">Interactive Audio & Visual Explainer</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    AI Teacher Agent presentation for <strong>"{activeLesson?.title}"</strong>.
                  </p>
                  <Button size="sm" className="mt-4 font-bold text-xs">
                    Play Full Presentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode 3: Diagram Blueprint Mode */}
          {studyMode === "diagram" && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-bold text-card-foreground flex items-center gap-2">
                  <Compass className="w-5 h-5 text-violet-500" />
                  Visual Explainer (Agent 08) Blueprint
                </CardTitle>
                <CardDescription className="text-xs">
                  Synthesized Mermaid.js flowchart architecture for "{activeLesson?.title}".
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {activeLesson?.diagram ? (
                  <MermaidDiagram chart={activeLesson.diagram} />
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-xs italic">
                    No visual diagram generated for this specific lesson yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mode 4: Teacher Doubt Assistant (RAG) */}
          {studyMode === "chat" && (
            <TeacherDoubtAssistant
              lessonTitle={activeLesson?.title || "Active Lesson"}
              isAnswering={isAnsweringDoubt}
              onSendDoubt={handleSendDoubtText}
              doubtHistory={doubtHistory}
              onClearHistory={() => setDoubtHistory([])}
            />
          )}

          {/* Mode 5: Examiner Quiz Mode */}
          {studyMode === "quiz" && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Examiner Knowledge Check Quiz (Agent 09)
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono text-amber-500 border-amber-500/30">
                    Passing Score: 70%+
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Complete evaluation questions to verify mastery and unlock subsequent modules.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {quizQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No active evaluation quiz generated for this lesson.
                  </p>
                ) : !quizResult ? (
                  <div className="space-y-4">
                    {quizQuestions.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-2 p-3 rounded-xl border border-border bg-muted/20">
                        <p className="text-xs font-semibold text-card-foreground">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="grid gap-2 pt-1">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = selectedAnswers[qIdx] === opt;
                            return (
                              <div
                                key={optIdx}
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({
                                    ...prev,
                                    [qIdx]: opt,
                                  }))
                                }
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                  isSelected
                                    ? "border-primary bg-primary/10 font-bold text-card-foreground shadow-xs"
                                    : "border-border bg-card hover:border-primary/50 text-card-foreground"
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={handleCompleteQuiz}
                      disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < quizQuestions.length}
                      className="w-full font-bold text-xs"
                      size="sm"
                    >
                      {isSubmittingQuiz ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        "Submit Evaluation to Examiner Agent"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
                        quizResult.passed
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                          : "bg-destructive/10 border-destructive/40 text-destructive"
                      }`}
                    >
                      {quizResult.passed ? <Award className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-card-foreground">
                        {quizResult.passed ? "Quiz Passed!" : "Remediation Suggested"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Score: <strong>{quizResult.scorePercentage}%</strong> ({quizResult.correctCount}/{quizResult.totalQuestions} correct)
                      </p>
                    </div>

                    {quizResult.passed ? (
                      <Button
                        onClick={() => {
                          const nextLessonId =
                            quizResult.coachOutcome?.unlockedLessonId ||
                            quizResult.coachOutcome?.remedialLessonId;
                          if (nextLessonId) {
                            handleSelectLesson(nextLessonId);
                          } else {
                            refetchCurriculum();
                          }
                        }}
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Proceed to Next Lesson <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => refetchCurriculum()} size="sm" variant="outline" className="w-full text-xs">
                        Retry & Review Remedial Lesson
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mode 6: Split Mode (Reading + Diagram Side-by-Side) */}
          {studyMode === "split" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Textbook Reader */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-card-foreground font-mono flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" /> Textbook Guide
                </div>
                {activeLesson?.content ? (
                  <TextbookReader
                    title={activeLesson.title}
                    moduleTitle={activeModuleTitle}
                    content={activeLesson.content}
                    status={activeLesson.status}
                    isLoading={isFetchingLesson}
                  />
                ) : (
                  <Card className="border-border">
                    <CardContent className="py-8 text-center text-xs text-muted-foreground">
                      No text available.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Visual Diagram */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-card-foreground font-mono flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-violet-500" /> Visual Blueprint
                </div>
                <Card className="border-border">
                  <CardContent className="p-4">
                    {activeLesson?.diagram ? (
                      <MermaidDiagram chart={activeLesson.diagram} />
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-6">
                        No diagram code generated yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1-Span): Full Interactive Curriculum Navigation & Search */}
        <div className="space-y-4">
          <Card className="h-full border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Curriculum Roadmap
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {phases.length} Phases
                </Badge>
              </div>

              {/* Search Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-4 max-h-[580px] overflow-y-auto">
              {phases.map((phase: any, pIdx: number) => {
                const filteredModules = phase.modules
                  ?.map((mod: any) => {
                    const matchingLessons = mod.lessons?.filter((l: any) =>
                      l.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    return { ...mod, lessons: matchingLessons };
                  })
                  .filter((mod: any) => mod.lessons && mod.lessons.length > 0);

                if (searchQuery && filteredModules?.length === 0) return null;

                return (
                  <div key={phase.id || pIdx} className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 font-mono flex items-center justify-between">
                      <span>Phase {pIdx + 1}: {phase.title}</span>
                    </div>

                    {(searchQuery ? filteredModules : phase.modules)?.map((mod: any) => (
                      <div key={mod.id} className="pl-1 space-y-1">
                        <div className="text-[11px] font-semibold text-card-foreground/80 px-1 py-0.5">
                          Module: {mod.title}
                        </div>

                        {mod.lessons?.map((les: any) => {
                          const isSelected = les.id === activeLessonId;
                          const isLocked = les.status === "LOCKED";
                          const isCompleted = les.status === "COMPLETED";

                          return (
                            <div
                              key={les.id}
                              onClick={() => !isLocked && handleSelectLesson(les.id)}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 font-bold text-card-foreground shadow-xs"
                                  : isLocked
                                  ? "border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed"
                                  : "border-border bg-card text-card-foreground hover:border-primary/50 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 line-clamp-1 pr-1">
                                {isCompleted ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : isLocked ? (
                                  <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                ) : (
                                  <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>

                              <Badge
                                variant={
                                  isCompleted
                                    ? "default"
                                    : isLocked
                                    ? "outline"
                                    : isSelected
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[9px] shrink-0 font-mono"
                              >
                                {les.status || "UNLOCKED"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
