"use client";

import React from "react";
import { Check, Gem, Zap, Shield, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="text-xs uppercase tracking-wider">
          ASTRA LEARN PRO
        </Badge>
        <h1 className="text-3xl font-extrabold text-card-foreground">
          Unlock Unlimited Autonomous Agent Coaching
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          Choose a plan tailored for your learning goals. Accelerate your career with deep RAG vector searches, multi-month adaptive roadmaps, and capstone code evaluations.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <Badge variant="outline" className="w-fit text-[10px]">
              STARTER
            </Badge>
            <CardTitle className="text-xl font-bold mt-2">Free Plan</CardTitle>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-card-foreground">₹0</span>
              <span className="text-xs text-muted-foreground">/ forever</span>
            </div>
            <CardDescription className="text-xs mt-2">
              Essential mini-lessons and quick concept checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Instant Mini-Lesson Generation</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Free Roadmap Previews (Lesson 1)</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>3-Question Structured Quizzes</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Standard Community Support</span>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Monthly (Featured) */}
        <Card className="flex flex-col justify-between border-primary shadow-lg relative bg-card">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="default" className="text-[10px] uppercase flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> MOST POPULAR
            </Badge>
          </div>

          <CardHeader>
            <Badge variant="secondary" className="w-fit text-[10px]">
              ASTRA PRO
            </Badge>
            <CardTitle className="text-xl font-bold mt-2">Pro Monthly</CardTitle>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-primary">₹499</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <CardDescription className="text-xs mt-2">
              Full adaptive courses, capstones, and Pinecone vector RAG search.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-card-foreground font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Full Multi-Month Adaptive Courses</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Pinecone Vector RAG Deep Search</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Adaptive Remedial Review Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Capstone Project Code Evaluations</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground font-medium">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Priority Worker Queue Processing</span>
            </div>
          </CardContent>

          <CardFooter className="pt-4 border-t border-border">
            <Button className="w-full">
              Upgrade to Pro (₹499/mo)
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Lifetime */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <Badge variant="outline" className="w-fit text-[10px]">
              BEST VALUE
            </Badge>
            <CardTitle className="text-xl font-bold mt-2">Pro Lifetime</CardTitle>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-card-foreground">₹1,499</span>
              <span className="text-xs text-muted-foreground">/ one-time</span>
            </div>
            <CardDescription className="text-xs mt-2">
              Lifetime access to all current and upcoming AI agent features.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Everything in Pro Monthly</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Lifetime Access (No Recurring Fees)</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Early Access to New Agent Models</span>
            </div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>VIP Priority Support</span>
            </div>
          </CardContent>

          <CardFooter className="pt-4 border-t border-border">
            <Button variant="outline" className="w-full">
              Get Lifetime Access (₹1,499)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
