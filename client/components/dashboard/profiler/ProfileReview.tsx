"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Route,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearnerProfileReview } from "@/lib/types";

interface ProfileReviewProps {
  profile?: LearnerProfileReview;
  onContinue: () => void;
  onReset: () => void;
}

function entries(record?: any): Array<[string, string]> {
  if (!record) return [];
  if (Array.isArray(record)) {
    return record.map((item: any) => [
      String(item.skill || item.name || "Skill"),
      String(item.level || "Intermediate")
    ] as [string, string]).slice(0, 8);
  }
  if (typeof record === "object") {
    return Object.entries(record).slice(0, 8) as Array<[string, string]>;
  }
  return [];
}

export function ProfileReview({
  profile,
  onContinue,
  onReset,
}: ProfileReviewProps) {
  const goal = profile?.normalizedGoal;
  const classification = profile?.goalClassification;
  const preferences = profile?.preferences;
  const risks = profile?.risks || [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
            PROFILE COMPILED
          </Badge>
          <h1 className="mt-2 text-xl font-bold text-card-foreground">
            {goal?.title || "Learner profile ready"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {profile?.learnerSummary ||
              "The profiler generated a learner model for downstream curriculum agents."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
          >
            Restart
          </Button>
          <Button
            onClick={onContinue}
          >
            Build curriculum <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              Goal Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Info label="Target outcome" value={goal?.targetOutcome} />
            <Info label="Deliverable" value={goal?.deliverable} />
            <Info
              label="Duration"
              value={
                goal?.durationDays ? `${goal.durationDays} days` : undefined
              }
            />
            <Info label="Assessment" value={preferences?.assessmentMode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <Route className="h-4 w-4 text-primary" />
              Product Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info label="Scope" value={classification?.scope} />
            <Info label="Flow" value={classification?.recommendedFlow} />
            <Info label="Budget" value={classification?.tokenBudgetClass} />
            <Info
              label="Plan"
              value={classification?.requiresPaidPlan ? "Pro flow (Paid)" : "Free flow"}
            />
          </CardContent>
        </Card>
      </div>

      {classification?.requiresPaidPlan && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-[10px]">
                ASTRA LEARN PRO
              </Badge>
              <span className="text-xs font-bold text-primary">₹499 / month</span>
            </div>
            <CardTitle className="text-base font-bold text-card-foreground">
              Pro Goal Roadmap Preview Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              This goal scope (<strong>{classification.scope}</strong>) is a long-form adaptive course. Free users receive a <strong>Roadmap Preview</strong> with Lesson 1 unlocked.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-card-foreground font-medium">
              <span>✓ Full multi-month adaptive plan</span>
              <span>✓ Pinecone vector search</span>
              <span>✓ Capstone code reviews</span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-[11px]">Special offer: <strong>₹1,499</strong> lifetime access</span>
              <Button size="sm">
                Upgrade to Pro (₹499/mo)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Baseline Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {entries(profile?.skillBaseline).map(([skill, level]) => (
              <Badge key={skill} variant="secondary">
                {skill}: {level}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="Learning style"
              value={preferences?.learningStyle || profile?.learningStyle}
            />
            <Info label="Daily time" value={preferences?.dailyTimeCommitment} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks.length ? (
              risks.map((risk) => (
                <div
                  key={`${risk.type}-${risk.note}`}
                  className="rounded-md border border-border p-2 bg-muted/50"
                >
                  <div className="text-xs font-semibold text-card-foreground">
                    {risk.type} · {risk.severity}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {risk.note}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No major risks detected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-card-foreground">Problem Context & Prerequisite Gaps</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Info label="Real-world use case" value={profile?.problemContext?.realWorldUseCase} />
            <Info label="Target project" value={profile?.problemContext?.targetProject} />
            <Info label="Success scenario" value={profile?.problemContext?.successScenario} />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Prerequisite Gaps To Master First
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile?.prerequisiteGaps || []).length ? (
                  profile?.prerequisiteGaps?.map((gap) => (
                    <Badge key={gap} variant="secondary" className="text-xs">
                      Gap: {gap}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No critical prerequisite gaps detected.</p>
                )}
              </div>
            </div>
            <Info
              label="Explanation Depth"
              value={profile?.learningPreferences?.explanationDepth}
            />
            <Info
              label="Practice Bias"
              value={profile?.learningPreferences?.practiceBias}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-card-foreground">Weak Areas & Routing Reason</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-wrap gap-2">
            {(profile?.weakAreas || []).length ? (
              (profile?.weakAreas || []).map((area) => (
                <Badge
                  key={area}
                  variant="outline"
                >
                  {area}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No weak areas identified yet.</p>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {classification?.reasoning ||
              "The product flow will be selected after the profile is compiled."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/30">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-card-foreground">
        {value || "Not specified"}
      </div>
    </div>
  );
}

