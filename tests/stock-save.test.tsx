import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useItemDetail } from "@/features/item-detail/hooks/useItemDetail";
import * as clientModule from "@/lib/api/client";

describe("stock correction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves a corrected stock count and updates the session override", async () => {
    const apiFetchSpy = vi.spyOn(clientModule, "apiFetch");
    apiFetchSpy.mockResolvedValueOnce({
      id: 1,
      title: "Essence Mascara",
      description: "Volumizing mascara",
      category: "beauty",
      price: 9.99,
      discountPercentage: 10,
      rating: 4.5,
      stock: 50,
      images: [],
      thumbnail: "https://example.com/mascara.jpg",
    });

    const { result } = renderHook(() => useItemDetail("1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.stepCount(5));
    apiFetchSpy.mockResolvedValueOnce({ id: 1, title: "Essence Mascara", stock: 55 });

    await act(async () => {
      await result.current.saveCount();
    });

    expect(apiFetchSpy).toHaveBeenCalledWith("/products/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: 55 }),
    });
    expect(result.current.saveState).toBe("success");
    expect(result.current.savedCount).toBe(55);
  });

  it("preserves the user's draft when saving fails", async () => {
    const apiFetchSpy = vi.spyOn(clientModule, "apiFetch");
    apiFetchSpy.mockResolvedValueOnce({
      id: 2,
      title: "Eyeshadow Palette",
      description: "Palette with mirror",
      category: "beauty",
      price: 19.99,
      discountPercentage: 15,
      rating: 4,
      stock: 30,
      images: [],
      thumbnail: "https://example.com/palette.jpg",
    });

    const { result } = renderHook(() => useItemDetail("2"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setCounted("42"));
    apiFetchSpy.mockRejectedValueOnce(new Error("HTTP error 500"));

    await act(async () => {
      await result.current.saveCount();
    });

    expect(result.current.saveState).toBe("error");
    expect(result.current.counted).toBe("42");
    expect(result.current.savedCount).toBe(30);
  });
});
