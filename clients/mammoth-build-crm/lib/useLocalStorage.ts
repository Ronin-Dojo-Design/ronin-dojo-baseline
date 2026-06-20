"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe localStorage hook. Reads happen in an effect (never during render/SSR),
 * so the server and first client paint agree, then we hydrate from storage.
 *
 * Returns [value, setValue, hydrated] — `hydrated` lets callers avoid flashing
 * empty state before localStorage has been read.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Corrupt or unavailable storage — fall back to the initial value.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Quota exceeded or unavailable — keep in-memory state regardless.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated];
}
