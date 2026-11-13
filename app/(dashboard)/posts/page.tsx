import React from "react";
import type { Metadata } from "next";
import { PostsWorkspace } from "@/modules/posts/components/posts-workspace";

export const metadata: Metadata = {
  title: "Posts — Feed",
  description: "View and publish articles and updates.",
};

export default function PostsPage() {
  return <PostsWorkspace />;
}

