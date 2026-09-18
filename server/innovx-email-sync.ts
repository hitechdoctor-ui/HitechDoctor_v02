import type { InsertProduct, Product } from "@shared/schema";
import { storage } from "./storage";
import {
  type InnovxParsedProduct,
  parseInnovxEmailHtml,
  type InnovxParseOptions,
} from "./services/innovx-parser";

export type InnovxSyncProductResult = InnovxParsedProduct & {
  action: "updated" | "created" | "skipped";
  product_id?: number;
  slug?: string;
  reason?: string;
};

export interface InnovxEmailSyncOptions extends InnovxParseOptions {
  createMissing?: boolean;
}

export interface InnovxEmailSyncResult {
  status: "success";
  parsed_count: number;
  updated_count: number;
  created_count: number;
  skipped_count: number;
  sections_found: string[];
  products: InnovxSyncProductResult[];
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleToProductSlug(title: string): string {
  return normalizeName(title)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function mapInnovxSection(section: string): {
  category: string;
  subcategory?: string;
  brand?: string;
} {
  switch (section) {
    case "APPLE ACCESSORIES":
      return { category: "accessory" };
    case "SMARTWATCH":
      return { category: "accessory", subcategory: "smartwatch" };
    case "ΚΙΝΗΤΑ APPLE":
      return { category: "mobile", brand: "Apple" };
    case "ΚΙΝΗΤΑ SAMSUNG":
      return { category: "mobile", brand: "Samsung" };
    case "ΚΙΝΗΤΑ XIAOMI":
      return { category: "mobile", brand: "Xiaomi" };
    case "TABLETS":
      return { category: "tablet" };
    case "LAPTOPS":
      return { category: "laptop" };
    default:
      return { category: "mobile" };
  }
}

function findMatchingProduct(
  title: string,
  slug: string,
  catalog: Product[],
): Product | undefined {
  const normTitle = normalizeName(title);

  const bySlug = catalog.find((p) => p.slug === slug);
  if (bySlug) return bySlug;

  const byExactName = catalog.find((p) => normalizeName(p.name) === normTitle);
  if (byExactName) return byExactName;

  const byContains = catalog.find((p) => {
    const n = normalizeName(p.name);
    return n.includes(normTitle) || normTitle.includes(n);
  });
  return byContains;
}

export async function syncInnovxEmailHtml(
  emailHtml: string,
  options: InnovxEmailSyncOptions = {},
): Promise<InnovxEmailSyncResult> {
  const parsed = parseInnovxEmailHtml(emailHtml, options);
  const catalog = await storage.getProducts();
  const now = new Date();

  const results: InnovxSyncProductResult[] = [];
  let updated_count = 0;
  let created_count = 0;
  let skipped_count = 0;

  for (const item of parsed.products) {
    const slug = titleToProductSlug(item.title);
    const existing = findMatchingProduct(item.title, slug, catalog);
    const retailStr = item.retail_price.toFixed(2);

    if (existing) {
      await storage.updateProduct(existing.id, {
        price: retailStr,
        lastPriceUpdate: now,
      });
      updated_count++;
      results.push({
        ...item,
        action: "updated",
        product_id: existing.id,
        slug: existing.slug ?? slug,
      });
      continue;
    }

    if (!options.createMissing) {
      skipped_count++;
      results.push({
        ...item,
        action: "skipped",
        slug,
        reason: "Δεν βρέθηκε αντιστοιχία στη βάση (create_missing=false)",
      });
      continue;
    }

    const mapped = mapInnovxSection(item.category);
    const insert: InsertProduct = {
      name: item.title,
      description: item.title,
      price: retailStr,
      category: mapped.category,
      subcategory: mapped.subcategory ?? null,
      slug,
      brand: mapped.brand ?? null,
      lastPriceUpdate: now,
    };

    const created = await storage.createProduct(insert);
    catalog.push(created);
    created_count++;
    results.push({
      ...item,
      action: "created",
      product_id: created.id,
      slug: created.slug ?? slug,
    });
  }

  return {
    status: "success",
    parsed_count: parsed.products.length,
    updated_count,
    created_count,
    skipped_count,
    sections_found: parsed.sections_found,
    products: results,
  };
}
