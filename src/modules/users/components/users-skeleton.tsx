import React from "react";

export function UsersSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading users"
      className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs animate-pulse select-none"
    >
      <div className="hidden md:block">
        <div className="border-b border-border-subtle bg-surface-muted/50 p-4">
          <div className="h-4 bg-surface-muted rounded-md w-1/4" />
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3 w-1/3">
                <div className="h-8 w-8 rounded-full bg-surface-muted shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-3.5 bg-surface-muted rounded-md w-3/4" />
                  <div className="h-2.5 bg-surface-muted rounded-md w-1/2" />
                </div>
              </div>

              <div className="h-3 bg-surface-muted rounded-md w-1/4" />
              <div className="h-4 bg-surface-muted rounded-full w-14" />
              <div className="h-3 bg-surface-muted rounded-md w-1/6" />

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-surface-muted" />
                <div className="h-7 w-7 rounded-md bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden p-4 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-surface-muted shrink-0" />
              <div className="space-y-1.5 w-full">
                <div className="h-3.5 bg-surface-muted rounded-md w-1/2" />
                <div className="h-2.5 bg-surface-muted rounded-md w-2/3" />
              </div>
            </div>
            <div className="h-3 bg-surface-muted rounded-md w-full" />
            <div className="pt-2 border-t border-border-subtle flex justify-end gap-2">
              <div className="h-7 w-16 bg-surface-muted rounded-md" />
              <div className="h-7 w-7 bg-surface-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

