"use client";

import React from "react";
import { Calendar, User } from "lucide-react";
import type { PublicPost } from "../types";
import { formatDate } from "../utils/format-date";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PostViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PublicPost | null;
  authorName?: string;
}

export function PostViewModal({
  isOpen,
  onClose,
  post,
  authorName,
}: PostViewModalProps) {
  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.title}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-border-subtle text-xs text-foreground-subtle">
          {authorName && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{authorName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.createdAt}>
              Published {formatDate(post.createdAt)}
            </time>
          </div>

          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal ml-auto">
            Public Post
          </Badge>
        </div>

        {/* Full Post Content (Safe text rendering) */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto pr-2">
          {post.content}
        </div>
      </div>
    </Modal>
  );
}

