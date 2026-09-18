import * as cheerio from "cheerio";

export interface InnovxParsedProduct {
  title: string;
  wholesale_price: number;
  category: string;
  retail_price: number;
}

export interface InnovxParseOptions {
  /** Πολλαπλασιαστής λιανικής (π.χ. 1.20 = +20%). Default από env ή 1.20 */
  retailMargin?: number;
}

export interface InnovxParseResult {
  products: InnovxParsedProduct[];
  sections_found: string[];
}

/** Γνωστά section headers στα καθημερινά e-mails Innovx */
export const INNOVX_SECTION_LABELS = [
  "APPLE ACCESSORIES",
  "SMARTWATCH",
  "ΚΙΝΗΤΑ APPLE",
  "ΚΙΝΗΤΑ SAMSUNG",
  "ΚΙΝΗΤΑ XIAOMI",
  "TABLETS",
  "LAPTOPS",
] as const;

const SECTION_DETECTORS: { label: string; pattern: RegExp }[] = [
  { label: "APPLE ACCESSORIES", pattern: /\bAPPLE\s+ACCESSORIES\b/i },
  { label: "SMARTWATCH", pattern: /\bSMARTWATCH\b/i },
  { label: "ΚΙΝΗΤΑ APPLE", pattern: /ΚΙΝΗΤΑ\s+APPLE/i },
  { label: "ΚΙΝΗΤΑ SAMSUNG", pattern: /ΚΙΝΗΤΑ\s+SAMSUNG/i },
  { label: "ΚΙΝΗΤΑ XIAOMI", pattern: /ΚΙΝΗΤΑ\s+(?:XIAOMI|REDMI|POCO)/i },
  { label: "TABLETS", pattern: /\bTABLETS?\b/i },
  { label: "LAPTOPS", pattern: /\bLAPTOPS?\b/i },
];

const VAT_SUFFIX_RE = /\s*(?:χωρ\.|χωρίς\s*ΦΠΑ|\+ΦΠΑ)\s*$/i;

export function getInnovxRetailMargin(): number {
  const raw =
    process.env.INNOVX_RETAIL_MARGIN ??
    process.env.INNOVX_RETAIL_MULTIPLIER ??
    "1.20";
  const n = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 1.2;
}

export function computeInnovxRetailPrice(
  wholesale: number,
  margin = getInnovxRetailMargin(),
): number {
  return Math.round(wholesale * margin * 100) / 100;
}

export function parseInnovxPrice(raw: string): number | null {
  let t = raw
    .trim()
    .replace(/(?:€|EUR|\u20AC)/gi, "")
    .replace(/\s+/g, "");
  if (!t) return null;

  const euroMatch = t.match(/(\d{1,5}(?:[.,]\d{1,2})?)/);
  if (!euroMatch) return null;

  let num = euroMatch[1]!;
  if (num.includes(",") && num.includes(".")) {
    num = num.replace(/\./g, "").replace(",", ".");
  } else if (num.includes(",")) {
    num = num.replace(",", ".");
  }

  const n = parseFloat(num);
  if (!Number.isFinite(n) || n <= 0 || n > 100_000) return null;
  return Math.round(n * 100) / 100;
}

function detectSection(text: string): string | null {
  const line = text.replace(/\s+/g, " ").trim();
  if (line.length < 4 || line.length > 80) return null;

  for (const { label, pattern } of SECTION_DETECTORS) {
    if (!pattern.test(line)) continue;
    const compact = line.replace(/[^a-zA-Z0-9\u0370-\u03FF\s]/g, " ").replace(/\s+/g, " ").trim();
    if (compact.length <= 40 || compact.toUpperCase() === label) return label;
    if (pattern.test(compact)) return label;
  }

  const upper = line.toUpperCase();
  if (upper === line && /[A-ZΑ-Ω]/.test(line) && !findTrailingPrice(line) && line.length <= 48) {
    for (const label of INNOVX_SECTION_LABELS) {
      if (upper.includes(label)) return label;
    }
  }

  return null;
}

/** Εντοπίζει την τιμή στο τέλος της γραμμής (αποφεύγει model numbers όπως iPhone 16, Series 10). */
function findTrailingPrice(line: string): { price: number; index: number } | null {
  const trimmed = line.replace(VAT_SUFFIX_RE, "").trim();

  const patterns: RegExp[] = [
    /(\d{1,5}[.,]\d{2})\s*(?:€|EUR|\u20AC)?\s*$/i,
    /(?:€|EUR|\u20AC)\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*$/i,
    /\s(\d{2,5})\s*(?:€|EUR|\u20AC)?\s*$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match || match.index == null) continue;
    const price = parseInnovxPrice(match[1]!);
    if (price != null) return { price, index: match.index };
  }

  return null;
}

