"use client";

import { Gauge, Target, Timer, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CounselorSignal, CounselorSignals } from "@/lib/types";

interface CounselorSignalPanelProps {
  signals: CounselorSignals;
  confidence: number;
}

function SignalList({
  title,
  items,
}: {
  title: string;
  items?: CounselorSignal[];
}) {
  if (!items?.length) {
    return (
      <div className="text-[11px]">
        Waiting for stronger evidence.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider">
        {title}
      </div>
      {items.slice(0, 3).map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-md border border-primary/50 p-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium ">{item.label}</span>
            <Badge className="border-secondary-foreground bg-primary text-[9px]">
              {item.confidence}%
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-snug">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CounselorSignalPanel({
  signals,
  confidence,
}: CounselorSignalPanelProps) {
  return (
    <Card className="">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm ">
          <WandSparkles className="h-4 w-4 " />
          Learner Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 ">
              <Gauge className="h-3.5 w-3.5" />
              Profile readiness
            </span>
            <span className="font-mono">{confidence}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-primary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(4, confidence)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-secondary-foreground p-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Target className="h-3.5 w-3.5 " />
            {signals.normalizedGoal || "Goal being normalized"}
          </div>
          <p className="text-[11px] leading-relaxed">
            {signals.targetOutcome || signals.domain || "The counselor will refine this as you answer."}
          </p>
          {signals.timelinePressure && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Timer className="h-3.5 w-3.5" />
              Timeline pressure: {signals.timelinePressure}
            </div>
          )}
        </div>

        <SignalList title="Baseline hints" items={signals.baselineHints} />
        <SignalList title="Constraints" items={signals.constraints} />
        <SignalList title="Preferences" items={signals.preferences} />
      </CardContent>
    </Card>
  );
}
