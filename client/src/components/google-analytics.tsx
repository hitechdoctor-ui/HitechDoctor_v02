import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { COOKIE_CONSENT_EVENT } from "@/components/cookie-banner";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "htd_cookie_consent";

function analyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

/** Φόρτωση gtag μόνο μετά αποδοχή cookies ανάλυσης (banner). */
function ensureGtagScript(measurementId: string): void {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(s);
}

/**
 * Google Analytics 4 (G-...). Ορίστε VITE_GA_MEASUREMENT_ID στο build.
 * Το πρώτο-πρόσωπο dashboard μετράει ξεχωριστά μέσω /api/analytics/track.
 */
export function GoogleAnalytics(): null {
  const [location] = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  const initialized = useRef(false);

  useEffect(() => {
    if (!measurementId?.startsWith("G-")) return;

    const tryInit = () => {
      if (!analyticsAllowed() || initialized.current) return;
      ensureGtagScript(measurementId);
      initialized.current = true;
    };

    tryInit();
    const onConsent = (e: Event) => {
      const d = (e as CustomEvent<string>).detail;
      if (d === "accepted") tryInit();
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId?.startsWith("G-")) return;
    if (!analyticsAllowed()) return;
    if (location.startsWith("/admin")) return;
    const path = (location.split("?")[0] || "/").trim() || "/";
    if (typeof window.gtag === "function") {
      window.gtag("config", measurementId, { page_path: path });
    }
  }, [location, measurementId]);

  return null;
}
