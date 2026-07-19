"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const pathname = usePathname();

  let title = "AstraLearn AI";
  let agentBadge: string | null = null;

  if (pathname === "/dashboard") {
    title = "Academy Overview";
    agentBadge = "Overview Matrix";
  } else if (pathname === "/dashboard/counselor") {
    title = "Counselor Agent";
    agentBadge = "Agent 01 • Diagnostic Intake";
  } else if (pathname === "/dashboard/profiler") {
    title = "Learner Profiler";
    agentBadge = "Agent 02 • Profile Synthesis";
  } else if (pathname === "/dashboard/sourcetrust") {
    title = "Librarian Board";
    agentBadge = "Agent 03 • Web Resources";
  } else if (pathname === "/dashboard/verifier") {
    title = "Source Verifier";
    agentBadge = "Agent 04 • Trust Engine";
  } else if (pathname === "/dashboard/curriculum") {
    title = "Curriculum Architect";
    agentBadge = "Agent 05 • Syllabus Map";
  } else if (pathname === "/dashboard/schedule") {
    title = "Schedule Planner";
    agentBadge = "Agent 06 • Calendar Allocation";
  } else if (pathname === "/dashboard/classroom") {
    title = "AI Classroom";
    agentBadge = "Agent 07 • Teacher Session";
  } else if (pathname === "/dashboard/visuals") {
    title = "Visual Explainer";
    agentBadge = "Agent 08 • Blueprint Engine";
  } else if (pathname === "/dashboard/examiner") {
    title = "Examiner Agent";
    agentBadge = "Agent 09 • Knowledge Check";
  } else if (pathname === "/dashboard/coach") {
    title = "Adaptive Coach";
    agentBadge = "Agent 10 • Path Tuning";
  } else if (pathname === "/dashboard/projects") {
    title = "My Workspaces";
  } else if (pathname === "/dashboard/quickstart") {
    title = "Quick Start Goal";
  } else if (pathname === "/dashboard/analytics") {
    title = "Analytics & Progress";
  } else if (pathname === "/dashboard/pricing") {
    title = "Pricing & Plans";
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 h-4 data-vertical:self-auto"
          />
          <h1 className="text-sm font-bold text-foreground tracking-tight">{title}</h1>
        </div>

        {agentBadge && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping inline-block" />
              {agentBadge}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
