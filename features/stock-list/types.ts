import type { StockItem } from "@/lib/api/dummyjson";

export type SortKey =
  "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc";

export type ListState = "ready" | "loading" | "empty" | "error";

export interface StockQueryState {
  items: StockItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  query: string;
  category: string;
  sort: SortKey;
  state: ListState;
  isSearching: boolean;
  categories: Array<{ slug: string; name: string }>;
  errorReference?: string;
  onQueryChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: SortKey) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  retry: () => void;
}
