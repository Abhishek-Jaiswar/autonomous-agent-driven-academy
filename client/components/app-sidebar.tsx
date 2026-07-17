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
      title: "Academy Overview",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Curriculum Map",
      url: "/dashboard/curriculum",
      icon: <Compass />,
    },
    {
      title: "AI Classroom",
      url: "/dashboard/classroom",
      icon: <BookOpen />,
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
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white mr-1.5 shrink-0 shadow-md">
                <GraduationCap className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-bold text-slate-100">AstraLearn AI</span>
                <span className="text-[10px] text-slate-400 font-mono">Agentic Academy</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
