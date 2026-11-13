import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-foreground select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-foreground-subtle">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "w-full h-9.5 px-3 rounded-lg border bg-surface text-sm text-foreground placeholder:text-foreground-subtle transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted",
              error
                ? "border-danger focus:ring-danger text-danger"
                : "border-border hover:border-foreground-subtle/50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-foreground-subtle">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-danger font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

