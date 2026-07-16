"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { BrainCircuit, BookOpen, Layers, ShieldCheck, Search, LogOut, Loader2, User } from "lucide-react";

import type { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/redux/slices/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.auth);

  // Guard Route: Redirect to login if user not authenticated
  useEffect(() => {
    if (!auth.user) {
      router.push("/");
    }
  }, [auth.user, router]);

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-violet-500" /> Redirecting to login...
      </div>
    );
  }

  // Helper to determine if link is active
  const isActive = (path: string) => pathname.startsWith(path);

  function handleLogoutClick() {
    dispatch(logout());
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* ── Top Header Navigation (shadcn dashboard-01 style) ───────────────────── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                AstraLearn AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard/curriculum"
              className={`flex items-center gap-2 transition-colors py-1 ${
                isActive("/dashboard/curriculum")
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              Curriculum Map
            </Link>

            <Link
              href="/dashboard/classroom"
              className={`flex items-center gap-2 transition-colors py-1 ${
                isActive("/dashboard/classroom")
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Classroom
            </Link>

            <Link
              href="/dashboard/sourcetrust"
              className={`flex items-center gap-2 transition-colors py-1 ${
                isActive("/dashboard/sourcetrust")
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Sourcing Board
            </Link>
          </nav>

          {/* Search bar & Profile menu */}
          <div className="flex items-center gap-4 flex-1 md:flex-initial justify-end">
            
            {/* Search Input Box */}
            <div className="relative w-full max-w-[200px] hidden sm:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search academy..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-600"
              />
            </div>

            {/* Profile Avatar Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full w-9 h-9 focus:outline-none cursor-pointer">
                <Avatar className="w-8 h-8 border border-slate-800">
                  <AvatarFallback className="bg-slate-900 text-slate-300 text-xs">
                    {auth.user.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-200 w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Student Account</p>
                    <p className="text-xs leading-none text-slate-400">{auth.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={() => router.push("/dashboard/curriculum")} className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={handleLogoutClick} className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {children}
      </main>

    </div>
  );
}
