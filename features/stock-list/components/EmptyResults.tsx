import React from "react";
import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCategoryName } from "@/lib/utils/categories";

export interface EmptyResultsProps {
  query: string;
  category: string;
  onClearFilters: () => void;
}

export function EmptyResults({ query, category, onClearFilters }: EmptyResultsProps) {
  const filters: string[] = [];
  if (query) filters.push(`“${query}”`);
  if (category && category !== "all") filters.push(formatCategoryName(category));

  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-12 text-center shadow-card">
      <SearchXIcon aria-hidden="true" className="mx-auto h-7 w-7 text-muted" />
      <h2 className="mt-3 text-lg font-semibold text-ink">No items match your filters</h2>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-base text-body">
        {filters.length > 0
          ? `Nothing found for ${filters.join(" in ")}. Check the spelling, or clear the filters to see all items.`
          : "There are no stock items to show."}
      </p>
      <div className="mt-5 flex justify-center">
        <Button variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
