"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, setStockOverride, getStockOverride } from "@/lib/api/client";
import { DummyJsonProduct, toStockItem, StockItem } from "@/lib/api/dummyjson";
import { SaveState, ItemDetailState } from "../types";

export function useItemDetail(productIdString: string): ItemDetailState {
  const [item, setItem] = useState<StockItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [counted, setCounted] = useState<string>("");
  const [savedCount, setSavedCount] = useState<number>(0);

  const fetchItem = useCallback(async () => {
    if (!productIdString) return;
    setIsLoading(true);
    setIsError(false);

    try {
      const product = await apiFetch<DummyJsonProduct>(`/products/${productIdString}`);
      const override = getStockOverride(product.id);
      const stockItem = toStockItem(product, override);

      setItem(stockItem);
      setSavedCount(stockItem.stock);
      setCounted(String(stockItem.stock));
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [productIdString]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const parsed = Number.parseInt(counted, 10);
  const isValidCount = Number.isFinite(parsed) && parsed >= 0;
  const delta = isValidCount ? parsed - savedCount : 0;

  const stepCount = useCallback(
    (amount: number) => {
      const base = isValidCount ? parsed : savedCount;
      const nextVal = Math.max(0, base + amount);
      setCounted(String(nextVal));
      if (saveState !== "saving") {
        setSaveState("idle");
      }
    },
    [isValidCount, parsed, savedCount, saveState]
  );

  const saveCount = useCallback(async () => {
    if (!isValidCount || !item) return;

    setSaveState("saving");

    try {
      // Call PUT /products/{id} with new stock count
      await apiFetch<DummyJsonProduct>(`/products/${item.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: parsed }),
      });

      // DummyJSON does not persist updates server-side; we record it in our session store
      // so the demo stays coherent across navigation and list reloads.
      setStockOverride(item.productId, parsed);
      setSavedCount(parsed);
      setItem((prev) => (prev ? { ...prev, stock: parsed } : null));
      setSaveState("success");

      setTimeout(() => {
        setSaveState((curr) => (curr === "success" ? "idle" : curr));
      }, 3200);
    } catch (err) {
      console.error("Failed to save stock:", err);
      setSaveState("error");
    }
  }, [isValidCount, item, parsed]);

  const resetSaveState = useCallback(() => {
    setSaveState("idle");
  }, []);

  return {
    item,
    isLoading,
    isError,
    saveState,
    counted,
    savedCount,
    delta,
    isValidCount,
    stepCount,
    setCounted,
    saveCount,
    resetSaveState,
    retryFetch: fetchItem,
  };
}
