"use client"

import * as React from "react"
import Link from "next/link"
import { useSelector } from "react-redux"

import type { RootState } from "@/store/store"
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
  Settings2,
  CircleHelp,
  Sparkles,
  FolderKanban,
  BarChart3,
  Gem,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useSelector((state: RootState) => state.auth)

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
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Quick Start",
      url: "/dashboard/quickstart",
      icon: <Sparkles />,
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

  const navWorkspace = [
    {
      title: "AI Classroom",
      url: "/dashboard/classroom",
      icon: <BookOpen />,
    },
    {
      title: "Curriculum Map",
      url: "/dashboard/curriculum",
      icon: <Compass />,
    },
    {
      title: "SourceTrust Board",
      url: "/dashboard/sourcetrust",
      icon: <ShieldCheck />,
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
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1">
            Active Workspace
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
