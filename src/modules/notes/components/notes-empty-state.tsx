import React from "react";
import { FileText, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NotesEmptyStateProps {
  isSearchFiltered?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreateNote?: () => void;
}

export function NotesEmptyState({
  isSearchFiltered = false,
  searchQuery = "",
  onClearSearch,
  onCreateNote,
}: NotesEmptyStateProps) {
  if (isSearchFiltered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/40 select-none">
        <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
          <SearchX className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          No matching notes found
        </h3>
        <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
          No notes on this page matched your filter &ldquo;{searchQuery}&rdquo;.
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
        <FileText className="h-6 w-6" />
      </div>

      <h2 className="text-base font-semibold text-foreground">
        No notes yet
      </h2>
      <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
        Your personal workspace is ready. Create your first note to capture
        meeting takeaways, engineering notes, or project tasks.
      </p>

      {onCreateNote && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateNote}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create first note
          </Button>
        </div>
      )}
    </div>
  );
}

