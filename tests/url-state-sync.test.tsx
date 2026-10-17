import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStockQuery } from "@/features/stock-list/hooks/useStockQuery";
import * as clientModule from "@/lib/api/client";

let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/stock",
  useSearchParams: () => mockSearchParams,
}));

describe("stock URL state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(clientModule, "apiFetch").mockResolvedValue({
      products: [],
      total: 0,
      skip: 0,
      limit: 15,
    });
  });

  it("restores filters, sorting, and page from a copied URL", () => {
    mockSearchParams = new URLSearchParams("q=powder&category=beauty&sort=price-desc&page=2");
    const { result } = renderHook(() => useStockQuery());

    expect(result.current.query).toBe("powder");
    expect(result.current.category).toBe("beauty");
    expect(result.current.sort).toBe("price-desc");
    expect(result.current.currentPage).toBe(2);
  });

  it("resets the page when changing category or sort", () => {
    mockSearchParams = new URLSearchParams("category=beauty&page=5");
    const { result } = renderHook(() => useStockQuery());

    act(() => result.current.onCategoryChange("fragrances"));
    expect(mockPush).toHaveBeenCalledWith("/stock?category=fragrances", { scroll: false });

    mockSearchParams = new URLSearchParams("sort=name-asc&page=4");
    const rerendered = renderHook(() => useStockQuery());
    act(() => rerendered.result.current.onSortChange("stock-desc"));
    expect(mockPush).toHaveBeenCalledWith("/stock?sort=stock-desc", { scroll: false });
  });
});
