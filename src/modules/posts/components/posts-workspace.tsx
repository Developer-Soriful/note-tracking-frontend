"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, UserCheck, X } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { usePosts } from "../hooks/use-posts";
import type { CreatePostInput, PublicPost } from "../types";
import { PostCard } from "./post-card";
import { PostFormModal } from "./post-form-modal";
import { PostViewModal } from "./post-view-modal";
import { PostsSkeleton } from "./posts-skeleton";
import { PostsEmptyState } from "./posts-empty-state";
import { PostsErrorState } from "./posts-error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

export function PostsWorkspace() {
  const { user, isAuthenticated } = useAuth();
  const {
    posts,
    rawPosts,
    pagination,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterUserId,
    setFilterUserId,
    activeAuthorName,
    isClientFiltered,
    changePage,
    refetch,
    createPost,
  } = usePosts({ initialPage: 1, limit: 10 });

  // Modal control states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<PublicPost | null>(null);
  const [userIdInput, setUserIdInput] = useState("");

  const handleOpenCreate = () => {
    setIsFormModalOpen(true);
  };

  const handleOpenView = (post: PublicPost) => {
    setViewingPost(post);
  };

  const handleFormSubmit = async (data: CreatePostInput) => {
    await createPost(data);
  };

  const handleApplyUserFilter = (e?: React.FormEvent) => {
    e?.preventDefault();
    changePage(1);
    setFilterUserId(userIdInput.trim() || null);
  };

  const handleClearUserFilter = () => {
    setUserIdInput("");
    changePage(1);
    setFilterUserId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Public Posts
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Public Feed
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Articles and thoughts published by community members. Visible to everyone.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New Post
            </Button>
          ) : (
            <Link href="/login?next=/posts">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Sign in to post
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* User Lookup & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface/50">
        <form onSubmit={handleApplyUserFilter} className="flex items-center gap-2 flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Filter by User ID ($lookup)..."
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="h-8.5 text-xs font-mono"
            aria-label="Filter posts by user ID"
          />
          <Button type="submit" variant="outline" size="sm" className="h-8.5 text-xs shrink-0">
            Lookup
          </Button>
          {filterUserId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearUserFilter}
              className="h-8.5 text-xs text-foreground-muted shrink-0"
            >
              Show All
            </Button>
          )}
        </form>

        {filterUserId && (
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            <span>
              Showing posts by:{" "}
              <strong className="text-foreground">
                {activeAuthorName || filterUserId}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Search and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with clear button */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-subtle pointer-events-none" />
          <Input
            type="text"
            placeholder="Search posts on this page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
            aria-label="Filter posts by title or content"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Clear search filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Live Counter */}
        <div className="flex items-center gap-2 text-xs text-foreground-muted self-end sm:self-center">
          {isClientFiltered && (
            <span className="text-foreground font-medium">
              Showing {posts.length} of {rawPosts.length} on page &bull;
            </span>
          )}
          <span>
            {pagination.totalPosts}{" "}
            {pagination.totalPosts === 1 ? "post" : "posts"} total
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <PostsSkeleton count={6} />
      ) : error ? (
        <PostsErrorState error={error} onRetry={refetch} />
      ) : posts.length === 0 ? (
        <PostsEmptyState
          isSearchFiltered={isClientFiltered || Boolean(filterUserId)}
          searchQuery={searchQuery}
          onClearSearch={() => {
            setSearchQuery("");
            if (filterUserId) handleClearUserFilter();
          }}
          onCreatePost={isAuthenticated ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="space-y-6">
          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                authorName={post.authorName || activeAuthorName || undefined}
                onView={handleOpenView}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-2 border-t border-border-subtle">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalPosts}
                itemLabel="posts"
                onPageChange={changePage}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {isAuthenticated && (
        <PostFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* View Post Modal */}
      <PostViewModal
        isOpen={Boolean(viewingPost)}
        onClose={() => setViewingPost(null)}
        post={viewingPost}
        authorName={viewingPost?.authorName || activeAuthorName || user?.name}
      />
    </div>
  );
}

