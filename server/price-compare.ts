import type { Product } from "@shared/schema";

const FETCH_TIMEOUT_MS = 18_000;

const DEFAULT_UA =
  "Mozilla/5.0 (compatible; HiTechDoctorPriceBot/1.0; +https://hitechdoctor.com) AppleWebKit/537.36";

/**
 * Σύνθεση query: Brand + όνομα (μοντέλο) + RAM + Storage + Χρώμα
 */
export function buildPriceSearchQuery(product: Product): string {
  const parts = [product.brand, product.name, product.ram, product.storage, product.color].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0
  );
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

type CompetitorKey = "kotsovolos" | "skroutz" | "bestprice" | "shopflix";

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
  {
    key: "shopflix",
    searchUrl: (q) => `https://www.shopflix.gr/el/search?q=${q}`,
  },
];

function manualUrlFor(product: Product, key: CompetitorKey): string | null {
  const map: Record<CompetitorKey, string | null | undefined> = {
    kotsovolos: product.urlKotsovolos,
    skroutz: product.urlSkroutz,
    bestprice: product.urlBestPrice,
    shopflix: product.urlShopflix,
  };
  const u = map[key];
  if (!u || typeof u !== "string") return null;
  const t = u.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return null;
  return t;
}

/**
 * Προσπάθεια εξαγωγής τιμής σε EUR από HTML (JSON-LD, meta, κείμενο).
 * Τα ελληνικά sites αλλάζουν συχνά markup — ενδέχεται null.
 */
export function extractEuroPriceFromHtml(html: string): number | null {
  const candidates: number[] = [];

  // application/ld+json — Product / Offer
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html)) !== null) {
    const chunk = m[1];
    try {
      const data = JSON.parse(chunk.trim());
      const items = Array.isArray(data) ? data : [data];
      for (const node of items) {
        if (!node || typeof node !== "object") continue;
        const offers = (node as any).offers ?? (node as any).Offers;
        const off = Array.isArray(offers) ? offers[0] : offers;
        if (off?.price != null) {
          const n = parseFloat(String(off.price).replace(",", "."));
          if (Number.isFinite(n) && n > 0 && n < 500_000) candidates.push(n);
        }
        if ((node as any)["@type"] === "Product" && (node as any).offers?.price) {
          const n = parseFloat(String((node as any).offers.price).replace(",", "."));
          if (Number.isFinite(n) && n > 0 && n < 500_000) candidates.push(n);
        }
      }
    } catch {
      /* ignore */
    }
  }

  // og:price / product:price:amount
  const metaPrice =
    html.match(/property=["']product:price:amount["'][^>]*content=["']([0-9]+[.,]?[0-9]*)/i) ||
    html.match(/property=["']og:price:amount["'][^>]*content=["']([0-9]+[.,]?[0-9]*)/i);
  if (metaPrice?.[1]) {
    const n = parseFloat(metaPrice[1].replace(",", "."));
    if (Number.isFinite(n) && n > 0 && n < 500_000) candidates.push(n);
  }

  // Generic € patterns (τελευταία λύση)
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
  // Σε σελίδες αποτελεσμάτων η μικρότερη «λογική» τιμή συχνά είναι το προϊόν — ασαφές· παίρνουμε min > 0
  const finite = candidates.filter((x) => Number.isFinite(x));
  return Math.min(...finite);
}

async function fetchHtml(url: string): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      redirect: "follow",
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "el-GR,el;q=0.9,en;q=0.8",
      },
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
  priceShopflix: string | null;
  lastPriceUpdate: Date;
  errors: Partial<Record<CompetitorKey, string>>;
};

function numToNumericString(n: number): string {
  return n.toFixed(2);
}

/**
 * Για κάθε κατάστημα: αν υπάρχει χειροκίνητο URL → χρήση του.
 * Αλλιώς δοκιμή public σελίδας αναζήτησης (μπορεί να μπλοκάρει ή να δώσει λάθος τιμή).
 */
export async function refreshCompetitorPrices(product: Product): Promise<PriceRefreshResult> {
  const q = encodeURIComponent(buildPriceSearchQuery(product));
  const errors: Partial<Record<CompetitorKey, string>> = {};

  const prices: Record<CompetitorKey, string | null> = {
    kotsovolos: null,
    skroutz: null,
    bestprice: null,
    shopflix: null,
  };

  for (const { key, searchUrl } of SITE_CONFIG) {
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
    priceShopflix: prices.shopflix,
    lastPriceUpdate: new Date(),
    errors,
  };
}
