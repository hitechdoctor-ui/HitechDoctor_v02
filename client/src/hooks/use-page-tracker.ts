import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { getAnalyticsSessionId } from "@/lib/analytics-session";
import { useAuth } from "@/hooks/use-auth";

function isAutomatedBrowser(): boolean {
  try {
    if (typeof navigator === "undefined") return true;
    // Headless / WebDriver — όχι πραγματικός επισκέπτης
    if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  } catch {
    return true;
  }
  return false;
}

function sendPageViewBeacon(payload: {
  sessionId: string;
  pagePath: string;
  referrer: string | null;
}): void {
  const body = JSON.stringify(payload);
  try {
    // Prefer sendBeacon ώστε να μετράμε μόνο όταν υπάρχει πραγματικό browser session
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/track", blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Client-side pageview: στέλνει beacon στο `/api/analytics/track` σε κάθε αλλαγή
 * δημόσιας διαδρομής μετά το mount του SPA (μόνο πραγματικοί browsers).
 * Δεν καταγράφει admin UI, συνδεδεμένους χρήστες, ή automated browsers.
 * Το API κάνει επιπλέον bot UA filtering (defense in depth).
 */
export function usePageTracker(): void {
  const [loc] = useLocation();
  const { user } = useAuth();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (loc.startsWith("/admin")) return;
    if (user != null) return;
    if (isAutomatedBrowser()) return;

    const pathOnly = (loc.split("?")[0] || "/").trim() || "/";
    if (pathOnly === lastSent.current) return;
    lastSent.current = pathOnly;

    const sessionId = getAnalyticsSessionId();
    let referrer: string | null = null;
    try {
      referrer = typeof document !== "undefined" && document.referrer ? document.referrer : null;
    } catch {
      referrer = null;
    }

    sendPageViewBeacon({
      sessionId,
      pagePath: pathOnly.slice(0, 2048),
      referrer: referrer ? referrer.slice(0, 2048) : null,
    });
  }, [loc, user]);
}
