import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStockQuery } from "@/features/stock-list/hooks/useStockQuery";
import * as clientModule from "@/lib/api/client";

let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => "/stock",
  useSearchParams: () => mockSearchParams,
}));

describe("URL state restoration and deep-linking synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(clientModule, "apiFetch").mockResolvedValue({
      products: [],
      total: 0,
      skip: 0,
      limit: 15,
    });
  });

  it("restores search, category, sort and page from URL search parameters on reload", () => {
    mockSearchParams = new URLSearchParams("q=powder&category=beauty&sort=price-desc&page=2");

    const { result } = renderHook(() => useStockQuery());

    expect(result.current.query).toBe("powder");
    expect(result.current.category).toBe("beauty");
    expect(result.current.sort).toBe("price-desc");
    expect(result.current.currentPage).toBe(2);
  });

  it("resets page to 1 when changing category filter so user is not stranded on an empty page", () => {
    mockSearchParams = new URLSearchParams("category=beauty&page=5");

    const { result } = renderHook(() => useStockQuery());

    act(() => {
      result.current.onCategoryChange("fragrances");
    });

    // Expect page parameter to be reset to 1
    expect(mockPush).toHaveBeenCalledWith("/stock?category=fragrances", { scroll: false });
  });

  it("resets page to 1 when changing sort order", () => {
    mockSearchParams = new URLSearchParams("sort=name-asc&page=4");

    const { result } = renderHook(() => useStockQuery());

    act(() => {
      result.current.onSortChange("stock-desc");
    });

    expect(mockPush).toHaveBeenCalledWith("/stock?sort=stock-desc", { scroll: false });
  });

  it("clears all search and filter parameters when clearing filters", () => {
    mockSearchParams = new URLSearchParams("q=ointment&category=beauty&sort=price-desc&page=3");

    const { result } = renderHook(() => useStockQuery());

    act(() => {
      result.current.onClearFilters();
    });

    expect(mockPush).toHaveBeenCalledWith("/stock", { scroll: false });
  });
});
