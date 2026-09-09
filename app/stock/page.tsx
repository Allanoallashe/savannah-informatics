"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StockToolbar } from "@/features/stock-list/components/StockToolbar";
import { StockRow, StockRowHeader } from "@/features/stock-list/components/StockRow";
import { StockSkeleton } from "@/features/stock-list/components/StockSkeleton";
import { EmptyResults } from "@/features/stock-list/components/EmptyResults";
import { LoadError } from "@/features/stock-list/components/LoadError";
import { Pagination } from "@/features/stock-list/components/Pagination";
import { SessionExpiredModal } from "@/features/auth/components/SessionExpiredModal";
import { useStockQuery, PAGE_SIZE } from "@/features/stock-list/hooks/useStockQuery";
import { useAuth } from "@/features/auth/context/AuthContext";

function StockListContent() {
  const {
    items,
    total,
    totalPages,
    currentPage,
    query,
    category,
    sort,
    state,
    isSearching,
    categories,
    errorReference,
    onQueryChange,
    onCategoryChange,
    onSortChange,
    onPageChange,
    onClearFilters,
    retry,
  } = useStockQuery();

  const isLoading = state === "loading";
  const isError = state === "error";
  const isEmpty = state === "empty";

  return (
    <AppShell offline={isError}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Stock levels</h1>
            <p className="mt-0.5 text-base text-body">
              {isLoading
                ? "Loading the ward store list…"
                : isError
                  ? "List unavailable — connection issue."
                  : `${total} items in catalogue`}
            </p>
          </div>
          <p className="text-meta text-muted">Tap an item to correct its count</p>
        </div>

        <StockToolbar
          query={query}
          onQueryChange={onQueryChange}
          searching={isSearching}
          category={category}
          onCategoryChange={onCategoryChange}
          sort={sort}
          onSortChange={onSortChange}
          categories={categories}
          disabled={isLoading || isError}
        />

        {isLoading && <StockSkeleton rows={8} />}

        {isError && <LoadError onRetry={retry} reference={errorReference} />}

        {isEmpty && (
          <EmptyResults query={query} category={category} onClearFilters={onClearFilters} />
        )}

        {!isLoading && !isError && !isEmpty && (
          <>
            <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
              <StockRowHeader />
              <ul>
                {items.map((item) => (
                  <StockRow key={item.productId} item={item} />
                ))}
              </ul>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function StockPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isSessionExpired, dismissSessionExpired } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppShell>
        <StockSkeleton rows={8} />
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Suspense
        fallback={
          <AppShell>
            <StockSkeleton rows={8} />
          </AppShell>
        }
      >
        <StockListContent />
      </Suspense>

      {isSessionExpired && <SessionExpiredModal onUnlock={dismissSessionExpired} />}
    </>
  );
}
