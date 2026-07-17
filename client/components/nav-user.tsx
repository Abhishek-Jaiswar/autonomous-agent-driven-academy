"use client"

import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from "lucide-react"
import { useLogoutMutation } from "@/store/api/auth/auth-api"
import { logout } from "@/store/slices/authSlice"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const dispatch = useDispatch()
  const [logoutMutation] = useLogoutMutation()

  async function handleLogout() {
    try {
      await logoutMutation().unwrap()
    } catch {
      // Ignore API errors and proceed with client logout
    }
    dispatch(logout())
    router.push("/")
  }

  const initials = user.email.slice(0, 2).toUpperCase() || "ST"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="rounded-lg bg-violet-950/30 text-violet-400 font-bold border border-violet-800/30">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-slate-200">
                {user.name}
              </span>
              <span className="truncate text-xs text-slate-400">
                {user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4 text-slate-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 bg-slate-950 border border-slate-900 text-slate-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-violet-950/30 text-violet-400 font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-200">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-slate-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-900" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-900 hover:text-white">
                <CircleUserRoundIcon className="size-4 mr-2" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-900 hover:text-white">
                <CreditCardIcon className="size-4 mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-900 hover:text-white">
                <BellIcon className="size-4 mr-2" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-900" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 focus:bg-red-950/30 focus:text-red-400 cursor-pointer hover:bg-red-950/30 hover:text-red-400"
            >
              <LogOutIcon className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
