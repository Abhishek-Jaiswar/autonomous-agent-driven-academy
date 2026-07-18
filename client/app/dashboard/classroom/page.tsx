"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  AlertCircle,
  Compass,
  HelpCircle,
  Terminal,
  Award,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Video,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { useGetCurriculumQuery } from "@/store/api/auth/auth-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Classroom() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Dynamic lesson detailed state
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [isFetchingLesson, setIsFetchingLesson] = useState(false);

  // Doubt Chat Assistant state
  const [doubtInput, setDoubtInput] = useState("");
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState(false);
  const [doubtHistory, setDoubtHistory] = useState<
    Array<{ doubt: string; answer: string; sources?: string[] }>
  >([]);

  // Quiz evaluation state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  // Restore session values on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGoalId(localStorage.getItem("astralearn_goal_id"));
      setActiveLessonId(localStorage.getItem("astralearn_active_lesson_id"));
    }
  }, []);

  const { data, isLoading, error, refetch: refetchCurriculum } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  const goal = data?.data;
  const phases = goal?.curriculum?.phases || [];
  const resources = goal?.resources || [];

  // Identify default unlocked lesson if none is selected
  useEffect(() => {
    if (!activeLessonId && phases.length > 0) {
      for (const phase of phases) {
        for (const mod of phase.modules || []) {
          for (const les of mod.lessons || []) {
            if (les.status !== "LOCKED") {
              setActiveLessonId(les.id);
              if (typeof window !== "undefined") {
                localStorage.setItem("astralearn_active_lesson_id", les.id);
              }
              break;
            }
          }
          if (activeLessonId) break;
        }
        if (activeLessonId) break;
      }
    }
  }, [phases, activeLessonId]);

  // Fetch detailed lesson content
  useEffect(() => {
    if (!activeLessonId) return;

    let isMounted = true;
    setIsFetchingLesson(true);
    setQuizResult(null);
    setSelectedAnswers({});

    fetch(`http://localhost:5000/curriculum/lesson/${activeLessonId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("astralearn_token") || ""}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setLessonDetail(data.data);
        }
      })
      .catch((err) => console.error("Error fetching lesson detail:", err))
      .finally(() => {
        if (isMounted) setIsFetchingLesson(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeLessonId]);

  function handleSelectLesson(lesId: string) {
    setActiveLessonId(lesId);
    if (typeof window !== "undefined") {
      localStorage.setItem("astralearn_active_lesson_id", lesId);
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

  // Active lesson fallback lookup
  let activeLesson: any = lessonDetail;
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

  // Handle Doubt submission via RAG backend
  async function handleSendDoubt() {
    if (!doubtInput.trim() || !activeLessonId || !goalId) return;

    const currentDoubt = doubtInput.trim();
    setDoubtInput("");
    setIsAnsweringDoubt(true);

    try {
      const res = await fetch(
        `http://localhost:5000/curriculum/lesson/${activeLessonId}/doubt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("astralearn_token") || ""}`,
          },
          body: JSON.stringify({
            goalId,
            doubt: currentDoubt,
          }),
        }
      );
      const resData = await res.json();
      if (resData.success) {
        setDoubtHistory((prev) => [
          ...prev,
          {
            doubt: currentDoubt,
            answer: resData.data.answer,
            sources: resData.data.sources,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to answer doubt:", err);
    } finally {
      setIsAnsweringDoubt(false);
    }
  }

  // Quiz submission
  const quizActivity = activeLesson?.activities?.find((act: any) => act.type === "QUIZ");
  const quizPayload = quizActivity?.payload as any;
  const quizQuestions = quizPayload?.questions || [];

  async function handleCompleteQuiz() {
    if (!quizActivity?.id || Object.keys(selectedAnswers).length === 0) return;
    setIsSubmittingQuiz(true);

    try {
      const res = await fetch(
        `http://localhost:5000/curriculum/activity/${quizActivity.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("astralearn_token") || ""}`,
          },
          body: JSON.stringify({ answers: selectedAnswers }),
        }
      );
      const resData = await res.json();
      if (resData.success) {
        setQuizResult(resData.data);
        refetchCurriculum();
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1:3 Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2-Span): Media, Diagrams, Voice Chat */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="media" className="flex items-center gap-1.5 text-xs">
                <Video className="w-3.5 h-3.5" /> Multimedia & Guide
              </TabsTrigger>
              <TabsTrigger value="diagram" className="flex items-center gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5" /> Visual Blueprint
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5" /> Voice / Teacher Chat
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Multimedia / Video & Textbook Guide */}
            <TabsContent value="media" className="space-y-4 mt-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider font-mono">
                      {activeModuleTitle}
                    </span>
                    <Badge
                      variant={activeLesson?.status === "COMPLETED" ? "default" : "outline"}
                    >
                      {activeLesson?.status || "UNLOCKED"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-card-foreground mt-1">
                    {activeLesson?.title || "Select a lesson to begin"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm text-card-foreground leading-relaxed">
                  {/* Video / Multimedia Embed Player */}
                  <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center border border-border p-4 text-center">
                    <Video className="w-10 h-10 text-primary mb-2" />
                    <h4 className="text-sm font-bold text-card-foreground">Interactive Video & Audio Lesson</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Synthesized visual explainer video for <strong>"{activeLesson?.title}"</strong>.
                    </p>
                  </div>

                  <Separator />

                  {/* Textbook Guide */}
                  {isFetchingLesson ? (
                    <div className="py-8 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground font-mono">
                        Teacher Agent is compiling study content...
                      </p>
                    </div>
                  ) : activeLesson?.content ? (
                    activeLesson.content.split("\n\n").map((para: string, idx: number) => (
                      <p key={idx} className="whitespace-pre-line text-muted-foreground">
                        {para.trim()}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4">
                      Select an unlocked lesson from the curriculum list on the right to view study material.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Visual Diagram Blueprint */}
            <TabsContent value="diagram" className="mt-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-card-foreground flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" />
                    Visual Architecture Diagram
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generated blueprint flow for "{activeLesson?.title}".
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeLesson?.diagram ? (
                    <div className="bg-muted p-4 rounded-lg border border-border font-mono text-xs overflow-x-auto text-primary">
                      <pre className="whitespace-pre-wrap">{activeLesson.diagram}</pre>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">
                      No diagram generated for this specific lesson yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: AI Teacher Voice & Doubt Chat */}
            <TabsContent value="chat" className="mt-3">
              <Card>
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-base font-bold text-card-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Teacher Agent Doubt Assistant (Pinecone RAG)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ask questions grounded strictly in your verified study materials.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                    {doubtHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs italic">
                        Ask the Teacher Agent any question about this lesson.
                      </div>
                    ) : (
                      doubtHistory.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-end">
                            <div className="bg-primary/10 border border-primary/20 text-card-foreground text-xs px-3 py-2 rounded-lg max-w-[85%]">
                              <strong>You:</strong> {item.doubt}
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-muted border border-border text-card-foreground text-xs px-3.5 py-2.5 rounded-lg max-w-[90%] space-y-1.5">
                              <div className="flex items-center gap-1.5 text-primary font-semibold">
                                <Sparkles className="w-3.5 h-3.5" /> Teacher Agent:
                              </div>
                              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                                {item.answer}
                              </p>
                              {item.sources && item.sources.length > 0 && (
                                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                                  <strong>Cited:</strong> {item.sources.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {isAnsweringDoubt && (
                      <div className="flex items-center gap-2 text-xs text-primary font-mono animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Teacher Agent searching Pinecone vectors...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <input
                      type="text"
                      placeholder="Ask a question about this lesson..."
                      value={doubtInput}
                      onChange={(e) => setDoubtInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendDoubt()}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <Button
                      onClick={handleSendDoubt}
                      disabled={isAnsweringDoubt || !doubtInput.trim()}
                      size="sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column (1-Span): Full Interactive Curriculum List */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Full Curriculum
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {phases.length} Phases
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Select any unlocked lesson to switch study focus instantly.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 space-y-4 max-h-[550px] overflow-y-auto">
              {phases.map((phase: any, pIdx: number) => (
                <div key={phase.id || pIdx} className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                    Phase {pIdx + 1}: {phase.title}
                  </div>

                  {phase.modules?.map((mod: any) => (
                    <div key={mod.id} className="pl-2 space-y-1.5">
                      <div className="text-xs font-semibold text-card-foreground">
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
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 font-bold text-card-foreground"
                                : isLocked
                                ? "border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed"
                                : "border-border bg-card text-card-foreground hover:border-primary/50 cursor-pointer"
                            }`}
                          >
                            <span className="line-clamp-1 flex-1 pr-2">
                              {les.title}
                            </span>

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
                              className="text-[9px] shrink-0"
                            >
                              {les.status || "UNLOCKED"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Important Details, SourceTrust Board & Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* SourceTrust Verified Resources List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SourceTrust Reference Materials
            </CardTitle>
            <CardDescription className="text-xs">
              Verified study sources backing this lesson.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {resources.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No external web resources linked yet.</p>
            ) : (
              resources.slice(0, 4).map((r: any) => (
                <div key={r.id} className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 line-clamp-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium text-card-foreground">{r.title}</span>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-[11px]">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Examiner Quiz & Adaptive Coach Trigger */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Examiner Knowledge Check Quiz
            </CardTitle>
            <CardDescription className="text-xs">
              Score 70%+ to complete this lesson and unlock upcoming modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No active evaluation quiz generated for this lesson.
              </p>
            ) : !quizResult ? (
              <div className="space-y-3">
                {quizQuestions.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="space-y-2">
                    <p className="text-xs font-semibold text-card-foreground">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid gap-1.5">
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
                            className={`p-2 rounded border text-xs cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 font-bold"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleCompleteQuiz}
                  disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="w-full mt-2"
                  size="sm"
                >
                  {isSubmittingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Quiz to Examiner"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-3 space-y-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${quizResult.passed ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-destructive/10 border-destructive/40 text-destructive"}`}>
                  {quizResult.passed ? <Award className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-card-foreground">
                    {quizResult.passed ? "Quiz Passed!" : "Remediation Suggested"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Score: <strong>{quizResult.scorePercentage}%</strong> ({quizResult.correctCount}/{quizResult.totalQuestions} correct)
                  </p>
                </div>

                <Button onClick={() => refetchCurriculum()} size="sm" variant="outline" className="w-full">
                  Refresh Classroom Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
