export const BASE_API_URL = "https://dummyjson.com";

let inMemoryAccessToken: string | null = null;
let sessionExpiredHandlers: Array<() => void> = [];

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function onSessionExpired(handler: () => void): () => void {
  sessionExpiredHandlers.push(handler);
  return () => {
    sessionExpiredHandlers = sessionExpiredHandlers.filter((h) => h !== handler);
  };
}

export function notifySessionExpired(): void {
  sessionExpiredHandlers.forEach((handler) => {
    try {
      handler();
    } catch (e) {
      console.error("Error in session expired handler:", e);
    }
  });
}

// In-session stock overrides to make PUT /products/{id} feel truthful across the session
const stockOverrides = new Map<number, number>();

export function setStockOverride(productId: number, newStock: number): void {
  stockOverrides.set(productId, newStock);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        "clinic_stock_overrides",
        JSON.stringify(Array.from(stockOverrides.entries()))
      );
    } catch {
      // ignore storage errors
    }
  }
}

export function getStockOverride(productId: number): number | undefined {
  if (stockOverrides.size === 0 && typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem("clinic_stock_overrides");
      if (stored) {
        const entries: Array<[number, number]> = JSON.parse(stored);
        entries.forEach(([id, val]) => stockOverrides.set(id, val));
      }
    } catch {
      // ignore storage errors
    }
  }
  return stockOverrides.get(productId);
}

interface ApiFetchOptions extends RequestInit {
  retryOn401?: boolean;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { retryOn401 = true, headers = {}, signal, ...rest } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "Network error: unable to connect to stock service"
    );
  }

  // Auto-refresh token on 401
  if (response.status === 401 && retryOn401) {
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          requestHeaders.set("Authorization", `Bearer ${data.accessToken}`);
          return apiFetch<T>(endpoint, {
            ...options,
            headers: requestHeaders,
            retryOn401: false, // Prevent infinite loop
          });
        }
      }
    } catch {
      // Refresh failed
    }

    // Refresh failed or token permanently expired: trigger SessionExpired modal
    notifySessionExpired();
    throw new Error("Session expired. Please re-authenticate.");
  }

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Use default error message
    }
    const err = new Error(errorMessage);
    (err as unknown as { status: number }).status = response.status;
    throw err;
  }

  return response.json() as Promise<T>;
}
