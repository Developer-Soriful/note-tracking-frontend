import React from "react";

export function PostsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading posts"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4 animate-pulse select-none"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-4.5 bg-surface-muted rounded-md w-3/4" />
            <div className="h-4 bg-surface-muted rounded-full w-14" />
          </div>

          <div className="space-y-2">
            <div className="h-3 bg-surface-muted rounded-md w-full" />
            <div className="h-3 bg-surface-muted rounded-md w-5/6" />
            <div className="h-3 bg-surface-muted rounded-md w-4/6" />
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <div className="h-3 bg-surface-muted rounded-md w-28" />
            <div className="h-3 bg-surface-muted rounded-md w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

