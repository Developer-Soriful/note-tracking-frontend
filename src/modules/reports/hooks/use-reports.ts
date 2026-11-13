"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { reportsService } from "../services/reports.service";
import { ApiClientError } from "@/lib/api/client";
import type {
  InterestReportItem,
  ReportsPagination,
} from "../types";

export interface UseReportsOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

const DEFAULT_PAGINATION: ReportsPagination = {
  page: 1,
  limit: 10,
  totalInterests: 0,
  totalPages: 0,
};

export function useReports(options: UseReportsOptions = {}) {
  const { initialPage = 1, limit = 10, autoFetch = true } = options;

  const [reports, setReports] = useState<InterestReportItem[]>([]);
  const [pagination, setPagination] =
    useState<ReportsPagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState<number>(initialPage);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Prevents stale asynchronous responses from overwriting newer state
  const fetchSequenceRef = useRef<number>(0);

  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const controller = new AbortController();
    const currentSequence = ++fetchSequenceRef.current;

    async function loadReports() {
      try {
        const response = await reportsService.getUsersByInterest({
          params: { page, limit },
          signal: controller.signal,
        });

        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setReports(response.reports);
          setPagination(response.pagination);
          setError(null);
        }
      } catch (err) {
        if (!isMounted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }

        if (currentSequence === fetchSequenceRef.current) {
          const message =
            err instanceof ApiClientError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Failed to load interest reports";
          setError(message);
        }
      } finally {
        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, limit, autoFetch, reloadTrigger]);

  /**
   * Refetches the current page with a loading indicator.
   */
  const refetch = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  /**
   * Handles user-driven page navigation.
   */
  const changePage = useCallback((newPage: number) => {
    setIsLoading(true);
    setPage(Math.max(1, newPage));
  }, []);

  /**
   * Client-side filtered reports for the currently loaded page.
   * Matches interest name or any user's name/email within the group.
   */
  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return reports;

    return reports.filter((item) => {
      const matchesInterest = item.interest.toLowerCase().includes(query);
      const matchesUser = item.users.some(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      );
      return matchesInterest || matchesUser;
    });
  }, [reports, searchQuery]);

  return {
    reports: filteredReports,
    rawReports: reports,
    pagination,
    page,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered: searchQuery.trim().length > 0,
    changePage,
    refetch,
    clearError: () => setError(null),
  };
}

