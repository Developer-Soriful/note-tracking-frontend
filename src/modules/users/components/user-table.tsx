"use client";

import React from "react";
import { Edit3, Trash2, Shield, User as UserIcon } from "lucide-react";
import type { PublicUser } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface UserTableProps {
  users: PublicUser[];
  currentUserId?: string;
  onEdit: (user: PublicUser) => void;
  onDelete: (user: PublicUser) => void;
}

export function UserTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
}: UserTableProps) {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle bg-surface-muted/50 text-xs font-semibold text-foreground-subtle select-none">
              <tr>
                <th scope="col" className="py-3 px-4">User</th>
                <th scope="col" className="py-3 px-4">Email</th>
                <th scope="col" className="py-3 px-4">Role</th>
                <th scope="col" className="py-3 px-4">Interests</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.map((u) => {
                const isSelf = Boolean(currentUserId && u.id === currentUserId);
                const isAdmin = u.role === "admin";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-muted/40 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0 select-none">
                          {getInitials(u.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground truncate">
                              {u.name}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded-full bg-primary/10 select-none">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-foreground-subtle truncate">
                            ID: {u.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-xs text-foreground-muted">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {isAdmin ? (
                        <Badge variant="admin" className="gap-1 py-0 px-1.5 text-[10px]">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 py-0 px-1.5 text-[10px] text-foreground-subtle">
                          <UserIcon className="h-3 w-3" />
                          <span>User</span>
                        </Badge>
                      )}
                    </td>

                    {/* Interests */}
                    <td className="py-3 px-4">
                      {u.interests && u.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.interests.slice(0, 3).map((interest, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-muted border border-border text-foreground-muted"
                            >
                              {interest}
                            </span>
                          ))}
                          {u.interests.length > 3 && (
                            <span className="text-[10px] text-foreground-subtle self-center">
                              +{u.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-foreground-subtle italic">
                          None
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(u)}
                          aria-label={`Edit user ${u.name}`}
                          className="h-7 w-7 p-0 text-foreground-muted hover:text-foreground"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(u)}
                          disabled={isSelf}
                          title={isSelf ? "You cannot delete your own account" : undefined}
                          aria-label={
                            isSelf
                              ? "You cannot delete your own account"
                              : `Delete user ${u.name}`
                          }
                          className="h-7 w-7 p-0 text-foreground-muted hover:text-danger hover:bg-danger-surface disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground-muted"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {users.map((u) => {
          const isSelf = Boolean(currentUserId && u.id === currentUserId);
          const isAdmin = u.role === "admin";

          return (
            <div
              key={u.id}
              className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3 select-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                    {getInitials(u.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {u.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded-full bg-primary/10">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-foreground-muted truncate">
                      {u.email}
                    </span>
                  </div>
                </div>

                {isAdmin ? (
                  <Badge variant="admin" className="text-[10px] shrink-0">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] shrink-0 text-foreground-subtle">
                    User
                  </Badge>
                )}
              </div>

              {u.interests && u.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {u.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-muted border border-border text-foreground-muted"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[10px] text-foreground-subtle">
                  ID: {u.id.slice(0, 10)}...
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(u)}
                    leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(u)}
                    disabled={isSelf}
                    className="text-foreground-muted hover:text-danger hover:bg-danger-surface disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

