import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStockQuery } from "@/features/stock-list/hooks/useStockQuery";
import * as clientModule from "@/lib/api/client";

// Mock Next.js navigation hooks
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

describe("Search debounce and AbortController race condition protection", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  it("debounces rapid user keystrokes before updating search params", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useStockQuery());

    // Simulate fast typing: "c" -> "ca" -> "cat"
    act(() => {
      result.current.onQueryChange("c");
    });
    expect(result.current.query).toBe("c");
    expect(result.current.isSearching).toBe(true);

    act(() => {
      result.current.onQueryChange("ca");
    });
    expect(result.current.query).toBe("ca");

    act(() => {
      result.current.onQueryChange("cat");
    });
    expect(result.current.query).toBe("cat");

    // No navigation push should have happened yet
    expect(mockPush).not.toHaveBeenCalled();

    // Fast-forward past debounce timer (400ms)
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Debounce settled: router.push should be called with ?q=cat
    expect(mockPush).toHaveBeenCalledWith("/stock?q=cat", { scroll: false });
    expect(result.current.isSearching).toBe(false);

    vi.useRealTimers();
  });

  it("aborts earlier in-flight requests when a newer query is initiated", async () => {
    let firstAbortSignal: AbortSignal | undefined;

    vi.spyOn(clientModule, "apiFetch").mockImplementation(async (endpoint, options) => {
      if (endpoint.includes("/categories")) {
        return [{ slug: "beauty", name: "Beauty", url: "" }];
      }

      if (endpoint.includes("q=old")) {
        firstAbortSignal = options?.signal ?? undefined;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              products: [
                { id: 1, title: "Old Stale Mascara", category: "beauty", price: 10, stock: 5 },
              ],
              total: 1,
              skip: 0,
              limit: 15,
            });
          }, 2000);
        });
      }

      return {
        products: [{ id: 2, title: "New Lipstick", category: "beauty", price: 15, stock: 20 }],
        total: 1,
        skip: 0,
        limit: 15,
      };
    });

    // Render hook with query = "old"
    mockSearchParams = new URLSearchParams("q=old");
    const { rerender } = renderHook(() => useStockQuery());

    // Re-render with new query "new"
    mockSearchParams = new URLSearchParams("q=new");
    rerender();

    // Verify that the first request's signal was aborted
    expect(firstAbortSignal?.aborted).toBe(true);
  });
});
