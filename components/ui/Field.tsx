import React from "react";
import { cn } from "@/lib/utils/cn";

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-meta text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-meta font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "h-11 w-full rounded border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-muted transition-colors duration-150 ease-exit hover:border-primary focus:border-primary disabled:bg-subtle disabled:text-muted";

export const inputErrorClasses = "border-danger hover:border-danger focus:border-danger";
