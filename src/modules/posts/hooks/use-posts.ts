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
  initialUserId?: string | null;
}

const DEFAULT_PAGINATION: PostsPagination = {
  page: 1,
  limit: 10,
  totalPosts: 0,
  totalPages: 0,
};

export function usePosts(options: UsePostsOptions = {}) {
  const {
    initialPage = 1,
    limit = 10,
    autoFetch = true,
    initialUserId = null,
  } = options;
  const { user } = useAuth();

  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [filterUserId, setFilterUserId] = useState<string | null>(initialUserId);
  const [activeAuthorName, setActiveAuthorName] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PostsPagination>(DEFAULT_PAGINATION);
  const [page, setPage] = useState<number>(initialPage);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Prevents stale asynchronous responses from overwriting newer state
  const fetchSequenceRef = useRef<number>(0);

  // Synchronize posts data with filterUserId, page, limit, and reloadTrigger
  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const controller = new AbortController();
    const currentSequence = ++fetchSequenceRef.current;
    setIsLoading(true);

    async function loadPosts() {
      try {
        if (filterUserId && filterUserId.trim().length > 0) {
          // Scenario 2: $lookup aggregation by specific user ID
          const response = await postsService.getPostsByUser(filterUserId.trim(), {
            params: { page, limit },
            signal: controller.signal,
          });

          if (isMounted && currentSequence === fetchSequenceRef.current) {
            setPosts(response.posts);
            setActiveAuthorName(response.user.name);
            setPagination(response.pagination);
            setError(null);
          }
        } else {
          // Public global feed of all posts across all users
          const response = await postsService.getAllPosts({
            params: { page, limit },
            signal: controller.signal,
          });

          if (isMounted && currentSequence === fetchSequenceRef.current) {
            setPosts(response.posts);
            setActiveAuthorName(null);
            setPagination(response.pagination);
            setError(null);
          }
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
  }, [filterUserId, page, limit, autoFetch, reloadTrigger]);

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
    filterUserId,
    setFilterUserId,
    activeAuthorName,
    isClientFiltered: searchQuery.trim().length > 0,
    changePage,
    refetch,
    createPost,
    clearError: () => setError(null),
  };
}
