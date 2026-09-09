import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  list.forEach((p, index) => {
    if (index > 0 && p - (list[index - 1] as number) > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label="Stock list pages"
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-body">
        Showing <span className="font-semibold text-ink num">{first}</span>–
        <span className="font-semibold text-ink num">{last}</span> of{" "}
        <span className="font-semibold text-ink num">{totalItems}</span> items
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-10 items-center gap-1 rounded border border-line-strong bg-surface px-2.5 text-sm font-medium text-primary transition-colors duration-150 ease-exit hover:bg-primary-subtle hover:border-primary disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-surface"
        >
          <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <ul className="flex items-center gap-1">
          {pageWindow(page, totalPages).map((entry, index) =>
            entry === "gap" ? (
              <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-muted">
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  onClick={() => onPageChange(entry)}
                  aria-current={entry === page ? "page" : undefined}
                  className={cn(
                    "h-10 min-w-[40px] rounded border px-2 text-sm font-semibold num transition-colors duration-150 ease-exit",
                    entry === page
                      ? "border-primary bg-primary text-white"
                      : "border-line-strong bg-surface text-primary hover:bg-primary-subtle hover:border-primary"
                  )}
                >
                  {entry}
                  <span className="sr-only">{entry === page ? " (current page)" : ""}</span>
                </button>
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-10 items-center gap-1 rounded border border-line-strong bg-surface px-2.5 text-sm font-medium text-primary transition-colors duration-150 ease-exit hover:bg-primary-subtle hover:border-primary disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-surface"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
