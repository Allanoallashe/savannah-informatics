"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LockIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, inputClasses, inputErrorClasses } from "@/components/ui/Field";
import { useAuth } from "../context/AuthContext";

interface SessionExpiredModalProps {
  onUnlock?: () => void;
}

/** Overlays the current screen so the user keeps their page, filters and scroll position. */
export function SessionExpiredModal({ onUnlock }: SessionExpiredModalProps) {
  const { user, unlockSession, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setState("submitting");
    setError(null);

    const success = await unlockSession(password);
    setState("idle");

    if (success) {
      onUnlock?.();
    } else {
      setError("Password incorrect. Please check and try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 sm:items-center sm:p-6 backdrop-blur-[2px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-desc"
        className="w-full max-w-[420px] rounded-lg border border-line bg-surface p-4 shadow-pop sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-subtle">
            <LockIcon aria-hidden="true" className="h-4 w-4 text-warning" />
          </span>
          <div>
            <h2 id="session-expired-title" className="text-lg font-semibold text-ink">
              Your session expired
            </h2>
            <p id="session-expired-desc" className="mt-1 text-base text-body">
              Sign in again to carry on. Nothing is lost — your page, filters and any count you were
              editing stay exactly as they are.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded border border-danger/40 bg-danger-subtle p-2.5"
          >
            <TriangleAlertIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Field id="session-username" label="Username">
            <input
              id="session-username"
              value={user?.username || "emilys"}
              readOnly
              className={`${inputClasses} bg-subtle text-body cursor-not-allowed`}
            />
          </Field>
          <Field id="session-password" label="Password" error={error ? error : undefined}>
            <input
              id="session-password"
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className={`${inputClasses} ${error ? inputErrorClasses : ""}`}
            />
          </Field>
          <Button type="submit" block loading={state === "submitting"} loadingLabel="Signing in…">
            Unlock session
          </Button>
          <button
            type="button"
            onClick={logout}
            className="mx-auto rounded text-sm font-medium text-primary hover:underline"
          >
            Sign out instead
          </button>
        </form>
      </motion.div>
    </div>
  );
}
