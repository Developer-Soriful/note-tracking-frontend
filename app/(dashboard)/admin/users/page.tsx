import React from "react";
import type { Metadata } from "next";
import { RoleGuard } from "@/lib/auth/role-guard";
import { UsersWorkspace } from "@/modules/users/components/users-workspace";

export const metadata: Metadata = {
  title: "User Management — Admin Workspace",
  description: "Manage workspace members and system permissions.",
};

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <UsersWorkspace />
    </RoleGuard>
  );
}
