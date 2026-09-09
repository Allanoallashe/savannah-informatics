"use client";

import React, { useState } from "react";
import { BoxesIcon, TriangleAlertIcon, KeyRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, inputClasses, inputErrorClasses } from "@/components/ui/Field";
import { useAuth } from "../context/AuthContext";

export function SignInForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login({
        username: username.trim(),
        password,
        expiresInMins: 1, // Short token lifetime per assessment spec
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid username or password. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleFillDemo() {
    setUsername("emilys");
    setPassword("emilyspass");
    setError(null);
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center gap-2">
            <BoxesIcon aria-hidden="true" className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-ink">Clinic Stock</h1>
          </div>
          <p className="mt-1.5 text-base text-body">
            Sign in with your clinic account to view and correct stock levels.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5 rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5"
          >
            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded border border-danger/40 bg-danger-subtle p-3"
              >
                <TriangleAlertIcon
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                />
                <div>
                  <p className="text-sm font-semibold text-danger">Couldn’t sign you in</p>
                  <p className="mt-0.5 text-sm text-body">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Field id="username" label="Username">
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-invalid={error ? true : undefined}
                  className={`${inputClasses} ${error ? inputErrorClasses : ""}`}
                />
              </Field>

              <Field id="password" label="Password">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  aria-invalid={error ? true : undefined}
                  className={`${inputClasses} ${error ? inputErrorClasses : ""}`}
                />
              </Field>

              <Button type="submit" block loading={submitting} loadingLabel="Signing in…">
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between rounded border border-line bg-subtle/60 px-3 py-2 text-meta text-muted">
            <span>DummyJSON Demo: emilys / emilyspass</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <KeyRoundIcon className="h-3.5 w-3.5" />
              Auto-fill
            </button>
          </div>

          <p className="mt-4 text-meta text-muted">
            Trouble signing in? Contact the supplies office on ext. 2140.
          </p>
        </div>
      </div>
    </div>
  );
}
