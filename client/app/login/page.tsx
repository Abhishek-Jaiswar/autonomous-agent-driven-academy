"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrainCircuit, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/store/api/auth/auth-api";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [login, { isLoading, error: apiError }] = useLoginMutation();

  // Check if redirected from a successful signup
  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      setSignupSuccess(true);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");
    setSignupSuccess(false);

    if (!email || !password) {
      setValidationError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      const user = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (res?.success && user) {
        if (token) {
          dispatch(setCredentials({ user, token }));
        }
        router.push("/dashboard");
      } else {
        setValidationError(res?.message || "Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg =
        err?.data?.error ||
        err?.data?.message ||
        (typeof err?.error === "string" ? err.error : "") ||
        err?.message ||
        "Invalid email or password. Please try again.";
      setValidationError(msg);
    }
  }

  // Get readable API error message
  const errorMessage =
    validationError ||
    (apiError
      ? "data" in (apiError as object)
        ? (apiError as any).data?.error || (apiError as any).data?.message || "Authentication failed. Please try again."
        : typeof (apiError as any).error === "string"
        ? (apiError as any).error
        : "Authentication failed. Please try again."
      : "");

  return (
    <div className="w-full bg-card border border-border rounded-xl p-8 shadow-sm">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to resume your learning path
        </p>
      </div>

      {/* Messages */}
      {signupSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          Registration successful! Please sign in below.
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
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

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-medium py-2 shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Bottom link */}
      <div className="text-center mt-6 text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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

        <Suspense fallback={
          <div className="w-full bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground mt-2">Loading form...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
