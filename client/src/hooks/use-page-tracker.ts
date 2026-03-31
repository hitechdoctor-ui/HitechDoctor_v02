import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { getAnalyticsSessionId } from "@/lib/analytics-session";

/**
 * Στέλνει POST στο `/api/analytics/track` σε κάθε αλλαγή δημόσιας διαδρομής (όχι admin).
 */
export function usePageTracker(): void {
  const [loc] = useLocation();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (loc.startsWith("/admin")) return;
    const pathOnly = (loc.split("?")[0] || "/").trim() || "/";
    if (pathOnly === lastSent.current) return;
    lastSent.current = pathOnly;

    const sessionId = getAnalyticsSessionId();
    let referrer: string | undefined;
    try {
      referrer = typeof document !== "undefined" ? document.referrer : undefined;
    } catch {
      referrer = undefined;
    }

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        pagePath: pathOnly.slice(0, 2048),
        referrer: referrer ? referrer.slice(0, 2048) : null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [loc]);
}
