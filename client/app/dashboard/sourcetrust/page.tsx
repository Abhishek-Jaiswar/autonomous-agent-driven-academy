"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowUpRight,
  XCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Compass,
  ArrowRight,
} from "lucide-react";

import {
  useGetCurriculumQuery,
  useGetUserProjectsQuery,
  useToggleResourceStatusMutation,
  useTriggerArchitectMutation,
} from "@/store/api/auth/auth-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";

export default function SourceTrustAudit() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();
  const [toggleResource] = useToggleResourceStatusMutation();
  const [triggerArchitect, { isLoading: isTriggeringArchitect }] = useTriggerArchitectMutation();

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

  const { data, isLoading, error } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  async function handleToggle(resourceId: string, status: "INCLUDED" | "REJECTED") {
    try {
      await toggleResource({ resourceId, status }).unwrap();
    } catch (err) {
      console.error("Failed to update resource status:", err);
    }
  }

  async function handleInitiateArchitect() {
    if (!goalId) return;
    try {
      await triggerArchitect({ goalId }).unwrap();
      router.push("/dashboard/curriculum");
    } catch (err) {
      console.error("Failed to trigger Curriculum Architect:", err);
      router.push("/dashboard/curriculum");
    }
  }

  if (isLoading || !goalId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-mono animate-pulse">
          Librarian Agent searching web and auditing documents...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 text-destructive max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Error Loading Sourcing Board
          </CardTitle>
          <CardDescription>
            Ensure the backend is online and the collection variables are configured correctly.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const resources = data?.data?.resources || [];

  return (
    <AgentGateGuard agentId="sourcetrust" agentNumber="03" agentName="Librarian Agent Board">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 03: LIBRARIAN
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-500 border-emerald-500/30">
                SourceTrust Board Active
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Librarian Board & Source Verifier Ledger
            </h1>
            <p className="text-xs text-muted-foreground">
              Auditing web search results evaluated by our **Librarian & SourceTrust Heuristics Agent**. Approve or reject sources below before generating your syllabus.
            </p>
          </div>

          <Button
            onClick={handleInitiateArchitect}
            disabled={isTriggeringArchitect}
            size="sm"
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isTriggeringArchitect ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Compass className="w-3.5 h-3.5 mr-1.5" />
            )}
            Initiate Curriculum Architect (Agent 05) <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold text-card-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Heuristic Credibility Ledger & Human Intervention
              </span>
              <Badge variant="outline" className="text-xs font-mono">
                {resources.length} Candidates Evaluated
              </Badge>
            </CardTitle>
            <CardDescription>
              SourceTrust scoring: +40 official documentation, +35 academic papers, -25 legacy blogs. Click **Approve** or **Reject** to override agent decisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {resources.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic text-sm">
                Librarian Agent is currently discovering candidate resources across web APIs...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 border-border">
                  <TableRow className="border-border">
                    <TableHead className="w-[25%] font-mono text-xs">Resource Title</TableHead>
                    <TableHead className="w-[12%] font-mono text-xs">Trust Score</TableHead>
                    <TableHead className="w-[12%] font-mono text-xs">Reference Type</TableHead>
                    <TableHead className="w-[12%] font-mono text-xs">Agent Status</TableHead>
                    <TableHead className="w-[22%] font-mono text-xs">Scoring Heuristic Reasoning</TableHead>
                    <TableHead className="w-[17%] font-mono text-xs text-right">Human Intervention</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((res: any) => {
                    const isRejected = res.status === "REJECTED";

                    return (
                      <TableRow key={res.id} className="border-border">
                        <TableCell className="font-medium text-card-foreground py-3.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold line-clamp-2">{res.title}</span>
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                              >
                                {res.url.slice(0, 40)}... <ArrowUpRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex flex-col gap-0.5 items-start">
                            <span className="text-xs font-bold font-mono text-card-foreground">
                              {res.trustScore}/100
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold ${
                                res.trustLabel === "Verified"
                                  ? "text-emerald-500"
                                  : res.trustLabel === "Strong"
                                  ? "text-indigo-500"
                                  : res.trustLabel === "Caution"
                                  ? "text-amber-500"
                                  : "text-destructive"
                              }`}
                            >
                              {res.trustLabel}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs font-mono text-muted-foreground capitalize">
                          {res.type.replace("_", " ")}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge
                            variant={isRejected ? "outline" : "default"}
                            className={`flex items-center gap-1 w-fit font-semibold text-[10px] ${
                              isRejected
                                ? "border-destructive/50 text-destructive bg-destructive/10"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {isRejected ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {isRejected ? "REJECTED" : "INCLUDED"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground leading-normal py-3.5">
                          {res.reason}
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isRejected ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggle(res.id, "INCLUDED")}
                                className="text-emerald-600 hover:bg-emerald-50 h-7 text-[11px]"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" /> Include
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggle(res.id, "REJECTED")}
                                className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AgentGateGuard>
  );
}
