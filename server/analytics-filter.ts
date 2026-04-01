import type { SQL } from "drizzle-orm";
import { and, ilike, inArray, isNull, not, or } from "drizzle-orm";
import { siteAnalytics } from "@shared/schema";

/**
 * Comma-separated IPv4/IPv6 στη Railway: ANALYTICS_EXCLUDE_IPS=1.2.3.4,2001:db8::1
 * Δεν μετράει (ingest + dashboard) επισκέψεις από αυτές τις IP.
 */
export function parseAnalyticsExcludedIps(): string[] {
  const raw = process.env.ANALYTICS_EXCLUDE_IPS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((ip) => (ip.startsWith("::ffff:") ? ip.slice(7) : ip));
}

function parseExtraUaSubstrings(): string[] {
  const raw = process.env.ANALYTICS_EXCLUDE_UA_SUBSTRINGS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Υπο-συμβολοσειρές User-Agent που αγνοούμε (bots / health checks). Απενεργοποίηση: ANALYTICS_DISABLE_UA_BOT_FILTER=1 */
export function analyticsExcludedUaSubstrings(): string[] {
  const extra = parseExtraUaSubstrings();
  if (process.env.ANALYTICS_DISABLE_UA_BOT_FILTER === "1") {
    return extra;
  }
  const defaults = [
    "railway",
    "go-http-client",
    "kube-probe",
    "googlehc",
    "okhttp",
    "healthcheck",
    "pingdom",
    "uptimerobot",
  ];
  return [...defaults, ...extra];
}

function uaMatchesExcluded(ua: string | null): boolean {
  if (!ua || !ua.trim()) return false;
  const lower = ua.toLowerCase();
  return analyticsExcludedUaSubstrings().some((sub) => lower.includes(sub));
}

function ipMatchesExcluded(ip: string | null): boolean {
  if (!ip || !ip.trim()) return false;
  const normalized = ip.startsWith("::ffff:") ? ip.slice(7) : ip.trim();
  const set = parseAnalyticsExcludedIps();
  return set.some((ex) => ex === normalized);
}

/** Αν true, δεν αποθηκεύουμε εγγραφή (και το API επιστρέφει 204). */
export function shouldSkipAnalyticsTrack(ip: string | null, userAgent: string | null): boolean {
  return ipMatchesExcluded(ip) || uaMatchesExcluded(userAgent);
}

/**
 * Φίλτρο για αναφορές dashboard: εξαιρεί IP από env και γνωστά bot/probe UA.
 * Γραμμές χωρίς client_ip (παλιά δεδομένα) παραμένουν — μόνο όσες ταιριάζουν σε UA εξαιρούνται.
 */
export function siteAnalyticsDashboardFilter(): SQL | undefined {
  const ips = parseAnalyticsExcludedIps();
  const uaSubs = analyticsExcludedUaSubstrings();
  const parts: SQL[] = [];

  if (ips.length > 0) {
    parts.push(
      or(isNull(siteAnalytics.clientIp), not(inArray(siteAnalytics.clientIp, ips))) as SQL
    );
  }
  for (const sub of uaSubs) {
    if (!sub) continue;
    const pattern = `%${sub}%`;
    parts.push(
      or(isNull(siteAnalytics.userAgent), not(ilike(siteAnalytics.userAgent, pattern))) as SQL
    );
  }

  if (parts.length === 0) return undefined;
  return and(...parts) as SQL;
}
