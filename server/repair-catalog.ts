/**
 * Κατάλογος μοντέλων επισκευής για αντιστοίχιση γραμμών PDF (FixMobile) → brand + modelSlug.
 */
import { allModels } from "@/data/iphone-devices";
import { allSamsungModels } from "@/data/samsung-devices";
import { allXiaomiModels } from "@/data/xiaomi-devices";
import { allHuaweiModels } from "@/data/huawei-devices";
import { allOnePlusModels } from "@/data/oneplus-devices";

export interface RepairCatalogRow {
  brand: string;
  modelSlug: string;
  /** Φράσεις προς ταύτιση (canonical lowercase χωρίς τόνους) */
  needles: string[];
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeModelKey(s: string): string {
  return stripAccents(s)
    .toLowerCase()
    .replace(/[^\w\s\+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Λέξεις/μοτίβα από PDF (περιγραφές ανταλλακτικών) που δεν βοηθούν στο ταίριασμα με modelId — αφαιρούνται πριν τη σύγκριση. */
const PDF_NOISE_PATTERNS: RegExp[] = [
  /\bγνήσια\b/gi,
  /\bγνησια\b/gi,
  /\bμπαταρία\b/gi,
  /\bμπαταρια\b/gi,
  /\bοθόνη\b/gi,
  /\bοθονη\b/gi,
  /\bανταλλακτικό\b/gi,
  /\bανταλλακτικο\b/gi,
  /\bgenuine\b/gi,
  /\boriginal\b/gi,
  /\bbattery\b/gi,
  /\bscreen\b/gi,
  /\blcd\b/gi,
  /\boled\b/gi,
  /\bincell\b/gi,
  /\bsoft\s*oled\b/gi,
  /\bservice\s+pack\b/gi,
  /\bμε\s+εγκατάσταση\b/gi,
  /\bμε\s+τοποθέτηση\b/gi,
  /\bμαύρο\b/gi,
  /\bμαυρο\b/gi,
  /\bμαύρη\b/gi,
  /\bλευκό\b/gi,
  /\bλευκο\b/gi,
  /\bblack\b/gi,
  /\bwhite\b/gi,
  /\bspace\s*gray\b/gi,
  /\bmidnight\b/gi,
  /\bstarlight\b/gi,
  /\bproduct\s*red\b/gi,
  /\bpn\s*[:.]?\s*[a-z0-9][a-z0-9.-]{3,}\b/gi,
  /\bapple\b/gi,
];

/**
 * Καθαρίζει γραμμή PDF για fuzzy match (αφαιρεί «Γνήσια», «Μπαταρία», χρώματα, PN…).
 */
export function stripPdfProductNoise(raw: string): string {
  let s = raw;
  for (const re of PDF_NOISE_PATTERNS) {
    s = s.replace(re, " ");
  }
  return normalizePdfNoiseWhitespace(s);
}

function normalizePdfNoiseWhitespace(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

export function buildRepairCatalog(): RepairCatalogRow[] {
  const rows: RepairCatalogRow[] = [];

  for (const m of allModels()) {
    const short = m.name.replace(/^iPhone\s+/i, "").trim();
    rows.push({
      brand: "iphone",
      modelSlug: m.slug,
      needles: [m.name, short, m.slug.replace(/-/g, " "), short.replace(/\s+/g, " ")],
    });
  }

  for (const m of allSamsungModels()) {
    const g = m.name.replace(/^Samsung\s+/i, "").trim();
    const short = g.replace(/^Galaxy\s+/i, "").trim();
    rows.push({
      brand: "samsung",
      modelSlug: m.slug,
      needles: [m.name, g, short, m.slug.replace(/-/g, " ")],
    });
  }

  for (const m of allXiaomiModels()) {
    rows.push({
      brand: "xiaomi",
      modelSlug: m.slug,
      needles: [m.name, m.slug.replace(/-/g, " ")],
    });
  }

  for (const m of allHuaweiModels()) {
    const g = m.name.replace(/^Huawei\s+/i, "").trim();
    rows.push({
      brand: "huawei",
      modelSlug: m.slug,
      needles: [m.name, g, m.slug.replace(/-/g, " ")],
    });
  }

  for (const m of allOnePlusModels()) {
    const g = m.name.replace(/^OnePlus\s+/i, "").trim();
    rows.push({
      brand: "oneplus",
      modelSlug: m.slug,
      needles: [m.name, g, m.slug.replace(/-/g, " ")],
    });
  }

  return rows;
}

let cachedCatalog: RepairCatalogRow[] | null = null;
export function getRepairCatalog(): RepairCatalogRow[] {
  if (!cachedCatalog) cachedCatalog = buildRepairCatalog();
  return cachedCatalog;
}

export type MatchPdfModelOptions = {
  /** Για ειδικούς κανόνες (π.χ. «iPhone 12» χωρίς Pro → iphone-12 στις μπαταρίες). */
  serviceKey?: "screen_standard" | "battery_standard";
  /** Πρόθεμα log στο terminal (π.χ. fixmobile:batteries). */
  logLabel?: string;
};

/**
 * Μπαταρία + «iPhone N» χωρίς Pro/Max/Mini/Plus → slug iphone-N (π.χ. battery_standard-iphone-12).
 */
function matchPlainIphoneBaseForBattery(
  p: string,
  catalog: RepairCatalogRow[]
): RepairCatalogRow | null {
  const m = p.match(/\biphone\s+(\d{1,2})(?!\s*(?:pro|max|mini|plus)\b)/);
  if (!m) return null;
  const slug = `iphone-${m[1]}`;
  return catalog.find((r) => r.brand === "iphone" && r.modelSlug === slug) ?? null;
}

/**
 * Ταιριάζει γραμμή PDF (κείμενο μοντέλου) στο κατάλογο. Προτιμά πιο «μακριά» needle για αποφυγή S24 vs S24 Ultra.
 */
export function matchPdfModelToCatalog(
  pdfModelLine: string,
  catalog = getRepairCatalog(),
  options?: MatchPdfModelOptions
): RepairCatalogRow | null {
  const log = (msg: string) => {
    const prefix = options?.logLabel ? `[${options.logLabel}]` : "[repair-catalog]";
    console.log(`${prefix} ${msg}`);
  };

  const stripped = stripPdfProductNoise(pdfModelLine);
  const p = normalizeModelKey(stripped);
  log(`PDF raw: ${JSON.stringify(pdfModelLine)}`);
  log(`cleaned for match: ${JSON.stringify(stripped)}`);
  log(`normalized key: ${JSON.stringify(p)}`);

  if (p.length < 4) {
    log("skip: normalized key too short");
    return null;
  }

  let best: { row: RepairCatalogRow; score: number } | null = null;

  for (const row of catalog) {
    for (const needle of row.needles) {
      const n = normalizeModelKey(needle);
      if (n.length < 4) continue;
      if (p === n) {
        log(`exact needle match → modelId=${row.modelSlug} brand=${row.brand} (needle=${JSON.stringify(needle)})`);
        return row;
      }
      if (p.includes(n)) {
        const score = n.length;
        if (!best || score > best.score) best = { row, score };
      }
    }
  }

  if (!best) {
    for (const row of catalog) {
      for (const needle of row.needles) {
        const n = normalizeModelKey(needle);
        if (n.length < 8) continue;
        if (n.includes(p) && p.length >= 8) {
          const score = p.length;
          if (!best || score > best.score) best = { row, score };
        }
      }
    }
  }

  if (best && best.score >= 6) {
    log(
      `substring match → modelId=${best.row.modelSlug} brand=${best.row.brand} score=${best.score}`
    );
    return best.row;
  }

  if (options?.serviceKey === "battery_standard") {
    const plain = matchPlainIphoneBaseForBattery(p, catalog);
    if (plain) {
      log(
        `battery plain-iPhone rule → modelId=${plain.modelSlug} brand=${plain.brand} (iPhone N χωρίς Pro/Max/Mini/Plus)`
      );
      return plain;
    }
  }

  log(`no match (best score was ${best ? best.score : "none"}, threshold 6)`);
  return null;
}
