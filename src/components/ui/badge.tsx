import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "admin";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-surface-muted text-foreground border-border",
    secondary: "bg-surface-muted/60 text-foreground-muted border-transparent",
    outline: "bg-transparent text-foreground border-border",
    success:
      "bg-success-surface text-success-foreground border-success-border",
    warning:
      "bg-warning-surface text-warning-foreground border-warning-border",
    danger:
      "bg-danger-surface text-danger-foreground border-danger-border",
    admin:
      "bg-primary text-primary-foreground border-primary font-semibold tracking-wide uppercase text-[10px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors select-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

