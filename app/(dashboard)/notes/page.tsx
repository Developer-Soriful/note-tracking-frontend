import React from "react";
import type { Metadata } from "next";
import { NotesWorkspace } from "@/modules/notes/components/notes-workspace";

export const metadata: Metadata = {
  title: "Notes — Workspace",
  description: "View and organize your notes.",
};

export default function NotesPage() {
  return <NotesWorkspace />;
}
