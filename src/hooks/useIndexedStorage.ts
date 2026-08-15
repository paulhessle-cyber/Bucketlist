import { useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval';

/**
 * Same shape as useLocalStorage, but backed by IndexedDB (localStorage's ~5-10MB
 * quota is easily blown by a handful of embedded photos; IndexedDB has much more
 * headroom). One-time migrates any existing data from the old localStorage key.
 */
export function useIndexedStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dbValue = await get<T>(key);
        if (cancelled) return;
        if (dbValue !== undefined) {
          setValue(dbValue);
          return;
        }
        const raw = window.localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as T;
            setValue(parsed);
            await set(key, parsed);
            window.localStorage.removeItem(key);
          } catch {
            // ignore malformed legacy data
          }
        }
      } finally {
        if (!cancelled) loaded.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    set(key, value).catch(() => {
      // storage unavailable; value still holds for the rest of this session
    });
  }, [key, value]);

  return [value, setValue] as const;
}
