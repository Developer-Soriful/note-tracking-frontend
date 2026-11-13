import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-4 sm:p-6 md:p-8">
      {/* Brand Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto py-2 select-none">
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 -ml-1 transition-opacity hover:opacity-85"
        >
          <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-medium shadow-xs">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Notes
          </span>
        </Link>
        <span className="text-xs text-foreground-subtle hidden sm:inline-block">
          Personal thought workspace
        </span>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-3 text-center text-xs text-foreground-subtle select-none">
        <span>Fast, private, and minimal note-taking.</span>
      </footer>
    </div>
  );
}

