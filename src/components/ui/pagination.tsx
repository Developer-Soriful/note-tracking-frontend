import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  itemLabel?: string;
  onPageChange: (newPage: number) => void;
  className?: string;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  itemLabel = "items",
  onPageChange,
  className,
  disabled = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const canGoPrev = page > 1 && !disabled;
  const canGoNext = page < safeTotalPages && !disabled;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-4 py-3 select-none", className)}
    >
      <div className="text-xs text-foreground-muted">
        {totalItems !== undefined ? (
          <span>
            Showing page <strong className="font-medium text-foreground">{page}</strong> of{" "}
            <strong className="font-medium text-foreground">{safeTotalPages}</strong>{" "}
            ({totalItems} {itemLabel})
          </span>
        ) : (
          <span>
            Page <strong className="font-medium text-foreground">{page}</strong> of{" "}
            <strong className="font-medium text-foreground">{safeTotalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          aria-label="Previous page"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

