"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignupMutation } from "@/store/api/auth/auth-api";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const [signup, { isLoading, error: apiError }] = useSignupMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    if (!email || !password || !confirmPassword) {
      setValidationError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      const res = await signup({ email, password }).unwrap();
      const user = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (res?.success && user) {
        if (token) {
          dispatch(setCredentials({ user, token }));
        }
        router.push("/dashboard");
      } else {
        setValidationError(res?.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Signup failed:", err);
      const msg =
        err?.data?.error ||
        err?.data?.message ||
        (typeof err?.error === "string" ? err.error : "") ||
        err?.message ||
        "Registration failed. Please try again.";
      setValidationError(msg);
    }
  }

  // Get readable API error message
  const errorMessage =
    validationError ||
    (apiError
      ? "data" in (apiError as object)
        ? (apiError as any).data?.error || (apiError as any).data?.message || "Registration failed. Please try again."
        : typeof (apiError as any).error === "string"
        ? (apiError as any).error
        : "Registration failed. Please try again."
      : "");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            astra academy.
          </span>
        </Link>

        {/* Card Container */}
        <div className="w-full bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Sign up to begin your agent-guided learning
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-medium py-2 shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Bottom link */}
          <div className="text-center mt-6 text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
