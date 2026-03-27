import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const CHUNK_RELOAD_ONCE = "hitech_chunk_reload_pending";

function isStaleChunkError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err);
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk")
  );
}

/**
 * Λειτουργεί όπως το `lazy()` αλλά αν αποτύχει το φόρτωμα chunk (π.χ. μετά από deploy
 * το hash `eshop-XXXX.js` δεν υπάρχει πλέον), κάνει **ένα** πλήρες reload ώστε
 * να ξαναφορτωθεί το `index.html` με τα νέα assets.
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await importer();
      sessionStorage.removeItem(CHUNK_RELOAD_ONCE);
      return mod;
    } catch (err) {
      if (isStaleChunkError(err) && !sessionStorage.getItem(CHUNK_RELOAD_ONCE)) {
        sessionStorage.setItem(CHUNK_RELOAD_ONCE, "1");
        window.location.reload();
        return new Promise(() => {}) as Promise<{ default: T }>;
      }
      sessionStorage.removeItem(CHUNK_RELOAD_ONCE);
      throw err;
    }
  });
}
