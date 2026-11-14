import React from "react";
import type { Metadata } from "next";
import { PostsWorkspace } from "@/modules/posts/components/posts-workspace";

export const instant = false;

export const metadata: Metadata = {
  title: "Public Posts — Feed",
  description: "Browse articles, updates, and community posts.",
};

export default function PostsPage() {
  return <PostsWorkspace />;
}
