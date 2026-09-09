"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { StockLevelTag } from "@/features/stock-list/components/StockLevelTag";
import { Button } from "@/components/ui/Button";
import { inputClasses, inputErrorClasses } from "@/components/ui/Field";
import { formatCount, formatPrice } from "@/lib/utils/format";
import { formatCategoryName, getCategoryFallbackImage } from "@/lib/utils/categories";
import { useItemDetail } from "../hooks/useItemDetail";
import { StockSkeleton } from "@/features/stock-list/components/StockSkeleton";
import { LoadError } from "@/features/stock-list/components/LoadError";

interface ItemDetailViewProps {
  id: string;
}

export function ItemDetailView({ id }: ItemDetailViewProps) {
  const {
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
    retryFetch,
  } = useItemDetail(id);

  const [imgSrc, setImgSrc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/stock"
          className="inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Back to stock list
        </Link>
        <StockSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/stock"
          className="inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Back to stock list
        </Link>
        <LoadError
          onRetry={retryFetch}
          message="Could not load the requested stock item. The item may not exist or the network connection dropped."
        />
      </div>
    );
  }

  const displayImage = imgSrc || item.thumbnail || getCategoryFallbackImage(item.category);
  const saving = saveState === "saving";

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    saveCount();
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/stock"
        className="inline-flex w-fit items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
        Back to stock list
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-lg border border-line bg-surface p-3 shadow-card flex items-center justify-center min-h-[300px]">
          <img
            src={displayImage}
            alt={`${item.name}, product photo`}
            onError={() => setImgSrc(getCategoryFallbackImage(item.category))}
            className="aspect-square w-full rounded border border-line object-cover bg-white"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
            <p className="text-meta font-semibold uppercase tracking-wide text-muted">
              {formatCategoryName(item.category)}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{item.name}</h1>
            <p className="mt-1 text-sm text-muted num">
              SKU {item.sku} · {item.location}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-meta font-medium uppercase tracking-wide text-muted">
                  Unit price
                </dt>
                <dd className="mt-1 text-xl font-semibold text-ink num">
                  {formatPrice(item.price)}
                </dd>
              </div>
              <div>
                <dt className="text-meta font-medium uppercase tracking-wide text-muted">
                  Current stock
                </dt>
                <dd className="mt-1">
                  <StockLevelTag stock={savedCount} size="lg" />
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-meta font-medium uppercase tracking-wide text-muted">
                  Stock value
                </dt>
                <dd className="mt-1 text-xl font-semibold text-ink num">
                  {formatPrice(item.price * savedCount)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-line pt-4 text-base text-body">{item.description}</p>
          </div>

          <form
            onSubmit={handleSave}
            className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5"
          >
            <h2 className="text-lg font-semibold text-ink">Correct stock count</h2>
            <p className="mt-1 text-base text-body">
              Enter the number you counted on the shelf. The system currently holds{" "}
              <span className="font-semibold text-ink num">{formatCount(savedCount)}</span>.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="counted" className="text-sm font-semibold text-ink">
                  Counted quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepCount(-1)}
                    disabled={saving}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-line-strong bg-surface text-primary transition-colors duration-150 ease-exit hover:bg-primary-subtle hover:border-primary disabled:text-muted"
                  >
                    <MinusIcon aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">Decrease count</span>
                  </button>
                  <input
                    id="counted"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={counted}
                    disabled={saving}
                    onChange={(event) => setCounted(event.target.value)}
                    aria-invalid={saveState === "error" || !isValidCount ? true : undefined}
                    aria-describedby="counted-status"
                    className={`${inputClasses} w-24 text-center text-lg font-semibold num ${
                      saveState === "error" || !isValidCount ? inputErrorClasses : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => stepCount(1)}
                    disabled={saving}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-line-strong bg-surface text-primary transition-colors duration-150 ease-exit hover:bg-primary-subtle hover:border-primary disabled:text-muted"
                  >
                    <PlusIcon aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">Increase count</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:pb-0.5">
                <Button
                  type="submit"
                  loading={saving}
                  loadingLabel="Saving…"
                  disabled={!isValidCount}
                >
                  Save count
                </Button>
                {saveState === "success" && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-success"
                  >
                    <CheckIcon aria-hidden="true" className="h-4 w-4" />
                    Saved
                  </motion.span>
                )}
              </div>
            </div>

            <p id="counted-status" role="status" className="mt-2 text-meta text-muted">
              {!isValidCount
                ? "Enter a whole number of units, 0 or more."
                : delta === 0
                  ? "Matches the recorded count."
                  : `${delta > 0 ? "+" : "−"}${Math.abs(delta)} against the recorded count.`}
            </p>

            {saveState === "error" && (
              <div
                role="alert"
                className="mt-3 flex flex-col gap-2 rounded border border-danger/40 bg-danger-subtle p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <TriangleAlertIcon
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                  />
                  <div>
                    <p className="text-sm font-semibold text-danger">Count not saved</p>
                    <p className="mt-0.5 text-sm text-body">
                      The connection dropped mid-save. Your entry of{" "}
                      <span className="font-semibold num">{counted}</span> is still here — retry to
                      send it again.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={resetSaveState} className="shrink-0">
                  <span className="flex items-center gap-1.5">
                    <RefreshCwIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Retry save
                  </span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <AnimatePresence>
        {saveState === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-none fixed inset-x-3 bottom-3 z-40 sm:left-auto sm:right-6 sm:w-[340px]"
          >
            <p
              role="status"
              className="flex items-center gap-2 rounded border border-success/40 bg-success-subtle px-3 py-2.5 text-sm font-medium text-ink shadow-pop"
            >
              <CheckIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
              Stock count updated to{" "}
              <span className="font-semibold num">{formatCount(savedCount)}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
