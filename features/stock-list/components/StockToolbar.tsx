import React from "react";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import type { SortKey } from "../types";
import { formatCategoryName } from "@/lib/utils/categories";

export interface StockToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searching: boolean;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  categories: Array<{ slug: string; name: string }>;
  disabled?: boolean;
}

const selectClasses =
  "h-11 w-full rounded border border-line-strong bg-surface px-2.5 text-base text-ink transition-colors duration-150 ease-exit hover:border-primary focus:border-primary disabled:bg-subtle disabled:text-muted";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "stock-asc", label: "Stock (lowest first)" },
  { value: "stock-desc", label: "Stock (highest first)" },
  { value: "price-asc", label: "Price (lowest first)" },
  { value: "price-desc", label: "Price (highest first)" },
];

export function StockToolbar({
  query,
  onQueryChange,
  searching,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
  disabled = false,
}: StockToolbarProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 shadow-card sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1.5 sm:flex-1">
          <label htmlFor="stock-search" className="text-sm font-semibold text-ink">
            Search items
          </label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />

            <input
              id="stock-search"
              type="search"
              value={query}
              disabled={disabled}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by product name or SKU"
              aria-describedby="stock-search-status"
              className="h-11 w-full rounded border border-line-strong bg-surface pl-9 pr-24 text-base text-ink placeholder:text-muted transition-colors duration-150 ease-exit hover:border-primary focus:border-primary disabled:bg-subtle disabled:text-muted"
            />

            {query.length > 0 && !searching && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors duration-150 ease-exit hover:bg-subtle hover:text-ink"
              >
                <XIcon aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}

            {searching && (
              <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-meta font-medium text-muted bg-surface/90 px-1.5 py-0.5 rounded">
                <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                Searching…
              </span>
            )}
          </div>
          <p id="stock-search-status" role="status" className="sr-only">
            {searching ? "Searching stock items" : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-[420px] sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="stock-category" className="text-sm font-semibold text-ink">
              Category
            </label>
            <select
              id="stock-category"
              value={category}
              disabled={disabled}
              onChange={(event) => onCategoryChange(event.target.value)}
              className={selectClasses}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name || formatCategoryName(cat.slug)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="stock-sort" className="text-sm font-semibold text-ink">
              Sort by
            </label>
            <select
              id="stock-sort"
              value={sort}
              disabled={disabled}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
              className={selectClasses}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
