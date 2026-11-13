import React from "react";

export function ReportsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading interest reports"
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4 animate-pulse select-none"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-surface-muted rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 bg-surface-muted rounded-md w-36" />
                <div className="h-2.5 bg-surface-muted rounded-md w-48" />
              </div>
            </div>
            <div className="h-5 bg-surface-muted rounded-full w-20" />
          </div>

          {/* Members Rows Skeleton */}
          <div className="space-y-3 pt-1">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-4 py-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-surface-muted" />
                  <div className="h-3 bg-surface-muted rounded-md w-28" />
                </div>
                <div className="h-3 bg-surface-muted rounded-md w-36 hidden sm:block" />
                <div className="h-4 bg-surface-muted rounded-full w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

