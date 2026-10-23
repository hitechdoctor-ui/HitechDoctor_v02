import type { SQL } from "drizzle-orm";
import { and, ilike, inArray, isNull, not, or, sql } from "drizzle-orm";
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

/**
 * Γνωστά bots / crawlers / AI scrapers / uptime & health probes.
 * Case-insensitive substring match στο User-Agent.
 * Κρατάμε συγκεκριμένα tokens (όχι γενικό "bot") για λιγότερα false positives.
 */
export const DEFAULT_ANALYTICS_BOT_UA_SUBSTRINGS: readonly string[] = [
  // Search crawlers
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "yandex.com/bots",
  "applebot",
  "seznambot",
  "exabot",
  // SEO / site auditors
  "ahrefs",
  "semrush",
  "majestic",
  "dotbot",
  "mj12bot",
  "rogerbot",
  "screaming frog",
  "seobility",
  "serpstat",
  "dataforseo",
  // AI / LLM scrapers
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "anthropic-ai",
  "claude-web",
  "ccbot",
  "bytespider",
  "perplexitybot",
  "perplexity",
  "meta-externalagent",
  "meta-externalfetcher",
  "amazonbot",
  "cohere-ai",
  "diffbot",
  "img2dataset",
  // Social / link preview fetchers (όχι πραγματικοί επισκέπτες)
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "pinterest",
  "embedly",
  "quora link preview",
  "vkshare",
  // Uptime / synthetic monitors
  "uptimerobot",
  "pingdom",
  "statuscake",
  "site24x7",
  "betteruptime",
  "better stack",
  "healthcheck",
  "health-check",
  "nodeping",
  "freshping",
  "monitoringservice",
  // Cloud / PaaS probes
  "kube-probe",
  "googlehc",
  "google-apps-script",
  "amazon-route53",
  "cloudflare-healthchecks",
  "cloudflare-traffic-manager",
  "railway",
  "render/",
  "fly.io",
  "digitalocean uptime",
  // Headless / automation / HTTP clients
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
  "cypress",
  "go-http-client",
  "python-requests",
  "python-urllib",
  "aiohttp",
  "httpx",
  "libwww-perl",
  "scrapy",
  "okhttp",
  "curl/",
  "wget",
  "httpie",
  "java/",
  "apache-httpclient",
  "node-fetch",
  "undici",
  // Generic crawler markers (σχετικά ασφαλή)
  "bot/",
  "bot;",
  "spider",
  "crawler",
  "crawl/",
];

/** Υπο-συμβολοσειρές User-Agent που αγνοούμε. Απενεργοποίηση defaults: ANALYTICS_DISABLE_UA_BOT_FILTER=1 */
export function analyticsExcludedUaSubstrings(): string[] {
  const extra = parseExtraUaSubstrings();
  if (process.env.ANALYTICS_DISABLE_UA_BOT_FILTER === "1") {
    return extra;
  }
  return [...DEFAULT_ANALYTICS_BOT_UA_SUBSTRINGS, ...extra];
}

/** True αν το UA ταιριάζει σε γνωστό bot/crawler (ή extra env substrings). */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) return false;
  const lower = userAgent.toLowerCase();
  return analyticsExcludedUaSubstrings().some((sub) => lower.includes(sub));
}

function ipMatchesExcluded(ip: string | null): boolean {
  if (!ip || !ip.trim()) return false;
  const normalized = ip.startsWith("::ffff:") ? ip.slice(7) : ip.trim();
  const set = parseAnalyticsExcludedIps();
  return set.some((ex) => ex === normalized);
}

/**
 * Αν true, δεν αποθηκεύουμε εγγραφή (και το API επιστρέφει 204).
 * - excluded IP (env)
 * - missing/blank UA (άμεσο API hit χωρίς browser)
 * - bot/crawler UA denylist
 * - προαιρετικά: μη-Ελλάδα όταν ANALYTICS_GREECE_ONLY=1 και υπάρχει country code
 */
export function shouldSkipAnalyticsTrack(
  ip: string | null,
  userAgent: string | null,
  geoCountry?: string | null
): boolean {
  if (ipMatchesExcluded(ip)) return true;
  if (!userAgent || !userAgent.trim()) return true;
  if (isBotUserAgent(userAgent)) return true;
  if (
    process.env.ANALYTICS_GREECE_ONLY === "1" &&
    geoCountry &&
    geoCountry.trim().toUpperCase() !== "GR"
  ) {
    return true;
  }
  return false;
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

  if (process.env.ANALYTICS_GREECE_ONLY === "1") {
    // Κρύβει μη-GR όταν υπάρχει country· παλιές γραμμές χωρίς country μένουν ορατές
    parts.push(
      or(
        isNull(siteAnalytics.geoCountry),
        sql`upper(${siteAnalytics.geoCountry}) = 'GR'`
      ) as SQL
    );
  }

  if (parts.length === 0) return undefined;
  return and(...parts) as SQL;
}
