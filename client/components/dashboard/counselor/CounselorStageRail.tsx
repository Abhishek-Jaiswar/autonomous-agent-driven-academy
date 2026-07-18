"use client";

import { CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CounselorStage } from "@/lib/types";
import { counselorStages } from "./stages";

interface CounselorStageRailProps {
  currentStage: CounselorStage;
}

export function CounselorStageRail({ currentStage }: CounselorStageRailProps) {
  const activeIndex = counselorStages.findIndex(
    (stage) => stage.id === currentStage,
  );

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
                ? "border-primary bg-primary/10"
                : "border-border bg-primary-foreground",
              isDone && "border-green-900/70 bg-green-400/10",
            )}
          >
            <div className="mt-0.5">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <CircleDot
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-accent-foreground/40",
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold leading-snug">
                {stage.label}
              </div>
              <div className="mt-0.5 text-[11px] leading-snug">
                {stage.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
