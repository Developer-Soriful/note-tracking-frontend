import React from "react";
import { Tag, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReportsEmptyStateProps {
  isSearchFiltered?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function ReportsEmptyState({
  isSearchFiltered = false,
  searchQuery = "",
  onClearSearch,
}: ReportsEmptyStateProps) {
  if (isSearchFiltered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/40 select-none">
        <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
          <SearchX className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          No matching reports found
        </h3>
        <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
          No interest cohorts or members on this page matched your filter &ldquo;{searchQuery}&rdquo;.
        </p>

        {onClearSearch && (
          <div className="mt-6">
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear Filter
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/50 select-none">
      <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
        <Tag className="h-6 w-6" />
      </div>

      <h2 className="text-base font-semibold text-foreground">
        No user interests recorded
      </h2>
      <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
        No members have selected interests on their profiles yet. When users configure interest tags during registration or profile updates, aggregated cohort reports will appear here.
      </p>
    </div>
  );
}

