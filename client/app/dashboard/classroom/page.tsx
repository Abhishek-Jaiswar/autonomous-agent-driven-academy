"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, AlertCircle, Compass, HelpCircle, Terminal, ChevronRight, Award, Loader2 } from "lucide-react";

import { useGetCurriculumQuery } from "@/lib/redux/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Classroom() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Restore goalId and activeLessonId from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGoalId(localStorage.getItem("astralearn_goal_id"));
      setActiveLessonId(localStorage.getItem("astralearn_active_lesson_id"));
    }
  }, []);

  const { data, isLoading, error } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  if (isLoading || !goalId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-slate-400 text-sm font-mono animate-pulse">Entering classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/20 text-red-400 max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Access Denied
          </CardTitle>
          <CardDescription className="text-red-300/80">
            Failed to fetch classroom contents. Make sure you are logged in and your session is active.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const goal = data?.data;
  const phases = goal?.curriculum?.phases || [];

  // Helper to locate the active lesson in the nested tree
  let activeLesson: any = null;
  let activeModuleTitle = "";

  for (const phase of phases) {
    for (const mod of phase.modules || []) {
      for (const les of mod.lessons || []) {
        if (activeLessonId) {
          if (les.id === activeLessonId) {
            activeLesson = les;
            activeModuleTitle = mod.title;
            break;
          }
        } else {
          // If no active lesson is set, default to the first unlocked lesson
          if (les.status !== "LOCKED") {
            activeLesson = les;
            activeModuleTitle = mod.title;
            break;
          }
        }
      }
      if (activeLesson) break;
    }
    if (activeLesson) break;
  }

  if (!activeLesson) {
    return (
      <Card className="border-slate-900 bg-slate-900/30 text-center max-w-lg mx-auto mt-10 py-10">
        <CardContent className="space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active lesson selected</h3>
          <p className="text-sm text-slate-400">
            Please go back to the **Curriculum Map** and select an unlocked lesson to begin studying.
          </p>
          <Button onClick={() => router.push("/dashboard/curriculum")} className="bg-violet-600 hover:bg-violet-700">
            Go to Curriculum Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Parse activities if present
  const quizActivity = activeLesson.activities?.find((act: any) => act.type === "QUIZ");
  const quizPayload = quizActivity?.payload as any; // Expected format: { questions: Array<{ question, options, correct, explanation }> }
  const quizQuestions = quizPayload?.questions || [];

  function handleOptionSelect(qIdx: number, option: string) {
    if (submittedQuestions[qIdx]) return; // Cannot modify after submitting
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  }

  function handleQuestionSubmit(qIdx: number) {
    if (!selectedAnswers[qIdx]) return;
    setSubmittedQuestions((prev) => ({ ...prev, [qIdx]: true }));

    // Check if this was the last question, compile final score
    const totalQuestionsCount = quizQuestions.length;
    const answeredCount = Object.keys(submittedQuestions).length + 1;

    if (answeredCount === totalQuestionsCount) {
      // Calculate final score
      let correctAnswers = 0;
      quizQuestions.forEach((q: any, idx: number) => {
        const selected = selectedAnswers[idx] || (idx === qIdx ? selectedAnswers[qIdx] : null);
        if (selected === q.correct) {
          correctAnswers++;
        }
      });
      setQuizScore(correctAnswers);
      setQuizFinished(true);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      
      {/* Left/Main Column: Lesson Textbook Content */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Lesson Header */}
        <Card className="border-slate-900 bg-slate-900/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-400 font-semibold uppercase font-mono tracking-wider">
                {activeModuleTitle}
              </span>
              <Badge variant="secondary" className="bg-green-950/20 text-green-400 border border-green-900/30">
                {activeLesson.status}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-white mt-1">{activeLesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            {activeLesson.content ? (
              activeLesson.content.split("\n\n").map((para: string, idx: number) => (
                <p key={idx}>{para.trim()}</p>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 italic">
                Syllabus generation completed. Our Teacher Agent is currently compile-writing the study materials.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Explainer (Mermaid Diagram) */}
        {activeLesson.diagram && (
          <Card className="border-slate-900 bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Visual Explainer Map
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                System architecture map generated by the Visual Explainer Agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-950/50 p-4 rounded-lg border border-slate-900 font-mono text-xs overflow-x-auto text-indigo-300">
              <pre className="whitespace-pre-wrap">{activeLesson.diagram}</pre>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Right Column: Quiz Activities & Agent Logs */}
      <div className="space-y-6">
        
        {/* Interactive Quiz Component */}
        {quizQuestions.length > 0 && (
          <Card className="border-slate-900 bg-slate-900/50">
            <CardHeader className="border-b border-slate-900 pb-3">
              <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                Active Knowledge Quiz
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Complete all questions to unlock adaptive coach review.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              
              {!quizFinished ? (
                quizQuestions.map((q: any, qIdx: number) => {
                  const isSubmitted = submittedQuestions[qIdx];
                  const selectedVal = selectedAnswers[qIdx];
                  
                  return (
                    <div key={qIdx} className="space-y-3">
                      <p className="text-sm font-semibold text-slate-300">
                        {qIdx + 1}. {q.question}
                      </p>
                      
                      <div className="space-y-1.5">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = selectedVal === opt;
                          const isCorrect = opt === q.correct;
                          
                          let optStyle = "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800";
                          if (isSelected) {
                            optStyle = "bg-violet-950/30 border-violet-700/60 text-violet-200";
                          }
                          if (isSubmitted) {
                            if (isCorrect) {
                              optStyle = "bg-green-950/40 border-green-600/50 text-green-300";
                            } else if (isSelected) {
                              optStyle = "bg-red-950/40 border-red-600/50 text-red-300";
                            } else {
                              optStyle = "bg-slate-950/20 border-slate-900 text-slate-600";
                            }
                          }
                          
                          return (
                            <div
                              key={optIdx}
                              onClick={() => handleOptionSelect(qIdx, opt)}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${optStyle}`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {selectedVal && !isSubmitted && (
                        <Button
                          onClick={() => handleQuestionSubmit(qIdx)}
                          className="bg-violet-600 hover:bg-violet-700 w-full text-xs h-8"
                        >
                          Check Answer
                        </Button>
                      )}

                      {isSubmitted && (
                        <div className="p-3 rounded bg-slate-950 border border-slate-900 text-[11px] leading-relaxed text-slate-400">
                          <strong className={selectedVal === q.correct ? "text-green-400" : "text-red-400"}>
                            {selectedVal === q.correct ? "Correct! " : "Incorrect. "}
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                      
                      <Separator className="bg-slate-900 mt-4" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-violet-950/30 border border-violet-500/30 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Quiz Completed!</h3>
                  <p className="text-xs text-slate-400">
                    Your Score: <span className="font-bold text-violet-400">{quizScore} / {quizQuestions.length}</span> correct answers.
                  </p>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-xs">
                    Unlock Next Lesson <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* Teacher Agent logs */}
        <Card className="border-slate-900 bg-slate-950/70 flex flex-col max-h-[300px]">
          <CardHeader className="border-b border-slate-900 py-3 flex flex-row items-center gap-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher Agent Audit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 font-mono text-[10px] space-y-2 overflow-y-auto bg-slate-950">
            {activeLesson.agentLogs && activeLesson.agentLogs.length > 0 ? (
              activeLesson.agentLogs.map((log: any) => (
                <div key={log.id} className="border-l border-slate-800 pl-2">
                  <span className="text-violet-400 block mb-0.5">[{log.nodeName}]</span>
                  <p className="text-slate-500 leading-normal">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-600 italic">No agent log traces reported during compile.</p>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
