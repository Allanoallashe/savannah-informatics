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

describe("search debounce and request cancellation", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  it("debounces rapid typing before updating URL state", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStockQuery());

    act(() => {
      result.current.onQueryChange("c");
      result.current.onQueryChange("ca");
      result.current.onQueryChange("cat");
    });

    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(mockPush).toHaveBeenCalledWith("/stock?q=cat", { scroll: false });
    vi.useRealTimers();
  });

  it("aborts an older request when the URL query changes", () => {
    let firstAbortSignal: AbortSignal | undefined;

    vi.spyOn(clientModule, "apiFetch").mockImplementation(async (endpoint, options) => {
      if (endpoint.includes("/categories")) {
        return [{ slug: "beauty", name: "Beauty", url: "" }];
      }

      if (endpoint.includes("q=old")) {
        firstAbortSignal = options?.signal ?? undefined;
        return new Promise(() => {});
      }

      return { products: [], total: 0, skip: 0, limit: 15 };
    });

    mockSearchParams = new URLSearchParams("q=old");
    const { rerender } = renderHook(() => useStockQuery());

    mockSearchParams = new URLSearchParams("q=new");
    rerender();

    expect(firstAbortSignal?.aborted).toBe(true);
  });
});
