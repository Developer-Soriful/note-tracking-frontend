"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeOnBackdrop?: boolean;
}

// Selector for focusable elements per WAI-ARIA authoring practices
const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contentEditable="true"]:not([tabindex="-1"])',
].join(",");

function isHiddenOrInert(el: HTMLElement): boolean {
  if (el.closest("[inert], [aria-hidden='true']")) {
    return true;
  }
  if ("inert" in el && (el as { inert?: boolean }).inert) {
    return true;
  }
  return false;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return elements.filter((el) => {
    return (
      !el.hasAttribute("disabled") &&
      !isHiddenOrInert(el) &&
      el.getClientRects().length > 0 &&
      window.getComputedStyle(el).visibility !== "hidden"
    );
  });
}

// Module-scoped active modal stack to coordinate focus across nested or concurrent modals
const activeModalStack: HTMLElement[] = [];

function registerModal(element: HTMLElement) {
  const index = activeModalStack.indexOf(element);
  if (index === -1) {
    activeModalStack.push(element);
  }
}

function unregisterModal(element: HTMLElement) {
  const index = activeModalStack.lastIndexOf(element);
  if (index !== -1) {
    activeModalStack.splice(index, 1);
  }
}

function isTopModal(element: HTMLElement | null): boolean {
  if (!element || activeModalStack.length === 0) return false;
  return activeModalStack[activeModalStack.length - 1] === element;
}

// Minimal shared body scroll lock manager safe for multiple concurrent instances
let openModalsCount = 0;
let originalBodyOverflow = "";

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (openModalsCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openModalsCount++;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  openModalsCount = Math.max(0, openModalsCount - 1);
  if (openModalsCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
  }
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

  // Keep a stable ref to onClose to avoid re-triggering the lifecycle effect on parent re-renders
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Unique IDs for dialog labeling
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    const dialogEl = dialogRef.current;
    if (dialogEl) {
      registerModal(dialogEl);
    }

    lockBodyScroll();

    // Capture the element that had focus prior to the modal opening
    if (document.activeElement instanceof HTMLElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    // Initial focus placement inside the dialog
    const frameId = requestAnimationFrame(() => {
      if (!dialogRef.current) return;

      // Only the topmost active modal sets initial focus
      if (!isTopModal(dialogRef.current)) return;

      // Do not steal focus if an element inside already has focus (e.g., via autoFocus)
      if (dialogRef.current.contains(document.activeElement)) return;

      const bodyFocusable = bodyRef.current
        ? getFocusableElements(bodyRef.current)
        : [];
      const allFocusable = getFocusableElements(dialogRef.current);

      if (bodyFocusable.length > 0) {
        bodyFocusable[0].focus();
      } else if (allFocusable.length > 0) {
        allFocusable[0].focus();
      } else {
        dialogRef.current.focus();
      }
    });

    // Keyboard handlers: Escape to close, Tab / Shift+Tab for focus trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only the topmost active modal handles keyboard containment
      if (!dialogRef.current || !isTopModal(dialogRef.current)) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        const focusable = getFocusableElements(dialogRef.current);

        if (focusable.length === 0) {
          e.preventDefault();
          dialogRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isAtContainer = document.activeElement === dialogRef.current;
        const isOutside = !dialogRef.current.contains(document.activeElement);

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            isAtContainer ||
            isOutside
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (
            document.activeElement === last ||
            isAtContainer ||
            isOutside
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Contain focus if focus inadvertently escapes the dialog container
    const handleFocusIn = (e: FocusEvent) => {
      // Only the topmost active modal enforces containment
      if (!dialogRef.current || !isTopModal(dialogRef.current)) return;

      if (
        e.target instanceof Node &&
        !dialogRef.current.contains(e.target)
      ) {
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      unlockBodyScroll();

      if (dialogEl) {
        unregisterModal(dialogEl);
      }

      // Restore focus to the initiating element if it is still connected to the DOM
      const prevElement = previousActiveElementRef.current;
      if (
        prevElement &&
        prevElement.isConnected &&
        typeof prevElement.focus === "function"
      ) {
        const topModal =
          activeModalStack.length > 0
            ? activeModalStack[activeModalStack.length - 1]
            : null;
        // Do not steal focus if an active modal is still open, unless prevElement is inside that modal
        const shouldRestore =
          !topModal || (topModal && topModal.contains(prevElement));

        if (shouldRestore) {
          prevElement.focus();
        }
      }
      previousActiveElementRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-2xl border border-border bg-surface text-foreground shadow-xl transition-all animate-in fade-in-0 zoom-in-95 duration-200 outline-none",
          maxWidths[maxWidth],
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border-subtle">
          <div className="flex flex-col gap-1 pr-6">
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descriptionId}
                className="text-xs text-foreground-muted leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="p-6 max-h-[calc(85vh-160px)] overflow-y-auto"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border-subtle bg-surface-muted/30 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

