"use client";

import { CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CounselorStage } from "@/lib/types";
import { counselorStages } from "./stages";

interface CounselorStageRailProps {
  currentStage: CounselorStage;
}

export function CounselorStageRail({ currentStage }: CounselorStageRailProps) {
  const activeIndex = counselorStages.findIndex((stage) => stage.id === currentStage);

  return (
    <div className="space-y-3">
      {counselorStages.map((stage, index) => {
        const isDone = index < activeIndex || currentStage === "complete";
        const isActive = stage.id === currentStage;

        return (
          <div
            key={stage.id}
            className={cn(
              "flex gap-3 rounded-lg border p-3 transition-colors",
              isActive
                ? "border-violet-700/50 bg-violet-950/20"
                : "border-slate-900 bg-slate-950/30",
              isDone && "border-green-900/40 bg-green-950/10"
            )}
          >
            <div className="mt-0.5">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <CircleDot
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-violet-400" : "text-slate-700"
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200">{stage.label}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                {stage.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
