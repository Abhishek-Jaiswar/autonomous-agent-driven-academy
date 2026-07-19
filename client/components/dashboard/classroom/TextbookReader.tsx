"use client";

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Pause,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";

interface TextbookReaderProps {
  title: string;
  moduleTitle: string;
  content: string;
  status: string;
  isLoading?: boolean;
}

export function TextbookReader({
  title,
  moduleTitle,
  content,
  status,
  isLoading,
}: TextbookReaderProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Native Speech Synthesis API
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const plainText = content.replace(/[#*`_]/g, "");
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 1500));
      utterance.rate = playbackSpeed;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  }

  // Calculate reading time (~200 words per min)
  const wordCount = content ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-4">
      {/* Audio & Lesson Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>~{readingTimeMinutes} min read ({wordCount} words)</span>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlayingAudio ? "default" : "outline"}
            onClick={toggleSpeech}
            className="text-xs h-8 gap-1.5"
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 text-secondary animate-pulse" />
                <span>Pause Voice Guide</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span>Listen to Lesson</span>
              </>
            )}
          </Button>

          {isPlayingAudio && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-[10px] font-mono">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (isPlayingAudio) {
                      window.speechSynthesis.cancel();
                      setIsPlayingAudio(false);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === speed
                      ? "bg-primary text-secondary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Textbook Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 space-y-6">
          {/* Key Concept Callout Box */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" /> Key Concept Summary
            </div>
            <p className="text-xs text-card-foreground leading-relaxed">
              In this module (<strong>{moduleTitle}</strong>), you will master core principles of <strong>{title}</strong>. Read through the formatted breakdown below and check your understanding with the Examiner Quiz.
            </p>
          </div>

          <Separator />

          {/* Formatted Markdown Content */}
          <FormattedMarkdown content={content} />
        </CardContent>
      </Card>
    </div>
  );
}
