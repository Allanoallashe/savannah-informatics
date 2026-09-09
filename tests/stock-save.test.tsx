import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useItemDetail } from "@/features/item-detail/hooks/useItemDetail";
import * as clientModule from "@/lib/api/client";

describe("Stock Save: success, optimistic update and 500 error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles successful stock save and optimistic session update", async () => {
    const apiFetchSpy = vi.spyOn(clientModule, "apiFetch");

    // Mock initial GET /products/1
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

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.item?.name).toBe("Essence Mascara");
    expect(result.current.savedCount).toBe(50);
    expect(result.current.counted).toBe("50");

    // Increment count by 5 (+5)
    act(() => {
      result.current.stepCount(5);
    });

    expect(result.current.counted).toBe("55");
    expect(result.current.delta).toBe(5);

    // Mock PUT /products/1 response
    apiFetchSpy.mockResolvedValueOnce({
      id: 1,
      title: "Essence Mascara",
      stock: 55,
    });

    // Trigger save
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
    expect(result.current.delta).toBe(0);
  });

  it("handles 500 API failure, captures error state and preserves user input", async () => {
    const apiFetchSpy = vi.spyOn(clientModule, "apiFetch");

    // Mock initial GET /products/2
    apiFetchSpy.mockResolvedValueOnce({
      id: 2,
      title: "Eyeshadow Palette",
      description: "Palette with mirror",
      category: "beauty",
      price: 19.99,
      discountPercentage: 15,
      rating: 4.0,
      stock: 30,
      images: [],
      thumbnail: "https://example.com/palette.jpg",
    });

    const { result } = renderHook(() => useItemDetail("2"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // User updates count manually to 42
    act(() => {
      result.current.setCounted("42");
    });

    expect(result.current.counted).toBe("42");

    // Mock PUT failure (500 Server Error)
    apiFetchSpy.mockRejectedValueOnce(new Error("HTTP error 500"));

    await act(async () => {
      await result.current.saveCount();
    });

    // Verification: Save state is error, but the user's uncommitted count is preserved
    expect(result.current.saveState).toBe("error");
    expect(result.current.counted).toBe("42");
    expect(result.current.savedCount).toBe(30); // system count remains unchanged
  });
});
