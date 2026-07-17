"use client";

import { AlertTriangle, ArrowRight, BrainCircuit, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LearnerProfileReview } from "@/lib/types";

interface ProfileReviewProps {
  profile?: LearnerProfileReview;
  onContinue: () => void;
  onReset: () => void;
}

function entries(record?: Record<string, string>) {
  return Object.entries(record || {}).slice(0, 8);
}

export function ProfileReview({
  profile,
  onContinue,
  onReset,
}: ProfileReviewProps) {
  const goal = profile?.normalizedGoal;
  const preferences = profile?.preferences;
  const risks = profile?.risks || [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-900 bg-slate-900/40 p-5 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <Badge className="border-green-900/40 bg-green-950/30 text-[9px] text-green-300">
            PROFILE COMPILED
          </Badge>
          <h1 className="mt-2 text-xl font-bold text-slate-100">
            {goal?.title || "Learner profile ready"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {profile?.learnerSummary ||
              "The profiler generated a learner model for downstream curriculum agents."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="border-slate-800 text-slate-400"
          >
            Restart
          </Button>
          <Button
            onClick={onContinue}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            Build curriculum <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-slate-900 bg-slate-900/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
              <GraduationCap className="h-4 w-4 text-violet-400" />
              Goal Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Info label="Target outcome" value={goal?.targetOutcome} />
            <Info label="Deliverable" value={goal?.deliverable} />
            <Info label="Duration" value={goal?.durationDays ? `${goal.durationDays} days` : undefined} />
            <Info label="Assessment" value={preferences?.assessmentMode} />
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
              <BrainCircuit className="h-4 w-4 text-violet-400" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info label="Learning style" value={preferences?.learningStyle || profile?.learningStyle} />
            <Info label="Daily time" value={preferences?.dailyTimeCommitment} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-slate-900 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Baseline Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {entries(profile?.skillBaseline).map(([skill, level]) => (
              <Badge
                key={skill}
                className="border-slate-800 bg-slate-950 text-slate-300"
              >
                {skill}: {level}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm text-slate-200">Weak Areas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(profile?.weakAreas || []).map((area) => (
              <Badge
                key={area}
                className="border-amber-900/40 bg-amber-950/20 text-amber-300"
              >
                {area}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-900 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks.length ? (
              risks.map((risk) => (
                <div
                  key={`${risk.type}-${risk.note}`}
                  className="rounded-md border border-slate-900 bg-slate-950/50 p-2"
                >
                  <div className="text-xs font-semibold text-slate-300">
                    {risk.type} · {risk.severity}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {risk.note}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No major risks detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-slate-900 bg-slate-950/50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-200">
        {value || "Not specified"}
      </div>
    </div>
  );
}
