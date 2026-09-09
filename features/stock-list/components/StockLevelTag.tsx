import React from "react";
import { formatCount, stockLevel, stockLevelLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface StockLevelTagProps {
  stock: number;
  /** Large variant is used on the item detail screen. */
  size?: "sm" | "lg";
  className?: string;
}

export function StockLevelTag({ stock, size = "sm", className }: StockLevelTagProps) {
  const level = stockLevel(stock);
  const tone =
    level === "out"
      ? "border-danger/40 bg-danger-subtle text-danger"
      : level === "low"
        ? "border-warning/40 bg-warning-subtle text-warning"
        : "border-line bg-subtle text-body";

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded border px-2 py-0.5 font-semibold",
        tone,
        size === "lg" ? "text-lg" : "text-sm",
        className
      )}
    >
      <span className="num">{formatCount(stock)}</span>
      <span className={cn("font-medium", size === "lg" ? "text-sm" : "text-meta")}>
        {stockLevelLabel(stock)}
      </span>
    </span>
  );
}
