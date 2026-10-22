import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Memuat…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
      role="status"
    >
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({ message, onRetry, action }: ErrorStateProps) {
  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Ups, ada kendala</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="flex gap-2">
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
