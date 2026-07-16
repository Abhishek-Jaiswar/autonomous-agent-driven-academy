"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowUpRight, XCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import { useGetCurriculumQuery } from "@/lib/redux/api/apiSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SourceTrustAudit() {
  const [goalId, setGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      setGoalId(savedGoalId);
    }
  }, []);

  const { data, isLoading, error } = useGetCurriculumQuery(goalId, {
    skip: !goalId,
  });

  if (isLoading || !goalId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-slate-400 text-sm font-mono animate-pulse">Loading Sourcing records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/20 text-red-400 max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Error Loading Sourcing Board
          </CardTitle>
          <CardDescription className="text-red-300/80">
            Ensure the backend is online and the collection variables are configured correctly.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const resources = data?.data?.resources || [];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
          <ShieldCheck className="w-6 h-6 text-violet-400" />
          Sourcing & Verifier Board
        </h1>
        <p className="text-sm text-slate-400">
          Auditing candidate content references evaluated against our **SourceTrust Heuristics Matrix**.
        </p>
      </div>

      <Card className="border-slate-900 bg-slate-900/50">
        <CardHeader className="pb-3 border-b border-slate-900">
          <CardTitle className="text-base font-bold text-slate-200">Heuristic Credibility Ledger</CardTitle>
          <CardDescription className="text-slate-400">
            SourceTrust automatically scores resources: +40 official docs, +35 universities, -25 blog postings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          
          {resources.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-sm">
              No candidate resources have been evaluated for this session.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/60 border-slate-900">
                <TableRow className="border-slate-900 hover:bg-slate-950/60">
                  <TableHead className="w-[30%] text-slate-400 font-mono text-xs">Resource Title</TableHead>
                  <TableHead className="w-[15%] text-slate-400 font-mono text-xs">Score / Label</TableHead>
                  <TableHead className="w-[15%] text-slate-400 font-mono text-xs">Reference Type</TableHead>
                  <TableHead className="w-[15%] text-slate-400 font-mono text-xs">Status</TableHead>
                  <TableHead className="w-[25%] text-slate-400 font-mono text-xs">Scoring Heuristic Reasoning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((res: any) => {
                  const isRejected = res.status === "REJECTED";
                  
                  return (
                    <TableRow key={res.id} className="border-slate-900 hover:bg-slate-900/30">
                      
                      {/* Title & URL link */}
                      <TableCell className="font-medium text-slate-200 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{res.title}</span>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                            >
                              {res.url.slice(0, 45)}... <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Score & Label Badge */}
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-sm font-bold text-white font-mono">{res.trustScore}/100</span>
                          <span className={`text-[10px] uppercase font-semibold ${
                            res.trustLabel === "Verified"
                              ? "text-green-400"
                              : res.trustLabel === "Strong"
                              ? "text-blue-400"
                              : res.trustLabel === "Caution"
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}>
                            {res.trustLabel}
                          </span>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-4 text-xs font-mono text-slate-400 capitalize">
                        {res.type.replace("_", " ")}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={`flex items-center gap-1.5 w-fit font-semibold text-xs py-1 px-2.5 rounded ${
                            isRejected
                              ? "bg-red-950/20 text-red-400 border border-red-900/30"
                              : "bg-green-950/20 text-green-400 border border-green-900/30"
                          }`}
                        >
                          {isRejected ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          {isRejected ? "REJECTED" : "INCLUDED"}
                        </Badge>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-xs text-slate-400 leading-normal py-4">
                        {res.reason}
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
  );
}
