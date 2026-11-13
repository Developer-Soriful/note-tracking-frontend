"use client";

import React from "react";
import { Search, X, RefreshCw } from "lucide-react";
import { useReports } from "../hooks/use-reports";
import { InterestReportCard } from "./interest-report-card";
import { ReportsSkeleton } from "./reports-skeleton";
import { ReportsEmptyState } from "./reports-empty-state";
import { ReportsErrorState } from "./reports-error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

export function ReportsWorkspace() {
  const {
    reports,
    rawReports,
    pagination,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered,
    changePage,
    refetch,
  } = useReports({ initialPage: 1, limit: 10 });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Interest Reports
            </h1>
            <Badge variant="admin" className="text-[10px] py-0 px-1.5 font-normal">
              Admin Only
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Aggregated member cohorts grouped by shared interest topics across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with clear button */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle pointer-events-none" />
          <Input
            type="text"
            placeholder="Filter interests or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
            aria-label="Filter interest reports by topic or member name"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 text-xs text-foreground-muted self-end sm:self-center">
          {isClientFiltered && (
            <span className="text-foreground font-medium">
              Showing {reports.length} of {rawReports.length} on page &bull;
            </span>
          )}
          <span>
            {pagination.totalInterests}{" "}
            {pagination.totalInterests === 1 ? "interest topic" : "interest topics"} total
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <ReportsSkeleton count={4} />
      ) : error ? (
        <ReportsErrorState error={error} onRetry={refetch} />
      ) : reports.length === 0 ? (
        <ReportsEmptyState
          isSearchFiltered={isClientFiltered}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <div className="space-y-4">
          {/* Grouped Interest Cards */}
          <div className="space-y-4">
            {reports.map((item) => (
              <InterestReportCard key={item.interest} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-border-subtle">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalInterests}
                itemLabel="interest topics"
                onPageChange={changePage}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

