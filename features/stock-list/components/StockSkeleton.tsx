import React from "react";
import { ROW_GRID, StockRowHeader } from "./StockRow";

/** Skeleton rows that mirror the real row geometry, so nothing shifts on load. */
export function StockSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-surface shadow-card"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading stock items</p>
      <StockRowHeader />
      <ul className="animate-pulse">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className={`${ROW_GRID} items-center border-b border-line px-3 py-3 last:border-b-0`}
          >
            <span className="h-11 w-11 rounded bg-subtle sm:h-12 sm:w-12" />
            <span className="min-w-0">
              <span
                className="block h-3.5 rounded bg-subtle"
                style={{ width: `${58 + ((index * 13) % 32)}%` }}
              />
              <span className="mt-2 block h-2.5 w-24 rounded bg-subtle" />
            </span>
            <span className="hidden h-2.5 w-20 rounded bg-subtle sm:block" />
            <span className="h-6 w-20 justify-self-end rounded bg-subtle sm:justify-self-start sm:w-28" />
            <span className="hidden h-3 w-12 justify-self-end rounded bg-subtle sm:block" />
            <span aria-hidden="true" className="hidden sm:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}
