"use client";

import React, { useState } from "react";
import { UserPlus, Search, X } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useUsers } from "../hooks/use-users";
import type { CreateUserInput, PublicUser, UpdateUserInput } from "../types";
import { UserTable } from "./user-table";
import { UserFormModal } from "./user-form-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { UsersSkeleton } from "./users-skeleton";
import { UsersEmptyState } from "./users-empty-state";
import { UsersErrorState } from "./users-error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

export function UsersWorkspace() {
  const { user } = useAuth();
  const {
    users,
    rawUsers,
    pagination,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isClientFiltered,
    changePage,
    refetch,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({ initialPage: 1, limit: 10 });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<PublicUser | null>(null);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (selectedUser: PublicUser) => {
    setEditingUser(selectedUser);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (selectedUser: PublicUser) => {
    setDeletingUser(selectedUser);
  };

  const handleFormSubmit = async (
    data: CreateUserInput | UpdateUserInput,
  ) => {
    if (editingUser) {
      await updateUser(editingUser.id, data as UpdateUserInput);
    } else {
      await createUser(data as CreateUserInput);
    }
  };

  const handleDeleteConfirm = async (userId: string) => {
    await deleteUser(userId);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Add user
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Filtering */}
      {!isLoading && !error && rawUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              id="users-search-filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter users on this page..."
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear filter"
                    className="p-1 hover:text-foreground text-foreground-subtle cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Explicit client-filter indicator */}
          {isClientFiltered && (
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span>
                Filtered: <strong className="text-foreground">{users.length}</strong> of{" "}
                <strong className="text-foreground">{rawUsers.length}</strong> on this page
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary hover:underline cursor-pointer text-xs"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Area */}
      {isLoading ? (
        <UsersSkeleton count={5} />
      ) : error ? (
        <UsersErrorState error={error} onRetry={refetch} />
      ) : rawUsers.length === 0 ? (
        <UsersEmptyState onCreateUser={handleOpenCreate} />
      ) : users.length === 0 ? (
        <UsersEmptyState
          isSearchFiltered
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <UserTable
          users={users}
          currentUserId={user?.id}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && pagination.totalUsers > 0 && (
        <div className="pt-4 border-t border-border-subtle">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalUsers}
            itemLabel="members"
            onPageChange={changePage}
            disabled={isLoading}
          />
        </div>
      )}

      {/* User Creation / Editing Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialUser={editingUser}
        currentUserId={user?.id}
        onSubmit={handleFormSubmit}
      />

      {/* User Deletion Confirmation Modal */}
      <DeleteUserModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
        currentUserId={user?.id}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

