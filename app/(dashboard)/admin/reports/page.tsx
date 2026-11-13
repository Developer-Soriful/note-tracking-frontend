import React from "react";
import type { Metadata } from "next";
import { RoleGuard } from "@/lib/auth/role-guard";
import { ReportsWorkspace } from "@/modules/reports/components/reports-workspace";

export const metadata: Metadata = {
  title: "Interest Reports — Admin Workspace",
  description: "Aggregated user interest reports and cohort analytics.",
};

export default function AdminReportsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ReportsWorkspace />
    </RoleGuard>
  );
}

