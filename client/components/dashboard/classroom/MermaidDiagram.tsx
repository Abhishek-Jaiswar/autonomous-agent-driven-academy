"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2, AlertCircle, RefreshCw, Code, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "var(--font-sans), system-ui, sans-serif",
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);
    setError(null);

    async function renderChart() {
      if (!chart || !chart.trim()) {
        if (isMounted) setIsRendering(false);
        return;
      }

      try {
        const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const cleanChart = chart.replace(/```[a-z]*/g, "").trim();

        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvgHtml(svg);
          setIsRendering(false);
        }
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError(err?.message || "Failed to render visual flowchart");
          setIsRendering(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (isRendering) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-2 border border-border rounded-2xl bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          Generating visual flowchart nodes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle View Mode Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-muted/40 text-xs">
        <div className="flex items-center gap-2 font-mono text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Visual Architecture Diagram</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRawCode((prev) => !prev)}
          className="h-7 text-[11px] gap-1.5"
        >
          {showRawCode ? (
            <>
              <Eye className="w-3 h-3 text-primary" /> View Flowchart
            </>
          ) : (
            <>
              <Code className="w-3 h-3" /> View Mermaid Code
            </>
          )}
        </Button>
      </div>

      {showRawCode ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
          <pre className="whitespace-pre-wrap">{chart}</pre>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-500 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4" /> Mermaid Parsing Fallback
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The visual engine encountered non-standard node syntax. Showing raw diagram definition:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
            <pre className="whitespace-pre-wrap">{chart}</pre>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="p-6 rounded-2xl border border-border bg-slate-950 flex justify-center items-center overflow-x-auto shadow-inner min-h-[300px]"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}
    </div>
  );
}
