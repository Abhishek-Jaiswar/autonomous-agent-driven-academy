"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/auth/auth-api";
import type { RootState } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Ignore API logout errors and proceed with client logout
    }
    dispatch(logout());
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand/Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
            astra academy.
          </Link>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full focus:outline-none cursor-pointer">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                      {user.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border text-foreground w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Student Account</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/curriculum")}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer font-medium shadow-sm"
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
