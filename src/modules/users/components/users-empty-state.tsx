import React from "react";
import { UserX, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UsersEmptyStateProps {
  isSearchFiltered?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreateUser?: () => void;
}

export function UsersEmptyState({
  isSearchFiltered = false,
  searchQuery = "",
  onClearSearch,
  onCreateUser,
}: UsersEmptyStateProps) {
  if (isSearchFiltered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/40 select-none">
        <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
          <UserX className="h-6 w-6" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          No matching members found
        </h3>
        <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
          No registered accounts on this page matched your filter &ldquo;{searchQuery}&rdquo;.
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
        <Users className="h-6 w-6" />
      </div>

      <h2 className="text-base font-semibold text-foreground">
        No users found
      </h2>
      <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
        There are currently no additional registered members in this application.
      </p>

      {onCreateUser && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateUser}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Create first member
          </Button>
        </div>
      )}
    </div>
  );
}

