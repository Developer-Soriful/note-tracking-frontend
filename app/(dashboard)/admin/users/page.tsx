import React from "react";
import type { Metadata } from "next";
import { Users, Shield } from "lucide-react";
import { RoleGuard } from "@/lib/auth/role-guard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "User Management — Admin Workspace",
  description: "Manage workspace members and system permissions.",
};

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                User Management
              </h1>
              <Badge variant="admin">System Admin</Badge>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Review workspace members, active accounts, and administrative access.
            </p>
          </div>
        </div>

        {/* Administrative Shell Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="h-8 w-8 rounded-lg bg-surface-muted flex items-center justify-center text-foreground-subtle">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold">User Directory</h2>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Administrative overview of registered workspace accounts. Member listing,
              role assignments, and account status management are enabled for administrative personnel.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-foreground">
              <div className="h-8 w-8 rounded-lg bg-surface-muted flex items-center justify-center text-foreground-subtle">
                <Shield className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold">Access & Permissions</h2>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Role-based access controls. Users maintain standard note creation and viewing
              rights, while administrators retain system oversight and user administration privileges.
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
