"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ItemDetailView } from "@/features/item-detail/components/ItemDetailView";
import { SessionExpiredModal } from "@/features/auth/components/SessionExpiredModal";
import { StockSkeleton } from "@/features/stock-list/components/StockSkeleton";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
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
        <StockSkeleton rows={4} />
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell>
      <ItemDetailView id={resolvedParams.id} />
      {isSessionExpired && <SessionExpiredModal onUnlock={dismissSessionExpired} />}
    </AppShell>
  );
}
