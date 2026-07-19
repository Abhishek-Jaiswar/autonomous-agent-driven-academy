"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Compass, RefreshCw, Sparkles } from "lucide-react";

import {
  useGetCounselorInterviewQuery,
  useLazyGetCounselorInterviewQuery,
  useGetUserProjectsQuery,
  useStartCounselorInterviewMutation,
  useSubmitCounselorAnswerMutation,
} from "@/store/api/auth/auth-api";

import { CounselorInterview } from "@/components/dashboard/CounselorInterview";
import { AcademyLoading } from "@/components/dashboard/AcademyLoading";
import { ProfileReview } from "@/components/dashboard/profiler/ProfileReview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CounselorInterviewResponse, LearnerProfileReview } from "@/lib/types";

export default function CounselorAgentPage() {
  const router = useRouter();

  // Internal counselor state machine
  const [goalId, setGoalId] = useState<string | null>(null);
  const [pageState, setPageState] = useState<
    "INTAKE" | "INTERVIEW" | "PROFILER" | "PROFILE_REVIEW" | "GENERATING"
  >("INTAKE");

  const [interviewState, setInterviewState] = useState<CounselorInterviewResponse | null>(null);
  const [profileReview, setProfileReview] = useState<LearnerProfileReview | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>("");

  // Fetch projects list for auto-hydration
  const { data: userProjectsData, isLoading: isProjectsLoading } = useGetUserProjectsQuery();

  // RTK Query hooks
  const [fetchInterviewStatusTrigger, { isLoading: isFetchingStatus }] = useLazyGetCounselorInterviewQuery();
  const [startInterview, { isLoading: isStartingInterview }] = useStartCounselorInterviewMutation();
  const [submitAnswer, { isLoading: isSubmittingAnswer }] = useSubmitCounselorAnswerMutation();

  // Load active goal session from local storage on mount or auto-hydrate latest user project
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      if (savedGoalId) {
        setGoalId(savedGoalId);
        loadInterviewStatus(savedGoalId);
      } else if (userProjectsData?.data && userProjectsData.data.length > 0) {
        const latestGoalId = userProjectsData.data[0].id;
        localStorage.setItem("astralearn_goal_id", latestGoalId);
        setGoalId(latestGoalId);
        loadInterviewStatus(latestGoalId);
      }
    }
  }, [userProjectsData]);

  // Query interview status via RTK Query
  async function loadInterviewStatus(targetGoalId: string) {
    setErrorMessage(null);
    try {
      const res = await fetchInterviewStatusTrigger(targetGoalId).unwrap();
      if (res.success && res.data) {
        const data = res.data;
        setInterviewState(data);
        setProfileReview(data.profile);

        if (data.isComplete) {
          setPageState("PROFILE_REVIEW");
        } else if (data.conversation && data.conversation.length > 0) {
          setPageState("INTERVIEW");
        } else {
          triggerStartInterview(targetGoalId);
        }
      }
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || "Failed to load counselor interview session.";
      setErrorMessage(errMsg);
      setPageState("INTAKE");
    }
  }

  async function triggerStartInterview(id: string) {
    setErrorMessage(null);
    try {
      const res = await startInterview({ goalId: id }).unwrap();
      if (res.success && res.data) {
        setInterviewState(res.data as CounselorInterviewResponse);
        setPageState("INTERVIEW");
      }
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || "Failed to start counselor interview.";
      setErrorMessage(errMsg);
    }
  }

  // Action: Submit Answer turn
  async function handleAnswerSubmit(answer: string) {
    if (!goalId) return;
    setErrorMessage(null);
    setLastAnswer(answer);
    try {
      const res = await submitAnswer({
        goalId,
        answer,
      }).unwrap();

      if (res.success && res.data) {
        const nextState = res.data as CounselorInterviewResponse;
        setInterviewState((prev) => ({
          ...(prev || nextState),
          ...nextState,
        }));
        if (res.data.isComplete) {
          setProfileReview(nextState.profile);
          setPageState("PROFILE_REVIEW");
        } else {
          setPageState("INTERVIEW");
        }
      }
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || "Failed to submit answer to Counselor Agent.";
      console.error("Failed to submit answer:", errMsg);
      setErrorMessage(errMsg);
    }
  }

  function handleRetry() {
    if (lastAnswer) {
      handleAnswerSubmit(lastAnswer);
    } else if (goalId) {
      loadInterviewStatus(goalId);
    }
  }

  // Action: Reset entire state
  function handleReset() {
    localStorage.removeItem("astralearn_goal_id");
    localStorage.removeItem("astralearn_active_lesson_id");
    setGoalId(null);
    setPageState("INTAKE");
    setInterviewState(null);
    setProfileReview(undefined);
    setErrorMessage(null);
    setLastAnswer("");
  }

  function handleContinueToProfiler() {
    router.push("/dashboard/profiler");
  }

  if (isStartingInterview || isProjectsLoading || isFetchingStatus) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Counselor Agent is aligning model weights...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Counselor Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-[10px] uppercase font-mono">
              AGENT 01: COUNSELOR
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/30">
              {pageState === "PROFILE_REVIEW" ? "Profile Compiled" : "Adaptive Intake Active"}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-card-foreground">
            Counselor Agent Intake & Diagnostics
          </h1>
          <p className="text-xs text-muted-foreground">
            Interactively clarifies your learning targets, constraints, and baseline experience to build your personalized learner profile.
          </p>
        </div>

        {goalId && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleReset} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Start New Intake
            </Button>
            {pageState === "PROFILE_REVIEW" && (
              <Button size="sm" onClick={handleContinueToProfiler} className="text-xs">
                Proceed to Profiler Agent <Compass className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Render Main Content based on pageState */}
      {(() => {
        switch (pageState) {
          case "INTERVIEW":
            return interviewState ? (
              <CounselorInterview
                conversation={interviewState.conversation || []}
                currentStage={interviewState.currentStage || "goal_clarity"}
                stageLabel={interviewState.stageLabel || "Goal Clarity"}
                confidence={interviewState.confidence || 0}
                extractedSignals={interviewState.extractedSignals || {}}
                quickReplies={interviewState.quickReplies || []}
                onSubmitAnswer={handleAnswerSubmit}
                isSubmitting={isSubmittingAnswer}
                errorMessage={errorMessage}
                onRetry={handleRetry}
                onReset={handleReset}
              />
            ) : (
              <AcademyLoading />
            );

          case "PROFILER":
          case "GENERATING":
            return <AcademyLoading />;

          case "PROFILE_REVIEW":
            return (
              <ProfileReview
                profile={profileReview}
                onContinue={handleContinueToProfiler}
                onReset={handleReset}
              />
            );

          case "INTAKE":
          default:
            return (
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Start Counselor Diagnostic Interview
                    </CardTitle>
                    <CardDescription className="text-xs">
                      No active diagnostic session detected. Start a new goal or select an existing project workspace to launch the intake interview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => router.push("/dashboard/quickstart")} className="flex-1">
                        <Sparkles className="w-4 h-4 mr-2" /> Quick Start Goal
                      </Button>
                      <Button onClick={() => router.push("/dashboard/projects")} variant="outline" className="flex-1">
                        Select Existing Workspace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
        }
      })()}
    </div>
  );
}
