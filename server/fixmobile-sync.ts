import { readFile } from "node:fs/promises";
import path from "node:path";
import type { InsertRepairPriceOverride } from "@shared/schema";
import { computeSellingPrice } from "./supplier-sync";
import { getRepairCatalog, matchPdfModelToCatalog } from "./repair-catalog";
import { parsePdfPriceRows } from "./fixmobile-pdf";
import { storage } from "./storage";

export const FIXMOBILE_UPLOAD_DIR = path.join(process.cwd(), "uploads", "fixmobile");
export const FIXMOBILE_SCREEN_PDF = path.join(FIXMOBILE_UPLOAD_DIR, "screens.pdf");
export const FIXMOBILE_BATTERY_PDF = path.join(FIXMOBILE_UPLOAD_DIR, "batteries.pdf");

export type FixmobilePdfSyncResult = {
  screensParsed: number;
  batteriesParsed: number;
  screensMatched: number;
  batteriesMatched: number;
  upserted: number;
  unmatched: string[];
  errors: string[];
};

const DEFAULT_WORK = 60;
const DEFAULT_VAT = 24;

function netToSellingGross(netPartPrice: number): number {
  return computeSellingPrice(netPartPrice, DEFAULT_WORK, DEFAULT_VAT);
}

/**
 * Συγχρονισμός τιμών από αποθηκευμένα PDF (Οθόνες / Μπαταρίες).
 * Η τιμή στο PDF είναι κόστος ανταλλακτικού χωρίς ΦΠΑ → τελική με ΦΠΑ όπως στο XML sync: (net + 60) × 1,24
 */
export async function runFixmobilePdfSyncFromDisk(): Promise<FixmobilePdfSyncResult> {
  const unmatched: string[] = [];
  const errors: string[] = [];
  let screensParsed = 0;
  let batteriesParsed = 0;
  let screensMatched = 0;
  let batteriesMatched = 0;
  let upserted = 0;

  const catalog = getRepairCatalog();

  async function processFile(
    absPath: string,
    serviceKey: "screen_standard" | "battery_standard"
  ): Promise<void> {
    let buf: Buffer;
    try {
      buf = await readFile(absPath);
    } catch {
      errors.push(`Αρχείο δεν βρέθηκε: ${path.basename(absPath)}`);
      return;
    }

    let rows: { model: string; netPrice: number }[];
    try {
      rows = await parsePdfPriceRows(buf);
    } catch (e) {
      errors.push(`${path.basename(absPath)}: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }

    if (serviceKey === "screen_standard") screensParsed = rows.length;
    else batteriesParsed = rows.length;

    const seen = new Map<string, InsertRepairPriceOverride>();

    for (const { model, netPrice } of rows) {
      const hit = matchPdfModelToCatalog(model, catalog);
      if (!hit) {
        unmatched.push(`${serviceKey === "screen_standard" ? "[Οθόνη]" : "[Μπαταρία]"} ${model}`);
        continue;
      }

      if (serviceKey === "screen_standard") screensMatched++;
      else batteriesMatched++;

      const gross = netToSellingGross(netPrice);
      const sku = `fixmobile-pdf-${serviceKey}-${hit.brand}-${hit.modelSlug}`;

      seen.set(`${hit.brand}|${hit.modelSlug}|${serviceKey}`, {
        brand: hit.brand,
        modelSlug: hit.modelSlug,
        serviceKey,
        externalSku: sku,
        price: String(gross),
        purchaseCost: String(netPrice),
        supplierId: null,
      });
    }

    for (const row of seen.values()) {
      try {
        await storage.upsertRepairPriceOverride(row);
        upserted++;
      } catch (e) {
        errors.push(`upsert ${row.brand}/${row.modelSlug}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  await processFile(FIXMOBILE_SCREEN_PDF, "screen_standard");
  await processFile(FIXMOBILE_BATTERY_PDF, "battery_standard");

  return {
    screensParsed,
    batteriesParsed,
    screensMatched,
    batteriesMatched,
    upserted,
    unmatched: unmatched.slice(0, 200),
    errors,
  };
}