function extractTitleAndPrice(text: string): { title: string; price: number } | null {
  const line = text.replace(/\s+/g, " ").trim();
  if (line.length < 8) return null;
  if (detectSection(line)) return null;

  const trailing = findTrailingPrice(line);
  if (!trailing) return null;

  let title = line.slice(0, trailing.index).trim();
  title = title.replace(/[-–—|:]\s*$/, "").trim();
  if (title.length < 5) return null;
  if (/^(τιμή|price|sku|code|κωδ)/i.test(title)) return null;

  return { title, price: trailing.price };
}

function pushProduct(
  map: Map<string, InnovxParsedProduct>,
  sections: Set<string>,
  category: string,
  title: string,
  wholesale: number,
  margin: number,
) {
  const key = title.toLowerCase().replace(/\s+/g, " ").trim();
  sections.add(category);
  map.set(key, {
    title,
    wholesale_price: wholesale,
    category,
    retail_price: computeInnovxRetailPrice(wholesale, margin),
  });
}

function parseTableRows($: cheerio.CheerioAPI, margin: number): {
  products: Map<string, InnovxParsedProduct>;
  sections: Set<string>;
} {
  const products = new Map<string, InnovxParsedProduct>();
  const sections = new Set<string>();
  let currentSection = "GENERAL";

  $("table tr").each((_, row) => {
    const cells = $(row)
      .find("td, th")
      .toArray()
      .map((cell) => $(cell).text().replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (cells.length === 0) return;

    const rowText = cells.join(" ");
    const section = detectSection(rowText) ?? (cells.length === 1 ? detectSection(cells[0]!) : null);
    if (section) {
      currentSection = section;
      return;
    }

    if (cells.length >= 2) {
      const priceCell = cells[cells.length - 1]!;
      const price = parseInnovxPrice(priceCell);
      if (price != null) {
        const title = cells.slice(0, -1).join(" ").trim();
        if (title.length >= 5) {
          pushProduct(products, sections, currentSection, title, price, margin);
          return;
        }
      }
    }

    const extracted = extractTitleAndPrice(rowText);
    if (extracted) {
      pushProduct(products, sections, currentSection, extracted.title, extracted.price, margin);
    }
  });

  return { products, sections };
}

function parseBlockLines($: cheerio.CheerioAPI, margin: number): {
  products: Map<string, InnovxParsedProduct>;
  sections: Set<string>;
} {
  const products = new Map<string, InnovxParsedProduct>();
  const sections = new Set<string>();
  let currentSection = "GENERAL";

  const blocks = $("body")
    .find("p, li, div, span, strong, b, h1, h2, h3, h4")
    .toArray();

  for (const el of blocks) {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) continue;

    const section = detectSection(text);
    if (section && text.length <= 64) {
      currentSection = section;
      continue;
    }

    const extracted = extractTitleAndPrice(text);
    if (extracted) {
      pushProduct(products, sections, currentSection, extracted.title, extracted.price, margin);
    }
  }

  return { products, sections };
}

function parsePlainTextFallback(html: string, margin: number): {
  products: Map<string, InnovxParsedProduct>;
  sections: Set<string>;
} {
  const products = new Map<string, InnovxParsedProduct>();
  const sections = new Set<string>();
  let currentSection = "GENERAL";

  const plain = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of plain) {
    const section = detectSection(line);
    if (section) {
      currentSection = section;
      continue;
    }
    const extracted = extractTitleAndPrice(line);
    if (extracted) {
      pushProduct(products, sections, currentSection, extracted.title, extracted.price, margin);
    }
  }

  return { products, sections };
}

/** Αναλύει HTML e-mail Innovx και επιστρέφει προϊόντα με χονδρική/λιανική τιμή. */
export function parseInnovxEmailHtml(
  emailHtml: string,
  options: InnovxParseOptions = {},
): InnovxParseResult {
  const margin = options.retailMargin ?? getInnovxRetailMargin();
  const html = emailHtml?.trim() ?? "";
  if (!html) {
    return { products: [], sections_found: [] };
  }

  const $ = cheerio.load(html);
  const tableResult = parseTableRows($, margin);
  const blockResult = parseBlockLines($, margin);
  const fallbackResult =
    tableResult.products.size === 0 && blockResult.products.size === 0
      ? parsePlainTextFallback(html, margin)
      : { products: new Map<string, InnovxParsedProduct>(), sections: new Set<string>() };

  const merged = new Map<string, InnovxParsedProduct>();
  for (const m of [tableResult, blockResult, fallbackResult]) {
    for (const [k, v] of Array.from(m.products.entries())) merged.set(k, v);
  }

  const sections = new Set<string>([
    ...Array.from(tableResult.sections),
    ...Array.from(blockResult.sections),
    ...Array.from(fallbackResult.sections),
  ]);

  return {
    products: Array.from(merged.values()),
    sections_found: Array.from(sections),
  };
}
