import React from "react";
import Link from "next/link";
import { Sparkles, GitBranch } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/50 py-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Left Brand */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground">AstraLearn AI</span>
          <span>— Autonomous Agentic Academy</span>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Get Started
          </Link>
          <a
            href="https://github.com/Abhishek-Jaiswar/autonomous-agent-driven-academy"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>

        {/* Right Copyright */}
        <div>
          © {new Date().getFullYear()} AstraLearn AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;