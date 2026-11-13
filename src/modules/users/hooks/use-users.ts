"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usersService } from "../services/users.service";
import { ApiClientError } from "@/lib/api/client";
import type {
  CreateUserInput,
  PublicUser,
  UpdateUserInput,
  UsersPagination,
} from "../types";

export interface UseUsersOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

const DEFAULT_PAGINATION: UsersPagination = {
  page: 1,
  limit: 10,
  totalUsers: 0,
  totalPages: 0,
};

export function useUsers(options: UseUsersOptions = {}) {
  const { initialPage = 1, limit = 10, autoFetch = true } = options;

  const [users, setUsers] = useState<PublicUser[]>([]);
  const [pagination, setPagination] =
    useState<UsersPagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState<number>(initialPage);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Prevents stale asynchronous responses from overwriting newer state
  const fetchSequenceRef = useRef<number>(0);

  // Synchronize users data with page, limit, and reloadTrigger
  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const controller = new AbortController();
    const currentSequence = ++fetchSequenceRef.current;

    async function loadUsers() {
      try {
        const response = await usersService.getUsers({
          params: { page, limit },
          signal: controller.signal,
        });

        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setUsers(response.users);
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
                : "Failed to load users";
          setError(message);
        }
      } finally {
        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, limit, autoFetch, reloadTrigger]);

  /**
   * Refetches the current page with loading indicator.
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
   * Creates a user account and resets page to 1 so the new user is visible.
   */
  const createUser = useCallback(
    async (input: CreateUserInput): Promise<PublicUser> => {
      const created = await usersService.createUser(input);
      setIsLoading(true);
      if (page === 1) {
        setReloadTrigger((prev) => prev + 1);
      } else {
        setPage(1);
      }
      return created;
    },
    [page],
  );

  /**
   * Updates an existing user and refreshes the current view.
   */
  const updateUser = useCallback(
    async (userId: string, input: UpdateUserInput): Promise<PublicUser> => {
      const updated = await usersService.updateUser(userId, input);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? updated : u)),
      );
      setReloadTrigger((prev) => prev + 1);
      return updated;
    },
    [],
  );

  /**
   * Deletes a user account.
   * If deleting the last item on page > 1, navigates to the previous page.
   */
  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      await usersService.deleteUser(userId);

      setIsLoading(true);
      if (users.length === 1 && page > 1) {
        setPage((prevPage) => prevPage - 1);
      } else {
        setReloadTrigger((prev) => prev + 1);
      }
    },
    [users.length, page],
  );

  /**
   * Client-side filtered users for the currently loaded page.
   */
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.interests.some((interest) => interest.toLowerCase().includes(query))
      );
    });
  }, [users, searchQuery]);

  return {
    users: filteredUsers,
    rawUsers: users,
    pagination,
    page,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered: searchQuery.trim().length > 0,
    changePage,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    clearError: () => setError(null),
  };
}

