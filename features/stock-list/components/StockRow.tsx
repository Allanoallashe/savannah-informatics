"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import type { StockItem } from "@/lib/api/dummyjson";
import { formatPrice } from "@/lib/utils/format";
import { formatCategoryName, getCategoryFallbackImage } from "@/lib/utils/categories";
import { StockLevelTag } from "./StockLevelTag";

export const ROW_GRID =
  "grid grid-cols-[44px_minmax(0,1fr)_auto] gap-3 sm:grid-cols-[48px_minmax(0,1fr)_150px_160px_96px_20px] sm:gap-4";

export function StockRowHeader() {
  return (
    <div
      className={`${ROW_GRID} hidden border-b border-line bg-subtle px-3 py-2 text-meta font-semibold uppercase tracking-wide text-muted sm:grid`}
    >
      <span aria-hidden="true" />
      <span>Item</span>
      <span>Category</span>
      <span>Stock</span>
      <span className="text-right">Price</span>
      <span aria-hidden="true" />
    </div>
  );
}

export function StockRow({ item }: { item: StockItem }) {
  const [imgSrc, setImgSrc] = useState(item.thumbnail);

  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={`/stock/item/${item.productId}`}
        className={`${ROW_GRID} items-center px-3 py-3 transition-colors duration-150 ease-exit hover:bg-primary-subtle`}
      >
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgSrc(getCategoryFallbackImage(item.category))}
          className="h-11 w-11 rounded border border-line object-cover sm:h-12 sm:w-12 bg-white"
        />

        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-ink">{item.name}</span>
          <span className="mt-0.5 block text-meta text-muted num">
            {item.sku}
            <span className="sm:hidden"> · {formatCategoryName(item.category)}</span>
          </span>
          <span className="mt-1 block text-sm font-semibold text-ink num sm:hidden">
            {formatPrice(item.price)}
          </span>
        </span>

        <span className="hidden text-sm text-body sm:block truncate">
          {formatCategoryName(item.category)}
        </span>

        <span className="justify-self-end sm:justify-self-start">
          <StockLevelTag stock={item.stock} />
        </span>

        <span className="hidden text-right text-base font-semibold text-ink num sm:block">
          {formatPrice(item.price)}
        </span>

        <ChevronRightIcon aria-hidden="true" className="hidden h-5 w-5 text-muted sm:block" />
      </Link>
    </li>
  );
}
