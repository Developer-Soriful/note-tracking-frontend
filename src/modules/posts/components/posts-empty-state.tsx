import React from "react";
import { PenSquare, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PostsEmptyStateProps {
  isSearchFiltered?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreatePost?: () => void;
}

export function PostsEmptyState({
  isSearchFiltered = false,
  searchQuery = "",
  onClearSearch,
  onCreatePost,
}: PostsEmptyStateProps) {
  if (isSearchFiltered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/40 select-none">
        <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
          <SearchX className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          No matching posts found
        </h3>
        <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
          No posts on this page matched your filter &ldquo;{searchQuery}&rdquo;.
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
        <PenSquare className="h-6 w-6" />
      </div>

      <h2 className="text-base font-semibold text-foreground">
        No posts published yet
      </h2>
      <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
        You haven&apos;t published any posts yet. Share articles, release notes, or updates with your organization.
      </p>

      {onCreatePost && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreatePost}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Your First Post
          </Button>
        </div>
      )}
    </div>
  );
}

