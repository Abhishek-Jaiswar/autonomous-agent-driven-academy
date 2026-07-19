"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    badge?: string
    isLocked?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== "/dashboard" && pathname.startsWith(item.url))

            if (item.isLocked) {
              return (
                <SidebarMenuItem key={item.title}>
                  <div
                    title="Complete diagnostic intake to unlock"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground opacity-50 cursor-not-allowed select-none bg-muted/20 border border-transparent"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.icon}
                      <span className="truncate">{item.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 shrink-0 ml-auto flex items-center gap-1 border-muted-foreground/30">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </Badge>
                  </div>
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  render={<Link href={item.url} />}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className="text-[9px] font-mono px-1.5 py-0 shrink-0 ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
