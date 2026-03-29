import { readFile } from "node:fs/promises";
import path from "node:path";
import type { InsertRepairPriceOverride } from "@shared/schema";
import { computeSellingPrice } from "./supplier-sync";
import { getRepairCatalog, matchPdfModelToCatalog } from "./repair-catalog";
import { extractPdfText, type ParsedPriceRow } from "./fixmobile-pdf";
import { storage } from "./storage";

/**
 * Συμπίεση αλλαγών γραμμής που «σπάνε» ονόματα μοντέλων (π.χ. Xiaomi Redmi\n10).
 * Όλα τα whitespace γίνονται ένα κενό ώστε το regex για «… τιμή € χωρίς ΦΠΑ» να δουλεύει σε ενιαίο κείμενο.
 */
export function normalizePdfPlainText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00ad/g, "")
    .replace(/\n+/g, " ")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Εξάγει ζεύγη (μοντέλο, τιμή χωρίς ΦΠΑ) όταν η τιμή είναι της μορφής «12.75 € χωρίς ΦΠΑ».
 * Το μοντέλο είναι το κείμενο πριν από κάθε τέτοιο block (μέχρι το προηγούμενο block).
 */
export function extractModelPriceRowsFromText(text: string, label: string): ParsedPriceRow[] {
  const normalized = normalizePdfPlainText(text);
  console.log(`[fixmobile-pdf] ${label} normalized length=${normalized.length}`);
  if (normalized.length > 0 && normalized.length < 800) {
    console.log(`[fixmobile-pdf] ${label} normalized full text:\n${normalized}`);
  } else if (normalized.length >= 800) {
    console.log(`[fixmobile-pdf] ${label} normalized preview (800 chars):\n${normalized.slice(0, 800)}…`);
  }

  const out: ParsedPriceRow[] = [];
  // Αριθμός (δεκαδικά με . ή ,), προαιρετικό € / EUR, μετά «χωρίς ΦΠΑ» (ευέλικτα κενά / τελείες σε Φ.Π.Α.)
  const priceBlockRe =
    /(\d{1,4}[.,]\d{1,2})\s*(?:€|\u20AC|EUR|ευρώ)?\s*χωρίς\s*Φ\.?\s*Π\.?\s*Α\.?/gi;

  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = priceBlockRe.exec(normalized)) !== null) {
    const netPrice = parseFloat(m[1].replace(",", "."));
    const model = normalized.slice(lastIndex, m.index).replace(/\s+/g, " ").trim();
    lastIndex = priceBlockRe.lastIndex;

    console.log(`[fixmobile-pdf] ${label} raw segment before price: ${JSON.stringify(model.slice(0, 120))}${model.length > 120 ? "…" : ""}`);
    console.log(`[fixmobile-pdf] ${label} matched price tail: ${JSON.stringify(m[0])} → net=${netPrice}`);

    if (!Number.isFinite(netPrice) || netPrice < 2 || netPrice > 5000) {
      console.log(`[fixmobile-pdf] ${label} skip: invalid net price`);
      continue;
    }
    if (model.length < 3 || !/[a-zA-Zα-ωΑ-Ω]/.test(model)) {
      console.log(`[fixmobile-pdf] ${label} skip: no usable model text`);
      continue;
    }

    console.log(`[fixmobile-pdf] ${label} ✓ row: model=${JSON.stringify(model)} | netPrice=${netPrice}`);
    out.push({ model, netPrice });
  }

  if (out.length === 0) {
    console.warn(`[fixmobile-pdf] ${label} no rows matched «τιμή € χωρίς ΦΠΑ». Try checking spelling or add a fallback.`);
  }

  return out;
}

export async function parsePdfPriceRows(buffer: Buffer, sourceLabel = "pdf"): Promise<ParsedPriceRow[]> {
  const text = await extractPdfText(buffer);
  return extractModelPriceRowsFromText(text, sourceLabel);
}

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
      const srcLabel = serviceKey === "screen_standard" ? "screens" : "batteries";
      rows = await parsePdfPriceRows(buf, srcLabel);
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
