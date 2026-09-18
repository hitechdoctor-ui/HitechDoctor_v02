import type { InsertProduct, Product } from "@shared/schema";
import { storage } from "./storage";
import {
  INNOVX_VARIANT_GROUP,
  mapSectionToCatalog,
  type InnovxParsedProduct,
  parseInnovxEmailHtml,
  type InnovxParseOptions,
  titleToProductSlug,
} from "./services/innovx-parser";
import {
  buildInnovxImageIndex,
  resolveInnovxProductImage,
  type InnovxImageSource,
} from "./services/innovx-product-image";

export { INNOVX_VARIANT_GROUP, titleToProductSlug } from "./services/innovx-parser";

export type InnovxSyncProductResult = InnovxParsedProduct & {
  action: "created";
  product_id: number;
  slug: string;
  image_url: string;
  image_source: InnovxImageSource;
};

export interface InnovxEmailSyncOptions extends InnovxParseOptions {
  /** @deprecated Πλέον γίνεται πάντα πλήρης re-import (διαγραφή + δημιουργία). */
  createMissing?: boolean;
}

export interface InnovxEmailSyncResult {
  status: "success";
  parsed_count: number;
  deleted_count: number;
  created_count: number;
  sections_found: string[];
  products: InnovxSyncProductResult[];
}

function ensureUniqueSlug(baseSlug: string, usedSlugs: Set<string>, catalog: Product[]): string {
  if (!usedSlugs.has(baseSlug)) {
    const existing = catalog.find((p) => p.slug === baseSlug);
    if (!existing || existing.variantGroup === INNOVX_VARIANT_GROUP) {
      return baseSlug;
    }
  }

  let candidate = `${baseSlug}-innovx`;
  let n = 2;
  while (usedSlugs.has(candidate) || catalog.some((p) => p.slug === candidate)) {
    candidate = `${baseSlug}-innovx-${n}`;
    n++;
  }
  return candidate;
}

export async function syncInnovxEmailHtml(
  emailHtml: string,
  options: InnovxEmailSyncOptions = {},
): Promise<InnovxEmailSyncResult> {
  const parsed = parseInnovxEmailHtml(emailHtml, options);
  const catalog = await storage.getProducts();
  const imageIndex = buildInnovxImageIndex(catalog);
  const now = new Date();

  const deleted_count = await storage.deleteProductsByVariantGroup(INNOVX_VARIANT_GROUP);

  const results: InnovxSyncProductResult[] = [];
  const usedSlugs = new Set<string>();
  let created_count = 0;

  for (const item of parsed.products) {
    const baseSlug = titleToProductSlug(item.title);
    const slug = ensureUniqueSlug(baseSlug, usedSlugs, catalog);
    usedSlugs.add(slug);

    const mapped = mapSectionToCatalog(item.section);
    const retailStr = item.retail_price.toFixed(2);
    const resolvedImage = resolveInnovxProductImage({
      title: item.title,
      slug: baseSlug,
      deviceCategory: item.device_category,
      emailImageUrl: item.image_url,
      imageIndex,
    });

    const insert: InsertProduct = {
      name: item.title,
      description: item.title,
      price: retailStr,
      category: mapped.category,
      subcategory: mapped.subcategory ?? null,
      slug,
      brand: mapped.brand ?? null,
      imageUrl: resolvedImage.imageUrl,
      images: [resolvedImage.imageUrl],
      variantGroup: INNOVX_VARIANT_GROUP,
      lastPriceUpdate: now,
    };

    const created = await storage.createProduct(insert);
    catalog.push(created);
    created_count++;

    results.push({
      ...item,
      action: "created",
      product_id: created.id,
      slug,
      image_url: resolvedImage.imageUrl,
      image_source: resolvedImage.source,
    });
  }

  return {
    status: "success",
    parsed_count: parsed.products.length,
    deleted_count,
    created_count,
    sections_found: parsed.sections_found,
    products: results,
  };
}
