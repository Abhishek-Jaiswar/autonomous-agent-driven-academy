"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useGetCurriculumQuery, useGetUserProjectsQuery } from "@/store/api/auth/auth-api";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default function Dashboard() {
  const [goalId, setGoalId] = useState<string | null>(null);

  // Auto-hydrate user projects if goalId is unselected
  const { data: userProjectsData, isLoading: isLoadingProjects } = useGetUserProjectsQuery();

  // Load session from local storage on mount or auto-hydrate latest user project
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
    }
  }, [userProjectsData]);

  // Fetch curriculum details for active goal
  const { data: curriculumData, isLoading: isLoadingCurriculum } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  // Reset active workspace session handler
  function handleReset() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("astralearn_goal_id");
      localStorage.removeItem("astralearn_active_lesson_id");
    }
    setGoalId(null);
  }

  if (isLoadingProjects || isLoadingCurriculum) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Loading Astra Academy Workspace Overview...
        </p>
      </div>
    );
  }

  return (
    <DashboardOverview
      curriculumData={curriculumData}
      onReset={handleReset}
    />
  );
}
