export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(stock: number): StockLevel {
  if (stock === 0) return "out";
  if (stock <= 12) return "low";
  return "ok";
}

export function stockLevelLabel(stock: number): string {
  const level = stockLevel(stock);
  if (level === "out") return "Out of stock";
  if (level === "low") return "Low stock";
  return "In stock";
}
