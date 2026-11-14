"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  PenSquare,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Lock body scroll on mobile when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    logout();
    router.replace("/login");
  };

  const navItems = [
    {
      label: "Notes",
      href: "/notes",
      icon: FileText,
      active: pathname.startsWith("/notes"),
    },
    {
      label: "Posts",
      href: "/posts",
      icon: PenSquare,
      active: pathname.startsWith("/posts"),
    },
    ...(isAdmin
      ? [
          {
            label: "Users",
            href: "/admin/users",
            icon: Users,
            active: pathname.startsWith("/admin/users"),
            badge: "Admin",
          },
          {
            label: "Reports",
            href: "/admin/reports",
            icon: BarChart3,
            active: pathname.startsWith("/admin/reports"),
            badge: "Admin",
          },
        ]
      : []),
  ];

  // Derive user initials safely
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const renderSidebar = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Brand & Main Navigation */}
      <div className="space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href="/notes"
            onClick={onNavigate}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 -ml-1"
          >
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Notes
              </span>
              <span className="text-[10px] text-foreground-subtle -mt-0.5">
                Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
            Overview
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.active
                    ? "bg-surface-muted text-foreground font-medium shadow-2xs"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-muted/60",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-foreground-subtle" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="admin" className="text-[10px] py-0 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Session Controls */}
      <div className="pt-4 border-t border-border-subtle space-y-3">
        {user ? (
          <>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0 select-none">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground truncate">
                      {user.name}
                    </span>
                    {isAdmin && (
                      <Badge variant="admin" className="text-[9px] py-0 px-1">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-foreground-subtle truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              isLoading={isLoggingOut}
              className="w-full justify-start text-xs text-foreground-muted hover:text-danger hover:bg-danger-surface transition-colors"
              leftIcon={!isLoggingOut && <LogOut className="h-3.5 w-3.5" />}
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </>
        ) : (
          <div className="px-2 space-y-2">
            <Link href="/login" className="block w-full">
              <Button variant="primary" size="sm" className="w-full text-xs">
                Sign in
              </Button>
            </Link>
            <Link href="/register" className="block w-full">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-border bg-surface h-full">
        {renderSidebar()}
      </aside>

      {/* Mobile Header Bar */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
          <Link
            href="/notes"
            className="flex items-center gap-2 font-semibold text-sm text-foreground"
          >
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <span>Notes</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Container */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
              className="relative w-4/5 max-w-xs bg-surface border-r border-border h-full flex flex-col z-10 shadow-xl animate-in slide-in-from-left duration-200"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderSidebar(() => setIsMobileMenuOpen(false))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
