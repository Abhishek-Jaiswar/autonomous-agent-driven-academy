"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Compass, BookOpen, Layers, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { AgentGateGuard } from "@/components/dashboard/AgentGateGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCurriculumQuery, useGetUserProjectsQuery } from "@/store/api/auth/auth-api";
import { MermaidDiagram } from "@/components/dashboard/classroom/MermaidDiagram";

export default function VisualExplainerPage() {
  const router = useRouter();
  const [goalId, setGoalId] = useState<string | null>(null);
  const [selectedDiagramLesson, setSelectedDiagramLesson] = useState<any>(null);

  const { data: userProjectsData } = useGetUserProjectsQuery();

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

  const { data: curriculumData } = useGetCurriculumQuery(goalId, { skip: !goalId });
  const goal = curriculumData?.data;
  const phases = goal?.curriculum?.phases || [];

  const diagramLessons: any[] = [];
  phases.forEach((phase: any) => {
    phase.modules?.forEach((mod: any) => {
      mod.lessons?.forEach((les: any) => {
        diagramLessons.push({
          ...les,
          moduleTitle: mod.title,
        });
      });
    });
  });

  useEffect(() => {
    if (diagramLessons.length > 0 && !selectedDiagramLesson) {
      setSelectedDiagramLesson(diagramLessons[0]);
    }
  }, [diagramLessons, selectedDiagramLesson]);

  return (
    <AgentGateGuard agentId="visuals" agentNumber="08" agentName="Visual Explainer Agent">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                AGENT 08: VISUAL EXPLAINER
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-mono text-primary border-primary/30">
                Mermaid.js Visual Engine
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">
              Conceptual Flowcharts & Visual Blueprints
            </h1>
            <p className="text-xs text-muted-foreground">
              Generates visual pipelines, sequence diagrams, and flowcharts illustrating complex technical relationships.
            </p>
          </div>

          <Button onClick={() => router.push("/dashboard/classroom")} size="sm" className="text-xs">
            Open AI Classroom <BookOpen className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Main 2-Column Split: Diagram Library & Mermaid Blueprint Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (1-Span): Lesson Selector */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Diagram Library
              </CardTitle>
              <CardDescription className="text-xs">
                Select any syllabus lesson to view its architectural blueprint.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
              {diagramLessons.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No diagrams generated yet.
                </p>
              ) : (
                diagramLessons.map((item: any) => {
                  const isSelected = selectedDiagramLesson?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDiagramLesson(item)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 font-bold text-card-foreground"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-1">{item.title}</span>
                        {item.diagram && <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.moduleTitle}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Right Column (2-Span): Visual Blueprint Renderer */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {selectedDiagramLesson?.moduleTitle || "Syllabus Diagram"}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Mermaid.js Flowchart
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-card-foreground mt-2">
                {selectedDiagramLesson?.title || "Select a lesson"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedDiagramLesson?.diagram ? (
                <MermaidDiagram chart={selectedDiagramLesson.diagram} />
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Compass className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground italic">
                    Select a lesson from the diagram library on the left.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AgentGateGuard>
  );
}
