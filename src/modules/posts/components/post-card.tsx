"use client";

import React from "react";
import { Calendar, Eye } from "lucide-react";
import type { PublicPost } from "../types";
import { formatDate } from "../utils/format-date";
import { Badge } from "@/components/ui/badge";

export interface PostCardProps {
  post: PublicPost;
  authorName?: string;
  onView?: (post: PublicPost) => void;
}

export function PostCard({
  post,
  authorName,
  onView,
}: PostCardProps) {
  return (
    <article
      tabIndex={onView ? 0 : undefined}
      onClick={() => onView?.(post)}
      onKeyDown={(e) => {
        if (onView && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onView(post);
        }
      }}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-xs hover:border-foreground-subtle/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none text-left cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground tracking-tight line-clamp-2 break-words">
            {post.title}
          </h3>

          <Badge variant="outline" className="text-[10px] shrink-0 font-normal text-foreground-subtle">
            Published
          </Badge>
        </div>

        {/* Content Preview (Safe plain text rendering) */}
        <p className="text-xs text-foreground-muted leading-relaxed line-clamp-4 break-words whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-foreground-subtle">
        <div className="flex items-center gap-1.5 min-w-0">
          {authorName && (
            <span className="font-medium text-foreground truncate max-w-[120px]">
              {authorName} &bull;
            </span>
          )}
          <Calendar className="h-3 w-3 shrink-0" />
          <time dateTime={post.createdAt} className="truncate">
            {formatDate(post.createdAt)}
          </time>
        </div>

        <div className="flex items-center gap-1 text-foreground-subtle group-hover:text-foreground transition-colors shrink-0">
          <Eye className="h-3 w-3" />
          <span className="text-[11px] font-medium">Read</span>
        </div>
      </div>
    </article>
  );
}
