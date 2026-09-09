import type { StockItem } from "@/lib/api/dummyjson";

export type SaveState = "idle" | "saving" | "success" | "error";

export interface ItemDetailState {
  item: StockItem | null;
  isLoading: boolean;
  isError: boolean;
  saveState: SaveState;
  counted: string;
  savedCount: number;
  delta: number;
  isValidCount: boolean;
  stepCount: (amount: number) => void;
  setCounted: (val: string) => void;
  saveCount: () => Promise<void>;
  resetSaveState: () => void;
  retryFetch: () => void;
}
