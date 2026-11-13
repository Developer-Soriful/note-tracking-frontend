"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { postsService } from "../services/posts.service";
import { ApiClientError } from "@/lib/api/client";
import type {
  CreatePostInput,
  PostsPagination,
  PublicPost,
} from "../types";

export interface UsePostsOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

const DEFAULT_PAGINATION: PostsPagination = {
  page: 1,
  limit: 10,
  totalPosts: 0,
  totalPages: 0,
};

export function usePosts(options: UsePostsOptions = {}) {
  const { initialPage = 1, limit = 10, autoFetch = true } = options;
  const { user } = useAuth();
  const userId = user?.id;

  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [pagination, setPagination] =
    useState<PostsPagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState<number>(initialPage);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Prevents stale asynchronous responses from overwriting newer state
  const fetchSequenceRef = useRef<number>(0);

  // Synchronize posts data with current user, page, limit, and reloadTrigger
  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const controller = new AbortController();
    const currentSequence = ++fetchSequenceRef.current;

    async function loadPosts() {
      if (!userId) {
        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await postsService.getPostsByUser(userId, {
          params: { page, limit },
          signal: controller.signal,
        });

        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setPosts(response.posts);
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
                : "Failed to load posts";
          setError(message);
        }
      } finally {
        if (isMounted && currentSequence === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId, page, limit, autoFetch, reloadTrigger]);

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
   * Creates a post and navigates to page 1 so the newest post appears first.
   */
  const createPost = useCallback(
    async (input: CreatePostInput): Promise<PublicPost> => {
      const created = await postsService.createPost(input);
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
   * Client-side filtered posts for the currently loaded page.
   */
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    });
  }, [posts, searchQuery]);

  return {
    posts: filteredPosts,
    rawPosts: posts,
    pagination,
    page,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered: searchQuery.trim().length > 0,
    changePage,
    refetch,
    createPost,
    clearError: () => setError(null),
  };
}
