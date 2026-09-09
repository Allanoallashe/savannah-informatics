"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthUser, LoginCredentials } from "../types";
import { setAccessToken, onSessionExpired } from "@/lib/api/client";

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  unlockSession: (password: string) => Promise<boolean>;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Sync token to API client
  const updateToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setAccessToken(token);
  }, []);

  // Listen to 401 session expiration from API client
  useEffect(() => {
    const cleanup = onSessionExpired(() => {
      setIsSessionExpired(true);
    });
    return cleanup;
  }, []);

  // On initial mount, attempt silent refresh via httpOnly cookie
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.accessToken) {
            updateToken(data.accessToken);

            // Fetch current user
            const meRes = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${data.accessToken}` },
            });
            if (meRes.ok) {
              const userData = await meRes.json();
              if (mounted) setUser(userData);
            }
          }
        }
      } catch {
        // Not authenticated
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [updateToken]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            expiresInMins: credentials.expiresInMins ?? 1,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to sign in");
        }

        updateToken(data.accessToken);
        setUser(data.user);
        setIsSessionExpired(false);
        router.push("/stock");
      } finally {
        setIsLoading(false);
      }
    },
    [router, updateToken]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    updateToken(null);
    setUser(null);
    setIsSessionExpired(false);
    router.push("/login");
  }, [router, updateToken]);

  const unlockSession = useCallback(
    async (password: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            password,
            expiresInMins: 1,
          }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        updateToken(data.accessToken);
        setUser(data.user);
        setIsSessionExpired(false);
        return true;
      } catch {
        return false;
      }
    },
    [user, updateToken]
  );

  const dismissSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isAuthenticated: !!accessTokenState && !!user,
        isLoading,
        isSessionExpired,
        login,
        logout,
        unlockSession,
        dismissSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
