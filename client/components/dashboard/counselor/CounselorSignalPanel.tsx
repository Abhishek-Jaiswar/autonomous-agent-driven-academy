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
      <div className="text-[11px] text-slate-600">
        Waiting for stronger evidence.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      {items.slice(0, 3).map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-md border border-slate-900 bg-slate-950/60 p-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-300">{item.label}</span>
            <Badge className="border-slate-800 bg-slate-900 text-[9px] text-slate-400">
              {item.confidence}%
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">{item.value}</p>
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
    <Card className="border-slate-900 bg-slate-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
          <WandSparkles className="h-4 w-4 text-violet-400" />
          Learner Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="h-3.5 w-3.5" />
              Profile readiness
            </span>
            <span className="font-mono text-violet-300">{confidence}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-slate-900 bg-slate-950">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${Math.max(4, confidence)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-900 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Target className="h-3.5 w-3.5 text-violet-400" />
            {signals.normalizedGoal || "Goal being normalized"}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            {signals.targetOutcome || signals.domain || "The counselor will refine this as you answer."}
          </p>
          {signals.timelinePressure && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
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
