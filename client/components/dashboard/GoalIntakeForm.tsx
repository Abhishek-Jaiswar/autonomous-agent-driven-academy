"use client"

import React, { useState } from "react"
import { BrainCircuit, Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface GoalIntakeFormProps {
  onSubmit: (goalText: string, category: "exam_prep" | "job_project" | "school_subject", durationDays: number) => void
  isLoading: boolean
}

export function GoalIntakeForm({ onSubmit, isLoading }: GoalIntakeFormProps) {
  const [goalText, setGoalText] = useState("")
  const [category, setCategory] = useState<
    "exam_prep" | "job_project" | "school_subject"
  >("job_project")
  const [durationDays, setDurationDays] = useState(21)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goalText.trim() || goalText.length < 10) return
    onSubmit(goalText, category, durationDays)
  }

  const suggestions = [
    {
      title: "Generative AI Architect",
      text: "I want to learn Generative AI and build a RAG product recommendation system for jobs.",
      category: "job_project" as const,
      days: 21,
    },
    {
      title: "UPSC Indian Polity",
      text: "I want to prepare Indian Polity for UPSC including Constitutional bodies and rights.",
      category: "exam_prep" as const,
      days: 45,
    },
    {
      title: "Class 12 Physics",
      text: "I want to study Class 12 Physics: Electromagnetic Induction and AC generators.",
      category: "school_subject" as const,
      days: 14,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Counselor Hero greeting */}
      <div className="flex items-start gap-4 p-6 rounded-2xl border">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <Badge className=" font-mono text-[10px]">
            Counselor Agent Active
          </Badge>
          <h1 className="text-xl font-bold text-white">
            Hey, I am your Counselor Agent. Let me know what you want to study.
          </h1>
          <p className="text-sm text-slate-400">
            Enter your learning goal below. I will interview you to understand
            your baseline skills and design a tailored curriculum map.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <Card className="border-slate-900 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">
            Initialize Study Academy
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Provide a clear goal (minimum 10 characters) and study details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Your Primary Learning Goal
              </label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g. I want to learn Generative AI and build a RAG product recommendation system for jobs."
                rows={3}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-600 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Suggestions grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Quick Start Suggestions
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.map((s) => (
                  <div
                    key={s.title}
                    onClick={() => {
                      if (!isLoading) {
                        setGoalText(s.text)
                        setCategory(s.category)
                        setDurationDays(s.days)
                      }
                    }}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-violet-500/40 hover:bg-slate-900/40 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-bold text-slate-300">
                        {s.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Academy Track Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950/80 px-3 text-sm text-slate-300 focus:border-violet-600 focus:outline-none"
                >
                  <option value="job_project">Portfolio Project (Career)</option>
                  <option value="exam_prep">Exam Preparation (Standard)</option>
                  <option value="school_subject">Academic Subject (School)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Target Duration (Days)
                </label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  min={1}
                  max={120}
                  disabled={isLoading}
                  className="bg-slate-950 text-slate-300 border-slate-800 h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                disabled={goalText.trim().length < 10 || isLoading}
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-violet-600/10 cursor-pointer disabled:opacity-50"
              >
                Initiate Academy Counsel <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
