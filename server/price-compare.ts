import type { Product } from "@shared/schema";

const FETCH_TIMEOUT_MS = 18_000;

/** Chrome-like User-Agent ώστε τα sites να μην μπλοκάρουν bot-like defaults */
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Σύνθεση query: Brand + όνομα (μοντέλο) + RAM + Storage + Χρώμα
 */
export function buildPriceSearchQuery(product: Product): string {
  const parts = [product.brand, product.name, product.ram, product.storage, product.color].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0
  );
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

type CompetitorKey = "kotsovolos" | "skroutz" | "bestprice";

const SITE_CONFIG: {
  key: CompetitorKey;
  searchUrl: (encodedQuery: string) => string;
}[] = [
  {
    key: "kotsovolos",
    searchUrl: (q) => `https://www.kotsovolos.gr/search?q=${q}`,
  },
  {
    key: "skroutz",
    searchUrl: (q) => `https://www.skroutz.gr/search?keyphrase=${q}`,
  },
  {
    key: "bestprice",
    searchUrl: (q) => `https://www.bestprice.gr/?s=${q}`,
  },
];

function manualUrlFor(product: Product, key: CompetitorKey): string | null {
  const map: Record<CompetitorKey, string | null | undefined> = {
    kotsovolos: product.urlKotsovolos,
    skroutz: product.urlSkroutz,
    bestprice: product.urlBestPrice,
  };
  const u = map[key];
  if (!u || typeof u !== "string") return null;
  const t = u.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return null;
  return t;
}

const MANUAL_FLAG: Record<CompetitorKey, keyof Product> = {
  kotsovolos: "manualKotsovolos",
  skroutz: "manualSkroutz",
  bestprice: "manualBestPrice",
};

function storedCompetitorPrice(product: Product, key: CompetitorKey): number | null {
  const map: Record<CompetitorKey, string | null | undefined> = {
    kotsovolos: product.priceKotsovolos as string | null | undefined,
    skroutz: product.priceSkroutz as string | null | undefined,
    bestprice: product.priceBestPrice as string | null | undefined,
  };
  const raw = map[key];
  if (raw == null || String(raw).trim() === "") return null;
  const n = parseFloat(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Χειροκίνητη τιμή με flag — δεν γίνεται scraping (υπερισχύει πάντα). */
function isManualPriceLocked(product: Product, key: CompetitorKey): boolean {
  const flag = product[MANUAL_FLAG[key]] as boolean | null | undefined;
  if (!flag) return false;
  return storedCompetitorPrice(product, key) != null;
}

function parsePriceString(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/[^\d.,-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0 || n >= 500_000) return null;
  return n;
}

/**
 * Meta tags: og:price:amount, product:price:amount (content πριν ή μετά το property)
 */
function extractPriceFromMetaTags(html: string): number | null {
  const patterns: RegExp[] = [
    /<meta[^>]+property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:amount["']/i,
    /<meta[^>]+property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,
    /<meta[^>]+itemprop=["']price["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']price["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const n = parsePriceString(m[1]);
      if (n != null) return n;
    }
  }
  return null;
}

function typeMatchesProduct(t: unknown): boolean {
  if (t == null) return false;
  const s = Array.isArray(t) ? t.join(",") : String(t);
  return /\bProduct\b/i.test(s) || /\bAggregateOffer\b/i.test(s) || /\bOffer\b/i.test(s);
}

/** Αναδρομική ανάγνωση JSON-LD για offers.price, Offer.price, priceSpecification */
function walkJsonLdPrices(node: unknown, out: number[]): void {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLdPrices(item, out);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;

  if (o["@graph"] != null) walkJsonLdPrices(o["@graph"], out);

  const offers = o.offers ?? (o as any).Offers;
  if (offers != null) {
    const list = Array.isArray(offers) ? offers : [offers];
    for (const off of list) {
      if (off == null || typeof off !== "object") continue;
      const offObj = off as Record<string, unknown>;
      if (offObj.price != null) {
        const n = parsePriceString(String(offObj.price));
        if (n != null) out.push(n);
      }
      const ps = offObj.priceSpecification;
      if (ps != null && typeof ps === "object") {
        const p = (ps as Record<string, unknown>).price;
        if (p != null) {
          const n = parsePriceString(String(p));
          if (n != null) out.push(n);
        }
      }
      if (typeMatchesProduct(offObj["@type"]) && offObj.price != null) {
        const n = parsePriceString(String(offObj.price));
        if (n != null) out.push(n);
      }
    }
  }

  if (typeMatchesProduct(o["@type"]) && o.offers == null && o.price != null) {
    const n = parsePriceString(String(o.price));
    if (n != null) out.push(n);
  }

  for (const key of Object.keys(o)) {
    if (key === "@context" || key === "@type") continue;
    walkJsonLdPrices(o[key], out);
  }
}

function extractPricesFromJsonLd(html: string): number[] {
  const out: number[] = [];
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html)) !== null) {
    const chunk = m[1].trim();
    if (!chunk) continue;
    try {
      const data = JSON.parse(chunk);
      walkJsonLdPrices(data, out);
    } catch {
      /* ignore malformed JSON */
    }
  }
  return out;
}

