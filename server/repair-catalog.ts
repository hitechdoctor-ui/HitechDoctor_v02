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

/**
 * Ταιριάζει γραμμή PDF (κείμενο μοντέλου) στο κατάλογο. Προτιμά πιο «μακριά» needle για αποφυγή S24 vs S24 Ultra.
 */
export function matchPdfModelToCatalog(pdfModelLine: string, catalog = getRepairCatalog()): RepairCatalogRow | null {
  const p = normalizeModelKey(pdfModelLine);
  if (p.length < 4) return null;

  let best: { row: RepairCatalogRow; score: number } | null = null;

  for (const row of catalog) {
    for (const needle of row.needles) {
      const n = normalizeModelKey(needle);
      if (n.length < 4) continue;
      if (p === n) return row;
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

  if (best && best.score >= 6) return best.row;
  return null;
}
