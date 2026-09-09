"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { apiFetch, getStockOverride } from "@/lib/api/client";
import {
  DummyJsonProduct,
  DummyJsonProductsResponse,
  DummyJsonCategory,
  toStockItem,
  StockItem,
} from "@/lib/api/dummyjson";
import { SortKey, ListState, StockQueryState } from "../types";

export const PAGE_SIZE = 15;

function parseSortParam(sortParam: string | null): SortKey {
  const validSorts: SortKey[] = [
    "name-asc",
    "name-desc",
    "price-asc",
    "price-desc",
    "stock-asc",
    "stock-desc",
  ];
  return validSorts.includes(sortParam as SortKey) ? (sortParam as SortKey) : "name-asc";
}

function mapSortToDummyJson(sort: SortKey): { sortBy: string; order: "asc" | "desc" } {
  switch (sort) {
    case "name-desc":
      return { sortBy: "title", order: "desc" };
    case "price-asc":
      return { sortBy: "price", order: "asc" };
    case "price-desc":
      return { sortBy: "price", order: "desc" };
    case "stock-asc":
      return { sortBy: "stock", order: "asc" };
    case "stock-desc":
      return { sortBy: "stock", order: "desc" };
    default:
      return { sortBy: "title", order: "asc" };
  }
}

function sortProductsLocally(items: StockItem[], sort: SortKey): StockItem[] {
  const list = [...items];
  switch (sort) {
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "stock-asc":
      return list.sort((a, b) => a.stock - b.stock);
    case "stock-desc":
      return list.sort((a, b) => b.stock - a.stock);
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function useStockQuery(): StockQueryState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params
  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "all";
  const urlSort = parseSortParam(searchParams.get("sort"));
  const urlPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const simError = searchParams.get("simError"); // Supports testing against /http/500

  // Local state for immediate typing responsiveness
  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [items, setItems] = useState<StockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<ListState>("loading");
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [errorReference, setErrorReference] = useState<string | undefined>(undefined);

  // Keep track of inflight fetch abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local inputQuery if URL changed externally (e.g. browser back/forward or clear filters)
  useEffect(() => {
    setInputQuery(urlQuery);
  }, [urlQuery]);

  // Load categories once
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const raw = await apiFetch<Array<DummyJsonCategory | string>>("/products/categories");
        if (mounted && Array.isArray(raw)) {
          const formatted = raw.map((c) =>
            typeof c === "string" ? { slug: c, name: c } : { slug: c.slug, name: c.name || c.slug }
          );
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Update URL search parameters helper
  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          (key === "category" && value === "all") ||
          (key === "page" && value === 1)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce search query changes
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setInputQuery(newQuery);
      setIsDebouncing(true);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        // Updating search resets page to 1
        updateUrlParams({ q: newQuery.trim(), page: 1 });
      }, 400);
    },
    [updateUrlParams]
  );

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      // Changing category resets page to 1
      updateUrlParams({ category: newCategory, page: 1 });
    },
    [updateUrlParams]
  );

  const handleSortChange = useCallback(
    (newSort: SortKey) => {
      // Changing sort resets page to 1
      updateUrlParams({ sort: newSort, page: 1 });
    },
    [updateUrlParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateUrlParams({ page: newPage });
    },
    [updateUrlParams]
  );

  const handleClearFilters = useCallback(() => {
    setInputQuery("");
    updateUrlParams({ q: null, category: null, sort: null, page: 1 });
  }, [updateUrlParams]);

  // Main data fetching effect with AbortController for race-condition prevention
  const fetchData = useCallback(async () => {
    // Abort any existing in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState("loading");
    setErrorReference(undefined);

    try {
      // Check for simulated 500 error test path
      if (simError === "500") {
        await apiFetch("https://dummyjson.com/http/500", { signal: controller.signal });
      }

      const { sortBy, order } = mapSortToDummyJson(urlSort);
      const skip = (urlPage - 1) * PAGE_SIZE;

      let fetchedProducts: DummyJsonProduct[] = [];
      let totalCount = 0;

      if (urlQuery.trim() && urlCategory !== "all") {
        // Limitation workaround: DummyJSON /products/search does not filter by category.
        // Fetch all search matches for the query and filter locally.
        const res = await apiFetch<DummyJsonProductsResponse>(
          `/products/search?q=${encodeURIComponent(urlQuery.trim())}&limit=0`,
          { signal: controller.signal }
        );

        const categoryMatches = res.products.filter(
          (p) => p.category.toLowerCase() === urlCategory.toLowerCase()
        );

        totalCount = categoryMatches.length;

        // Apply local sort and slice page
        const mapped = categoryMatches.map((p) => toStockItem(p, getStockOverride(p.id)));
        const sorted = sortProductsLocally(mapped, urlSort);
        const paginated = sorted.slice(skip, skip + PAGE_SIZE);

        if (!controller.signal.aborted) {
          setItems(paginated);
          setTotal(totalCount);
          setState(paginated.length === 0 ? "empty" : "ready");
        }
        return;
      } else if (urlQuery.trim()) {
        // Query only
        const endpoint = `/products/search?q=${encodeURIComponent(
          urlQuery.trim()
        )}&limit=${PAGE_SIZE}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
        const res = await apiFetch<DummyJsonProductsResponse>(endpoint, {
          signal: controller.signal,
        });
        fetchedProducts = res.products;
        totalCount = res.total;
      } else if (urlCategory !== "all") {
        // Category only
        const endpoint = `/products/category/${encodeURIComponent(
          urlCategory
        )}?limit=${PAGE_SIZE}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
        const res = await apiFetch<DummyJsonProductsResponse>(endpoint, {
          signal: controller.signal,
        });
        fetchedProducts = res.products;
        totalCount = res.total;
      } else {
        // Default list
        const endpoint = `/products?limit=${PAGE_SIZE}&skip=${skip}&sortBy=${sortBy}&order=${order}`;
        const res = await apiFetch<DummyJsonProductsResponse>(endpoint, {
          signal: controller.signal,
        });
        fetchedProducts = res.products;
        totalCount = res.total;
      }

      if (!controller.signal.aborted) {
        const mapped = fetchedProducts.map((p) => toStockItem(p, getStockOverride(p.id)));
        setItems(mapped);
        setTotal(totalCount);
        setState(mapped.length === 0 ? "empty" : "ready");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Request was aborted by newer request; ignore completely
        return;
      }
      if (!controller.signal.aborted) {
        console.error("Stock query failed:", err);
        setErrorReference(`ERR-${Math.floor(100 + Math.random() * 900)}`);
        setState("error");
      }
    }
  }, [urlCategory, urlPage, urlQuery, urlSort, simError]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData]);

  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : Math.max(1, urlPage);
  const currentPage = Math.min(urlPage, totalPages);

  return {
    items,
    total,
    totalPages,
    currentPage,
    query: inputQuery,
    category: urlCategory,
    sort: urlSort,
    state,
    isSearching: isDebouncing,
    categories,
    errorReference,
    onQueryChange: handleQueryChange,
    onCategoryChange: handleCategoryChange,
    onSortChange: handleSortChange,
    onPageChange: handlePageChange,
    onClearFilters: handleClearFilters,
    retry: fetchData,
  };
}