/**
 * Προτεραιότητα: 1) meta og:price:amount / product:price:amount 2) JSON-LD 3) γενικά € στο HTML
 */
export function extractEuroPriceFromHtml(html: string): number | null {
  const fromMeta = extractPriceFromMetaTags(html);
  if (fromMeta != null) return fromMeta;

  const fromLd = extractPricesFromJsonLd(html);
  if (fromLd.length > 0) return Math.min(...fromLd);

  const candidates: number[] = [];
  const euroPatterns = [
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/g,
    /€\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g,
    /(\d+[.,]\d{2})\s*&euro;/g,
  ];
  for (const re of euroPatterns) {
    re.lastIndex = 0;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(html)) !== null) {
      const raw = mm[1].replace(/\./g, "").replace(",", ".");
      const n = parseFloat(raw);
      if (Number.isFinite(n) && n >= 1 && n < 50_000) candidates.push(n);
    }
  }

  if (candidates.length === 0) return null;
  return Math.min(...candidates);
}

function browserLikeHeaders(url: string): Record<string, string> {
  let origin = "https://www.google.com";
  try {
    origin = new URL(url).origin;
  } catch {
    /* keep default */
  }
  return {
    "User-Agent": BROWSER_USER_AGENT,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: `${origin}/`,
  };
}

async function fetchHtml(url: string): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: "follow",
      headers: browserLikeHeaders(url),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPriceFromUrl(url: string): Promise<number | null> {
  const html = await fetchHtml(url);
  if (!html) return null;
  return extractEuroPriceFromHtml(html);
}

export type PriceRefreshResult = {
  priceKotsovolos: string | null;
  priceSkroutz: string | null;
  priceBestPrice: string | null;
  lastPriceUpdate: Date;
  errors: Partial<Record<CompetitorKey, string>>;
};

function numToNumericString(n: number): string {
  return n.toFixed(2);
}

/**
 * Για κάθε κατάστημα: αν το admin έχει σημειώσει χειροκίνητη τιμή (manual*) → κανένα scraping, κρατάμε την υπάρχουσα τιμή.
 * Αλλιώς: χειροκίνητο URL προϊόντος ή σελίδα αναζήτησης.
 */
export async function refreshCompetitorPrices(product: Product): Promise<PriceRefreshResult> {
  const q = encodeURIComponent(buildPriceSearchQuery(product));
  const errors: Partial<Record<CompetitorKey, string>> = {};

  const prices: Record<CompetitorKey, string | null> = {
    kotsovolos: null,
    skroutz: null,
    bestprice: null,
  };

  for (const { key, searchUrl } of SITE_CONFIG) {
    if (isManualPriceLocked(product, key)) {
      continue;
    }

    const manual = manualUrlFor(product, key);
    const url = manual ?? searchUrl(q);
    try {
      const n = await fetchPriceFromUrl(url);
      if (n != null && n > 0) {
        prices[key] = numToNumericString(n);
      } else {
        errors[key] = manual
          ? "Δεν βρέθηκε τιμή σε αυτό το URL (ή το site μπλόκαρε το αίτημα)."
          : "Δεν βρέθηκε τιμή (δοκιμάστε χειροκίνητο URL στο admin).";
      }
    } catch (e) {
      errors[key] = e instanceof Error ? e.message : "Σφάλμα αιτήματος";
    }
  }

  return {
    priceKotsovolos: prices.kotsovolos,
    priceSkroutz: prices.skroutz,
    priceBestPrice: prices.bestprice,
    lastPriceUpdate: new Date(),
    errors,
  };
}
