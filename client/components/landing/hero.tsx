"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="relative max-w-5xl mx-auto mt-8 sm:mt-12 px-4 flex flex-col items-center">
      {/* Background ambient light effects */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10" />
      
      {/* Centered Content Container */}
      <div className="flex flex-col space-y-6 text-center items-center max-w-3xl">
        {/* Announcement Badge */}
        <div className="flex items-center justify-center">
          <Badge 
            variant="outline" 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary transition-all duration-300 shadow-sm cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            Introducing AstraLearn AI 1.0
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Not Another
            <span className="block mt-1 bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-primary">
              Learning Platform.
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-foreground font-sans tracking-tight">
            An Autonomous Educational Ecosystem
          </h2>
        </div>

        {/* Body Paragraph */}
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
          Enter a fully agentic academy where 9 dedicated AI agents collaborate in real-time. 
          They teach customized lessons, assess depth of understanding, verify resource credibility, 
          and dynamically recalibrate your learning path.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg border-0 font-medium px-8 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            onClick={() => router.push("/dashboard/curriculum")}
          >
            Enter Academy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground hover:bg-muted font-medium px-8 transition-all duration-300 cursor-pointer"
            onClick={() => {
              const element = document.getElementById("features");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            How it works
          </Button>
        </div>
      </div>

      {/* Visual Showcase (SaaS Dashboard Mockup) */}
      <div className="relative mt-12 sm:mt-16 w-full max-w-4xl">
        {/* Dashboard ambient glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4/5 h-64 bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 rounded-full blur-3xl -z-10" />

        {/* Mockup Container */}
        <div className="relative rounded-2xl border border-border bg-card p-1.5 shadow-2xl transition-all duration-700 hover:scale-[1.01] hover:shadow-primary/5 group">
          <div className="relative overflow-hidden rounded-xl aspect-[16/10] sm:aspect-[16/9] w-full border border-border/60">
            <Image
              src="/astralearn_hero_light.png"
              alt="AstraLearn AI Platform Dashboard"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-102"
              priority
            />
          </div>

          {/* Floating Agent Badge 1 */}
          <div className="absolute -top-4 -left-4 sm:-left-6 bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-xl p-3 flex items-center gap-3 max-w-[190px] animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0">
              <BrainCircuit className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary font-mono">Intake Counselor</span>
              <span className="text-[11px] font-semibold text-foreground leading-tight">Adaptive Interview Active</span>
            </div>
          </div>

          {/* Floating Agent Badge 2 */}
          <div className="absolute -bottom-4 right-4 sm:-right-4 bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-xl p-3 flex items-center gap-3 max-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-accent shrink-0 border border-border">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-accent font-mono">Sourcing Board</span>
              <span className="text-[11px] font-semibold text-foreground leading-tight">Trust Score 98% (verified)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
