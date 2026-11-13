import React from "react";
import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Notes — Workspace",
  description: "View and organize your notes.",
};

export default function NotesPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notes
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Capture, organize, and structure your personal notes.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New note
          </Button>
        </div>
      </div>

      {/* Empty State Workspace */}
      <div className="flex flex-col items-center justify-center min-h-[380px] rounded-2xl border border-dashed border-border p-8 text-center bg-surface/50">
        <div className="h-12 w-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-foreground-subtle mb-4">
          <FileText className="h-6 w-6" />
        </div>

        <h2 className="text-base font-semibold text-foreground">
          No notes yet
        </h2>
        <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
          Your workspace is ready. Create your first note to capture meeting
          summaries, architecture designs, or quick thoughts.
        </p>

        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create first note
          </Button>
        </div>
      </div>
    </div>
  );
}

