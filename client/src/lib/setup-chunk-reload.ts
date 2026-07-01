import { isStaleChunkError, reloadOnStaleChunkError } from "./lazy-with-reload";

/** Global listeners: stale dynamic-import chunks → one reload (never paint stack traces into #root). */
export function setupChunkReloadHandlers() {
  window.addEventListener(
    "error",
    (event) => {
      const err = event.error ?? event.message;
      if (!isStaleChunkError(err)) return;
      event.preventDefault();
      reloadOnStaleChunkError();
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    if (!isStaleChunkError(event.reason)) return;
    event.preventDefault();
    reloadOnStaleChunkError();
  });
}
