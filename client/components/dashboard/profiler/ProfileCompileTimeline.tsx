"use client";

import { BrainCircuit, CheckCircle2, Loader2, SearchCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    label: "Counselor transcript",
    detail: "Reading interview turns and extracted signals.",
    done: true,
  },
  {
    label: "Learner model",
    detail: "Compiling baseline, gaps, preference, and risks.",
    done: true,
  },
  {
    label: "SourceTrust handoff",
    detail: "Passing directives to Librarian and Curriculum Architect.",
    done: false,
  },
];

export function ProfileCompileTimeline() {
  return (
    <Card className="mx-auto max-w-xl border-slate-900 bg-slate-900/40 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100">Profiler Agent Active</h1>
          <p className="text-xs text-slate-500">
            Your learner model is being prepared for the next agents.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex gap-3 rounded-lg border border-slate-900 bg-slate-950/50 p-3"
          >
            {step.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
            ) : (
              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-violet-400" />
            )}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                {step.label}
                {!step.done && <SearchCheck className="h-3.5 w-3.5 text-violet-400" />}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
