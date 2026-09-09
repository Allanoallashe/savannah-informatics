"use client";

import React from "react";
import Link from "next/link";
import { BoxesIcon, LogOutIcon, WifiOffIcon } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

interface AppShellProps {
  /** Shown in the header as the current context, e.g. "Ward 4 tablet". */
  offline?: boolean;
  children: React.ReactNode;
}

export function AppShell({ offline = false, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const username = user?.username || "j.okafor";

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-3 px-4 sm:px-6">
          <Link
            href="/stock"
            className="flex items-center gap-2 rounded text-ink transition-colors duration-150 ease-exit hover:text-primary"
          >
            <BoxesIcon aria-hidden="true" className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">Clinic Stock</span>
          </Link>

          <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
          <p className="hidden text-sm text-muted sm:block">Ward 4 · Supplies</p>

          <div className="ml-auto flex items-center gap-2">
            {offline && (
              <span className="flex items-center gap-1.5 rounded border border-warning/40 bg-warning-subtle px-2 py-1 text-meta font-medium text-warning">
                <WifiOffIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Weak signal
              </span>
            )}
            <span className="hidden text-sm text-body sm:block">{username}</span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded border border-line-strong bg-surface px-2.5 py-1.5 text-sm font-medium text-primary transition-colors duration-150 ease-exit hover:bg-primary-subtle hover:border-primary"
            >
              <LogOutIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-5 sm:px-6 sm:py-6">
        {children}
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-meta text-muted sm:px-6">
          <span>Clinic Stock · internal use only</span>
          <span>Savannah Informatics Engineering Assessment</span>
        </div>
      </footer>
    </div>
  );
}
