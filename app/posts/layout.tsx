import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

function PostsFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background select-none">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-subtle border-t-foreground" />
    </div>
  );
}

export default function PublicPostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PostsFallback />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
