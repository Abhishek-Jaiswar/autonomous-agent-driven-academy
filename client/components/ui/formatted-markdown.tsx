"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormattedMarkdownProps {
  content: string;
}

export function FormattedMarkdown({ content }: FormattedMarkdownProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!content) return null;

  const blocks = parseMarkdownBlocks(content);

  function copyCode(code: string, idx: number) {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-4 text-sm leading-relaxed text-card-foreground">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1 key={idx} className="text-xl font-extrabold text-foreground tracking-tight pt-4 pb-1 border-b border-border">
                {renderInlineFormatting(block.text)}
              </h1>
            );
          case "h2":
            return (
              <h2 key={idx} className="text-lg font-bold text-foreground tracking-tight pt-4 pb-1 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
                {renderInlineFormatting(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={idx} className="text-base font-bold text-foreground tracking-tight pt-3">
                {renderInlineFormatting(block.text)}
              </h3>
            );
          case "h4":
          case "h5":
          case "h6":
            return (
              <h4 key={idx} className="text-sm font-bold text-foreground tracking-tight pt-3 pb-0.5 border-b border-border/40">
                {renderInlineFormatting(block.text)}
              </h4>
            );
          case "code":
            return (
              <div key={idx} className="my-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs overflow-x-auto shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-[10px] text-slate-400 bg-slate-900/50">
                  <span className="uppercase font-mono tracking-wider">{block.lang || "Code Reference"}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(block.text, idx)}
                    className="h-6 px-2 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    {copiedIdx === idx ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    )}
                  </Button>
                </div>
                <pre className="p-4 whitespace-pre-wrap leading-relaxed">{block.text}</pre>
              </div>
            );
          case "quote":
            return (
              <div key={idx} className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-xs text-card-foreground space-y-1 my-3">
                <div className="flex items-center gap-1.5 font-bold text-primary uppercase text-[10px] font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Key Takeaway
                </div>
                <div>{renderInlineFormatting(block.text)}</div>
              </div>
            );
          case "list":
            return (
              <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-primary my-2 text-card-foreground">
                {block.items.map((item: string, itemIdx: number) => (
                  <li key={itemIdx} className="leading-relaxed">
                    {renderInlineFormatting(item)}
                  </li>
                ))}
              </ul>
            );
          case "paragraph":
          default:
            return (
              <p key={idx} className="text-muted-foreground leading-relaxed">
                {renderInlineFormatting(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// Block parser function supporting h1..h6, code, quotes, lists, paragraphs
function parseMarkdownBlocks(content: string) {
  const lines = content.split("\n");
  const blocks: Array<any> = [];
  let currentBlock: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block check
    if (line.trim().startsWith("```")) {
      if (currentBlock && currentBlock.type === "code") {
        blocks.push(currentBlock);
        currentBlock = null;
      } else {
        if (currentBlock) blocks.push(currentBlock);
        const lang = line.trim().slice(3).trim();
        currentBlock = { type: "code", lang, text: "" };
      }
      continue;
    }

    if (currentBlock && currentBlock.type === "code") {
      currentBlock.text += (currentBlock.text ? "\n" : "") + line;
      continue;
    }

    // Heading regex matching # to ######
    const headingMatch = line.trim().match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentBlock) blocks.push(currentBlock);
      const level = headingMatch[1].length;
      const hType = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : `h${level}`;
      blocks.push({ type: hType, text: headingMatch[2].trim() });
      currentBlock = null;
      continue;
    }

    // Blockquote (> text)
    if (line.startsWith("> ")) {
      if (currentBlock && currentBlock.type === "quote") {
        currentBlock.text += " " + line.slice(2).trim();
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: "quote", text: line.slice(2).trim() };
      }
      continue;
    }

    // List items (- item, * item, 1. item)
    const listMatch = line.trim().match(/^([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const itemText = listMatch[2].trim();
      if (currentBlock && currentBlock.type === "list") {
        currentBlock.items.push(itemText);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: "list", items: [itemText] };
      }
      continue;
    }

    // Empty line separates blocks
    if (!line.trim()) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Regular paragraph text
    if (currentBlock && currentBlock.type === "paragraph") {
      currentBlock.text += " " + line.trim();
    } else {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: "paragraph", text: line.trim() };
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  return blocks;
}

// Robust inline formatting parser handling multiple **bold**, *italic*, `code` tokens per line
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return "";

  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Check for bold **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      tokens.push(
        <strong key={keyIdx++} className="font-bold text-foreground">
          {renderInlineFormatting(boldMatch[2])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 2. Check for italic *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch && !boldMatch) {
      tokens.push(
        <em key={keyIdx++} className="italic text-foreground/90">
          {renderInlineFormatting(italicMatch[2])}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 3. Check for inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary border border-border">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 4. Find next occurrence of Markdown inline token
    const nextIdx = remaining.search(/(\*\*|__|[*_`])/);
    if (nextIdx === -1) {
      tokens.push(remaining);
      break;
    } else if (nextIdx > 0) {
      tokens.push(remaining.slice(0, nextIdx));
      remaining = remaining.slice(nextIdx);
    } else {
      // Fallback for unmatched character
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return <>{tokens}</>;
}
