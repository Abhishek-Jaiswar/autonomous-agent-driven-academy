"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowUpRight, CheckCircle2, XCircle, AlertCircle, ThumbsUp, ThumbsDown, ExternalLink, Compass } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCurriculumQuery, useGetUserProjectsQuery, useToggleResourceStatusMutation } from "@/store/api/auth/auth-api";

export default function SourceVerifierPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();
  const [toggleResource, { isLoading: isToggling }] = useToggleResourceStatusMutation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      if (savedGoalId) {
        setGoalId(savedGoalId);
      } else if (userProjectsData?.data && userProjectsData.data.length > 0) {
        setGoalId(userProjectsData.data[0].id);
      }
    }
  }, [userProjectsData]);

  const { data: curriculumData, refetch } = useGetCurriculumQuery(goalId, { skip: !goalId });
  const goal = curriculumData?.data;
  const resources = goal?.resources || [];

  async function handleToggle(resourceId: string, status: "INCLUDED" | "REJECTED") {
    try {
      await toggleResource({ resourceId, status }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update resource status:", err);
    }
  }

  const verifiedCount = resources.filter((r: any) => r.status === "INCLUDED").length;
  const rejectedCount = resources.filter((r: any) => r.status === "REJECTED").length;

  return (
    <AgentGateGuard agentId="verifier" agentNumber="04" agentName="Source Verifier Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 04: SOURCE VERIFIER
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/30">
                SourceTrust Engine Active
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              SourceTrust Credibility & Hallucination Defense
            </h1>
            <p className="text-xs text-muted-foreground">
              Scores candidate web docs using strict heuristic rules (+40 official docs, +35 university, -25 unverified blogs).
            </p>
          </div>

          <Button onClick={() => router.push("/dashboard/curriculum")} size="sm" className="text-xs">
            Open Curriculum Architect <Compass className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Total Evaluated Sources
              </span>
              <CardTitle className="text-2xl font-bold text-card-foreground mt-1">
                {resources.length} <span className="text-xs font-normal text-muted-foreground">Candidate Web Links</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Verified & Included
              </span>
              <CardTitle className="text-2xl font-bold text-emerald-500 mt-1">
                {verifiedCount} <span className="text-xs font-normal text-muted-foreground">Sources High Credibility</span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Rejected / Filtered Out
              </span>
              <CardTitle className="text-2xl font-bold text-destructive mt-1">
                {rejectedCount} <span className="text-xs font-normal text-muted-foreground">Excluded Assets</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Resources Table & Scoring Heuristic Rationale */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> SourceTrust Index Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Review individual score breakdowns and override inclusion status if necessary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No external web resources indexed for this learning goal yet.
              </div>
            ) : (
              resources.map((item: any) => {
                const isIncluded = item.status === "INCLUDED";

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isIncluded
                        ? "border-border bg-card"
                        : "border-destructive/30 bg-destructive/5 text-muted-foreground"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isIncluded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-card-foreground">{item.title}</h4>
                        <Badge
                          variant={isIncluded ? "default" : "destructive"}
                          className="text-[9px] font-mono px-1.5 py-0"
                        >
                          Score: {item.trustScore}/100
                        </Badge>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                        <strong>Evaluation Reason:</strong> {item.reason || "Evaluated by SourceTrust heuristic engine."}
                      </p>

                      {item.url && (
                        <div className="pl-6 pt-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-mono"
                          >
                            {item.url.slice(0, 45)}... <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button
                        size="sm"
                        variant={isIncluded ? "default" : "outline"}
                        onClick={() => handleToggle(item.id, "INCLUDED")}
                        disabled={isToggling}
                        className="text-xs"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant={!isIncluded ? "destructive" : "outline"}
                        onClick={() => handleToggle(item.id, "REJECTED")}
                        disabled={isToggling}
                        className="text-xs"
                      >
                        <ThumbsDown className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AgentGateGuard>
  );
}
