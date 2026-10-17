"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, WifiOffIcon, WifiIcon } from "lucide-react";

type NetworkState = "offline" | "slow" | "online";

interface ConnectionInformation {
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

function isSlowConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: ConnectionInformation }).connection;
  if (!connection) return false;

  return (
    connection.saveData === true ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g" ||
    (connection.rtt ?? 0) >= 800
  );
}

export function NetworkStatusStrip() {
  const [state, setState] = useState<NetworkState>("online");
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    let restoredTimer: ReturnType<typeof setTimeout> | undefined;
    let wasOffline = !navigator.onLine;

    const updateNetworkState = () => {
      const online = navigator.onLine;
      setState(online ? (isSlowConnection() ? "slow" : "online") : "offline");

      if (online && wasOffline) {
        setShowRestored(true);
        restoredTimer = setTimeout(() => setShowRestored(false), 2500);
      }

      wasOffline = !online;
    };

    const connection = (navigator as Navigator & { connection?: ConnectionInformation }).connection;
    window.addEventListener("online", updateNetworkState);
    window.addEventListener("offline", updateNetworkState);
    connection?.addEventListener?.("change", updateNetworkState);
    updateNetworkState();

    return () => {
      window.removeEventListener("online", updateNetworkState);
      window.removeEventListener("offline", updateNetworkState);
      connection?.removeEventListener?.("change", updateNetworkState);
      if (restoredTimer) clearTimeout(restoredTimer);
    };
  }, []);

  if (state === "offline") {
    return (
      <div
        role="status"
        aria-live="assertive"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-danger/30 bg-danger px-4 py-2 text-center text-sm font-medium text-white shadow-pop"
      >
        <span className="inline-flex items-center gap-2">
          <WifiOffIcon aria-hidden="true" className="h-4 w-4" />
          You’re offline. Changes will resume when your connection returns.
        </span>
      </div>
    );
  }

  if (state === "slow") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-warning/30 bg-warning-subtle px-4 py-2 text-center text-sm font-medium text-warning shadow-pop"
      >
        <span className="inline-flex items-center gap-2">
          <WifiIcon aria-hidden="true" className="h-4 w-4" />
          Slow connection. Your request may take a little longer.
        </span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-success/30 bg-success px-4 py-2 text-center text-sm font-medium text-white shadow-pop"
      >
        <span className="inline-flex items-center gap-2">
          <CheckCircle2Icon aria-hidden="true" className="h-4 w-4" />
          You’re back online.
        </span>
      </div>
    );
  }

  return null;
}
