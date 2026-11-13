import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReportsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ReportsErrorState({ error, onRetry }: ReportsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-danger-border/40 bg-danger-surface/20 p-8 text-center select-none">
      <div className="h-12 w-12 rounded-xl bg-danger-surface border border-danger-border flex items-center justify-center text-danger mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="text-base font-semibold text-foreground">
        Failed to load interest reports
      </h3>
      <p className="text-xs text-foreground-muted max-w-sm mt-1.5 leading-relaxed">
        {error}
      </p>

      <div className="mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

