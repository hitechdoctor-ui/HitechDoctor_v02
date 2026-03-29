import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "node:crypto";
import type { Supplier } from "@shared/schema";
import { storage } from "./storage";

export type SyncJobState = {
  progress: number;
  message: string;
  done: boolean;
  error?: boolean;
  result?: {
    suppliersProcessed: number;
    itemsInserted: number;
    overridesUpdated: number;
    errors: string[];
  };
};

export const syncJobs = new Map<string, SyncJobState>();

export function setSyncJob(jobId: string, partial: Partial<SyncJobState> & Pick<SyncJobState, "progress" | "message">) {
  const prev = syncJobs.get(jobId) ?? { progress: 0, message: "", done: false };
  syncJobs.set(jobId, { ...prev, ...partial });
}

export type ParsedXmlItem = { sku: string; cost: number; title?: string };

function pickString(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function pickNumber(o: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(",", ".").replace(/[^\d.-]/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

/** Αναδρομική εύρεση αντικειμένων με sku/code + cost/price στο parsed XML */
export function extractItemsFromParsedJson(root: unknown, out: ParsedXmlItem[] = []): ParsedXmlItem[] {
  if (root == null) return out;
  if (Array.isArray(root)) {
    for (const x of root) extractItemsFromParsedJson(x, out);
    return out;
  }
  if (typeof root !== "object") return out;
  const o = root as Record<string, unknown>;

  const sku =
    pickString(o, [
      "sku", "SKU", "code", "Code", "id", "Id", "product_id", "partnumber", "part_number",
      "@_sku", "@_code", "@_id",
    ]) ?? undefined;
  const cost =
    pickNumber(o, [
      "cost", "Cost", "purchase", "Purchase", "net", "Net", "price", "Price", "wholesale",
      "buy", "Buy", "@_cost", "@_price",
    ]) ?? undefined;

  if (sku && cost != null && cost >= 0) {
    const title = pickString(o, ["title", "Title", "name", "Name", "description", "Description"]);
    if (!out.some((x) => x.sku === sku && x.cost === cost)) {
      out.push({ sku, cost, title });
    }
  }

  for (const k of Object.keys(o)) {
    const v = o[k];
    if (k.startsWith("@_")) continue;
    extractItemsFromParsedJson(v, out);
  }
  return out;
}

export function parseXmlToItems(xml: string): ParsedXmlItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    trimValues: true,
  });
  const parsed = parser.parse(xml);
  return extractItemsFromParsedJson(parsed, []);
}

/** Τελική τιμή πώλησης (με ΦΠΑ): (cost + workFee) * (1 + vat/100). Με workFee=60 και ΦΠΑ 24%: (cost + 60) * 1.24 */
export function computeSellingPrice(cost: number, workFee: number, vatPercent: number): number {
  const raw = (cost + workFee) * (1 + vatPercent / 100);
  return Math.round(raw * 100) / 100;
}

const DEFAULT_WORK_FEE = 60;

export function parseSupplierNumerics(s: Supplier): { workFee: number; vatRate: number } {
  const workFee = parseFloat(String(s.workFee ?? String(DEFAULT_WORK_FEE))) || DEFAULT_WORK_FEE;
  const vatRate = parseFloat(String(s.vatRate ?? "24")) || 24;
  return { workFee, vatRate };
}

export function newSyncJobId(): string {
  return randomUUID();
}

/** Εκτέλεση συγχρονισμού XML → supplier_sync_items + ενημέρωση repair_price_overrides όπου external_sku ταιριάζει */
export async function runSupplierSyncJob(jobId: string, supplierIdFilter: number | undefined): Promise<void> {
  const errors: string[] = [];
  let suppliersProcessed = 0;
  let itemsInserted = 0;
  let overridesUpdated = 0;

  try {
    setSyncJob(jobId, { progress: 5, message: "Φόρτωση προμηθευτών…" });
    const all = await storage.getSuppliers();
    const list = supplierIdFilter != null ? all.filter((s) => s.id === supplierIdFilter) : all;
    if (list.length === 0) {
      setSyncJob(jobId, {
        progress: 100,
        message: "Δεν υπάρχουν προμηθευτές.",
        done: true,
        result: {
          suppliersProcessed: 0,
          itemsInserted: 0,
          overridesUpdated: 0,
          errors: ["Δεν βρέθηκε προμηθευτής."],
        },
      });
      return;
    }

    const totalSteps = list.length;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const base = 10 + Math.floor((i / Math.max(totalSteps, 1)) * 82);
      setSyncJob(jobId, { progress: base, message: `Συγχρονισμός: ${s.name}…` });

      try {
        const res = await fetch(s.xmlUrl, {
          headers: { "User-Agent": "HiTechDoctor-SupplierSync/1.0", Accept: "application/xml,text/xml,*/*" },
          signal: AbortSignal.timeout(120_000),
        });
        if (!res.ok) {
          errors.push(`${s.name}: HTTP ${res.status}`);
          continue;
        }
        const xml = await res.text();
        const items = parseXmlToItems(xml);
        const { workFee, vatRate } = parseSupplierNumerics(s);

        const rows = items.map((it) => {
          const sell = computeSellingPrice(it.cost, workFee, vatRate);
          return {
            externalSku: it.sku,
            title: it.title ?? null,
            purchaseCost: String(it.cost),
            sellingPrice: String(sell),
          };
        });

        await storage.replaceSupplierSyncItems(s.id, rows);
        itemsInserted += rows.length;

        const upd = await storage.updateRepairPriceOverridesFromSync(
          rows.map((r) => ({
            externalSku: r.externalSku,
            price: r.sellingPrice,
            purchaseCost: r.purchaseCost,
            supplierId: s.id,
          }))
        );
        overridesUpdated += upd;

        await storage.updateSupplierLastSync(s.id, new Date());
        suppliersProcessed++;
      } catch (e) {
        errors.push(`${s.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    setSyncJob(jobId, {
      progress: 100,
      message: "Ολοκληρώθηκε.",
      done: true,
      result: { suppliersProcessed, itemsInserted, overridesUpdated, errors },
    });
  } catch (e) {
    setSyncJob(jobId, {
      progress: 100,
      message: e instanceof Error ? e.message : "Σφάλμα",
      done: true,
      error: true,
      result: {
        suppliersProcessed,
        itemsInserted,
        overridesUpdated,
        errors: [...errors, e instanceof Error ? e.message : String(e)],
      },
    });
  }
}
