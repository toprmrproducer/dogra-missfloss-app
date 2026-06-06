"use client";

import { cn } from "@/lib/utils";

interface GitHubStarBadgeProps {
  className?: string;
  label?: string;
  showCount?: boolean;
  source: string;
}

export function GitHubStarBadge({ className, label, showCount: _showCount, source: _source }: GitHubStarBadgeProps) {
  return (
    <a
      href="https://missfloss.ai"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center rounded-md border text-sm leading-none hover:opacity-80 transition-opacity",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-md">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="font-medium">{label || "Miss Floss"}</span>
      </span>
    </a>
  );
}
