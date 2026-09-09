import React from "react";
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface LoadErrorProps {
  onRetry: () => void;
  retrying?: boolean;
  /** Short technical reference the supplies team can quote to IT. */
  reference?: string;
  message?: string;
}

export function LoadError({
  onRetry,
  retrying = false,
  reference = "STK-504",
  message,
}: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/40 bg-surface px-4 py-10 text-center shadow-card"
    >
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger-subtle">
        <TriangleAlertIcon aria-hidden="true" className="h-5 w-5 text-danger" />
      </span>
      <h2 className="mt-3 text-lg font-semibold text-ink">Couldn’t load stock</h2>
      <p className="mx-auto mt-1.5 max-w-[46ch] text-base text-body">
        {message ||
          "The connection dropped before the list arrived. Your filters are still set — retry when the signal comes back."}
      </p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <Button onClick={onRetry} loading={retrying} loadingLabel="Retrying…">
          <span className="flex items-center gap-2">
            <RefreshCwIcon aria-hidden="true" className="h-4 w-4" />
            Retry
          </span>
        </Button>
        <p className="text-meta text-muted num">Reference {reference}</p>
      </div>
    </div>
  );
}
