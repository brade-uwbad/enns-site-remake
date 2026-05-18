import { useSyncExternalStore } from "react";

function subscribeStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/** Reads localStorage on the client without hydration mismatches (empty on server). */
export function useLocalStorageValue(key: string, fallback = ""): string {
  return useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(key) ?? fallback,
    () => fallback,
  );
}
