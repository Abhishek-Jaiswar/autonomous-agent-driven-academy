"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
  useStartCurriculumMutation,
  useGetCurriculumQuery,
  useStartCounselorInterviewMutation,
  useSubmitCounselorAnswerMutation,
} from "@/store/api/auth/auth-api"

import { GoalIntakeForm } from "@/components/dashboard/GoalIntakeForm"
import { CounselorInterview } from "@/components/dashboard/CounselorInterview"
import { AcademyLoading } from "@/components/dashboard/AcademyLoading"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { ProfileReview } from "@/components/dashboard/profiler/ProfileReview"
import type {
  CounselorInterviewResponse,
  LearnerProfileReview,
} from "@/lib/types"

export default function Dashboard() {
  // Internal state machine
  const [goalId, setGoalId] = useState<string | null>(null)
  const [pageState, setPageState] = useState<
    "INTAKE" | "INTERVIEW" | "PROFILER" | "PROFILE_REVIEW" | "GENERATING" | "DASHBOARD"
  >("INTAKE")

  const [interviewState, setInterviewState] =
    useState<CounselorInterviewResponse | null>(null)
  const [profileReview, setProfileReview] =
    useState<LearnerProfileReview | undefined>()

  // API hooks
  const [startCurriculum, { isLoading: isStartingGoal }] =
    useStartCurriculumMutation()
  const [startInterview, { isLoading: isStartingInterview }] =
    useStartCounselorInterviewMutation()
  const [submitAnswer, { isLoading: isSubmittingAnswer }] =
    useSubmitCounselorAnswerMutation()

  // Fetch curriculum details
  const {
    data: curriculumData,
    refetch: refetchCurriculum,
  } = useGetCurriculumQuery(goalId, {
    skip: !goalId || (pageState !== "DASHBOARD" && pageState !== "GENERATING"),
  })

  // Poll curriculum status during background construction
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (pageState === "GENERATING" && goalId) {
      interval = setInterval(() => {
        refetchCurriculum().then((res) => {
          if (res.data?.data?.curriculum?.phases?.length > 0) {
            setPageState("DASHBOARD")
          }
        })
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [pageState, goalId, refetchCurriculum])

  // Load session from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id")
      if (savedGoalId) {
        setGoalId(savedGoalId)
        fetchInterviewStatus(savedGoalId)
      } else {
        setPageState("INTAKE")
      }
    }
  }, [])

  // Check state from the backend
  async function fetchInterviewStatus(savedGoalId: string) {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/curriculum/interview/${savedGoalId}`,
        {
          credentials: "include",
        }
      )
      if (res.ok) {
        const payload = await res.json()
        if (payload.success && payload.data) {
          const data = payload.data as CounselorInterviewResponse
          setInterviewState(data)
          setProfileReview(data.profile)

          if (data.isComplete) {
            const currRes = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
              }/curriculum/${savedGoalId}`,
              {
                credentials: "include",
              }
            )
            const currPayload = await currRes.json()
            if (currPayload.success && currPayload.data?.curriculum?.phases?.length > 0) {
              setPageState("DASHBOARD")
            } else {
              setPageState(data.profile?.learnerSummary ? "PROFILE_REVIEW" : "GENERATING")
            }
          } else if (data.conversation && data.conversation.length > 0) {
            setPageState("INTERVIEW")
          } else {
            setPageState("INTERVIEW")
            triggerStartInterview(savedGoalId)
          }
        }
      }
    } catch {
      setPageState("INTAKE")
    }
  }

  async function triggerStartInterview(id: string) {
    try {
      const res = await startInterview({ goalId: id }).unwrap()
      if (res.success && res.data) {
        setInterviewState(res.data as CounselorInterviewResponse)
        setPageState("INTERVIEW")
      }
    } catch (err) {
      console.error("Failed to start interview", err)
    }
  }

  // Action: Create Goal & Initiate Counselor
  async function handleStartSession(
    goalText: string,
    category: "exam_prep" | "job_project" | "school_subject",
    durationDays: number
  ) {
    try {
      const res = await startCurriculum({
        goalText,
        category,
        durationDays,
      }).unwrap()

      if (res.success && res.data?.goalId) {
        const id = res.data.goalId
        setGoalId(id)
        localStorage.setItem("astralearn_goal_id", id)
        await triggerStartInterview(id)
      }
    } catch (err) {
      console.error("Failed to initialize session", err)
    }
  }

  // Action: Submit Answer turn
  async function handleAnswerSubmit(answer: string) {
    if (!goalId) return
    try {
      const res = await submitAnswer({
        goalId,
        answer,
      }).unwrap()

      if (res.success && res.data) {
        const nextState = res.data as CounselorInterviewResponse
        setInterviewState((prev) => ({
          ...(prev || nextState),
          ...nextState,
        }))
        if (res.data.isComplete) {
          setProfileReview(nextState.profile)
          setPageState(nextState.profile?.learnerSummary ? "PROFILE_REVIEW" : "PROFILER")
        } else {
          setPageState("INTERVIEW")
        }
      }
    } catch (err) {
      console.error("Failed to submit answer", err)
    }
  }

  // Action: Reset entire state
  function handleReset() {
    localStorage.removeItem("astralearn_goal_id")
    localStorage.removeItem("astralearn_active_lesson_id")
    setGoalId(null)
    setPageState("INTAKE")
    setInterviewState(null)
    setProfileReview(undefined)
  }

  function handleContinueToGeneration() {
    setPageState("GENERATING")
  }

  // Render main layout
  if (isStartingGoal || isStartingInterview) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-slate-400 text-sm font-mono animate-pulse">
          Counselor Agent is aligning model weights...
        </p>
      </div>
    )
  }

  switch (pageState) {
    case "INTAKE":
      return <GoalIntakeForm onSubmit={handleStartSession} isLoading={isStartingGoal} />
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
          onReset={handleReset}
        />
      ) : (
        <AcademyLoading />
      )
    case "PROFILER":
      return <AcademyLoading />
    case "PROFILE_REVIEW":
      return (
        <ProfileReview
          profile={profileReview}
          onContinue={handleContinueToGeneration}
          onReset={handleReset}
        />
      )
    case "GENERATING":
      return <AcademyLoading />
    case "DASHBOARD":
      return <DashboardOverview curriculumData={curriculumData} onReset={handleReset} />
    default:
      return <GoalIntakeForm onSubmit={handleStartSession} isLoading={isStartingGoal} />
  }
}
