"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  Settings2,
  CircleHelp,
  FolderKanban,
  BarChart3,
  Gem,
  BrainCircuit,
  Calendar,
  Layers,
  Award,
  Zap,
  CheckCircle,
} from "lucide-react"

import { useGetCurriculumQuery, useGetUserProjectsQuery, useGetUserAnalyticsQuery, useGetMeQuery } from "@/store/api/auth/auth-api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: meData } = useGetMeQuery()
  const currentUser = meData?.data?.user || meData?.user
  const user = {
    name: currentUser?.email?.split("@")[0] || "Student",
    email: currentUser?.email || "learner@astralearn.ai",
    avatar: "/avatars/user.jpg",
  }

  const [goalId, setGoalId] = useState<string | null>(null)
  const { data: userProjectsData } = useGetUserProjectsQuery()
  const { data: analyticsData } = useGetUserAnalyticsQuery()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id")
      if (savedGoalId) {
        setGoalId(savedGoalId)
      } else if (userProjectsData?.data && userProjectsData.data.length > 0) {
        setGoalId(userProjectsData.data[0].id)
      }
    }
  }, [userProjectsData])

  const { data: curriculumData } = useGetCurriculumQuery(goalId, { skip: !goalId })
  const goal = curriculumData?.data
  const profile = goal?.profile
  const phases = goal?.curriculum?.phases || []
  const analytics = analyticsData?.data

  // Sequential agent unlock state definitions
  const isGoalStarted = Boolean(goalId)
  const isInterviewComplete = Boolean(
    profile?.skillBaseline && Object.keys(profile.skillBaseline).length > 0
  )
  const isCurriculumReady = phases.length > 0
  const completedLessons = analytics?.completedLessons || 0
  const hasCompletedLesson = completedLessons > 0

  const user = auth.user
    ? {
        name: "Student Account",
        email: auth.user.email,
        avatar: "",
      }
    : {
        name: "Guest Student",
        email: "guest@astralearn.ai",
        avatar: "",
      }

  const navMain = [
    {
      title: "Dashboard Overview",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "My Workspaces",
      url: "/dashboard/projects",
      icon: <FolderKanban />,
    },
    {
      title: "Analytics & Progress",
      url: "/dashboard/analytics",
      icon: <BarChart3 />,
    },
    {
      title: "Pricing & Pro (₹)",
      url: "/dashboard/pricing",
      icon: <Gem />,
    },
  ]

  // All 10 Agents with strict sequential unlock rules
  const navWorkspace = [
    {
      title: "Counselor Agent",
      url: "/dashboard/counselor",
      icon: <MessageSquare className="text-primary" />,
      badge: "Agent 01",
      isLocked: false, // Always unlocked for project intake
    },
    {
      title: "Profiler Agent",
      url: "/dashboard/profiler",
      icon: <BrainCircuit className="text-indigo-500" />,
      badge: "Agent 02",
      isLocked: !isInterviewComplete, // Unlocks when counseling interview completes
    },
    {
      title: "Librarian Board",
      url: "/dashboard/sourcetrust",
      icon: <ShieldCheck className="text-indigo-500" />,
      badge: "Agent 03",
      isLocked: !isInterviewComplete, // Unlocks when learner profile is compiled
    },
    {
      title: "Source Verifier",
      url: "/dashboard/verifier",
      icon: <CheckCircle className="text-emerald-500" />,
      badge: "Agent 04",
      isLocked: !isInterviewComplete, // Unlocks when learner profile is compiled
    },
    {
      title: "Curriculum Architect",
      url: "/dashboard/curriculum",
      icon: <Compass className="text-violet-500" />,
      badge: "Agent 05",
      isLocked: !isCurriculumReady, // Locked until curriculum generation completes!
    },
    {
      title: "Schedule Planner",
      url: "/dashboard/schedule",
      icon: <Calendar className="text-violet-500" />,
      badge: "Agent 06",
      isLocked: !isCurriculumReady, // Locked until schedule allocation completes!
    },
    {
      title: "AI Classroom (Teacher)",
      url: "/dashboard/classroom",
      icon: <BookOpen className="text-emerald-500" />,
      badge: "Agent 07",
      isLocked: !isCurriculumReady, // Locked until active lesson is unlocked!
    },
    {
      title: "Visual Explainer (Sub-agent)",
      url: "/dashboard/visuals",
      icon: <Layers className="text-primary" />,
      badge: "Agent 08",
      isLocked: !isCurriculumReady, // Locked until visual diagrams are generated!
    },
    {
      title: "Examiner Agent (Sub-agent)",
      url: "/dashboard/examiner",
      icon: <Award className="text-amber-500" />,
      badge: "Agent 09",
      isLocked: !isCurriculumReady, // Locked until evaluation quiz is compiled!
    },
    {
      title: "Adaptive Coach",
      url: "/dashboard/coach",
      icon: <Zap className="text-primary" />,
      badge: "Agent 10",
      isLocked: !hasCompletedLesson, // Strictly locked until learner completes at least 1 lesson!
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2 />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelp />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary mr-1.5 shrink-0 shadow-md">
                <GraduationCap className="size-8 text-secondary" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-bold ">AstraLearn AI</span>
                <span className="text-[10px] font-mono">Agentic Academy</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <div className="px-3 pt-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1.5 flex items-center justify-between">
            <span>Agent Workspaces (10)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Autonomous Graph Active" />
          </div>
          <NavMain items={navWorkspace} />
        </div>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
