/**
 * Αντικαθιστά κινητά/tablets στο products.json και (με --db) στη PostgreSQL.
 * Χρήση: tsx script/sync-device-catalog.ts [--db]
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { eq, inArray, or } from "drizzle-orm";
import catalog from "../server/seed-data/device-catalog.json";
import { db } from "../server/db";
import { products } from "../shared/schema";
import { titleToProductSlug } from "../server/services/innovx-parser";
import {
  buildInnovxImageIndex,
  resolveInnovxProductImage,
  type InnovxDeviceCategory,
} from "../server/services/innovx-product-image";

/** Τιμές στο device-catalog.json = χονδρική (EUR). Η τιμή πώλησης = cost × markup ανά κατηγορία. */
const MARKUP_FEATURE_PHONE = 2.0;
const MARKUP_ACCESSORY_WATCH = 1.5;
const MARKUP_MID_RANGE = 1.35;
const MARKUP_PREMIUM_FLAGSHIP = 1.25;

const PREMIUM_FLAGSHIP_SLUG =
  /^(apple-iphone-(16|17|18)|samsung-galaxy-s26-ultra|xiaomi-17t-pro)/;

type CatalogRow = (typeof catalog.products)[number];

function retailMarkupForRow(row: CatalogRow): number {
  if (row.subcategory === "feature-phone") return MARKUP_FEATURE_PHONE;
  if (row.subcategory === "smartwatch") return MARKUP_ACCESSORY_WATCH;
  if (row.category === "accessory") return MARKUP_ACCESSORY_WATCH;
  if (row.subcategory === "tablet") return MARKUP_MID_RANGE;
  const slug = row.slug ?? "";
  if (PREMIUM_FLAGSHIP_SLUG.test(slug)) return MARKUP_PREMIUM_FLAGSHIP;
  return MARKUP_MID_RANGE;
}

type SeedProduct = {
  name: string;
  description: string;
  full_description: string | null;
  price: string;
  category: string;
  subcategory: string | null;
  slug: string;
  image_url: string;
  images: string[];
  compatible_models: null;
  brand: string | null;
  ram: string | null;
  color: string | null;
  storage: string | null;
  pre_order: boolean;
  variant_group: string | null;
};

function deviceCategoryForRow(row: CatalogRow): InnovxDeviceCategory {
  if (row.category === "tablet") return "tablet";
  if (row.subcategory === "smartwatch") return "smartwatch";
  if (row.category === "accessory") return "accessory";
  return "mobile";
}

function toSeedProduct(row: CatalogRow, imageIndex: ReturnType<typeof buildInnovxImageIndex>): SeedProduct {
  const slug = row.slug ?? titleToProductSlug(row.name);
  const explicit = row.image_url?.trim();
  const resolved = explicit
    ? { imageUrl: explicit, source: "slug" as const }
    : resolveInnovxProductImage({
        title: row.name,
        slug,
        deviceCategory: deviceCategoryForRow(row),
        emailImageUrl: null,
        imageIndex,
      });

  return {
    name: row.name,
    description: row.description ?? `${row.name}.`,
    full_description: row.full_description ?? null,
    price: (Number(row.price) * retailMarkupForRow(row)).toFixed(2),
    category: row.category,
    subcategory: row.subcategory ?? null,
    slug,
    image_url: resolved.imageUrl,
    images: [resolved.imageUrl],
    compatible_models: null,
    brand: row.brand ?? null,
    ram: row.ram ?? null,
    color: row.color ?? null,
    storage: row.storage ?? null,
    pre_order: row.pre_order ?? false,
    variant_group: row.variant_group ?? "device-catalog",
  };
}

function updateProductsJson(nextDeviceRows: SeedProduct[]) {
  const jsonPath = path.join(process.cwd(), "server/seed-data/products.json");
  const existing = JSON.parse(readFileSync(jsonPath, "utf8")) as SeedProduct[];

  const kept = existing.filter(
    (p) =>
      p.category !== "mobile" &&
      p.category !== "tablet" &&
      p.variant_group !== "device-catalog",
  );
  const slugSet = new Set(kept.map((p) => p.slug));

  for (const row of nextDeviceRows) {
    if (slugSet.has(row.slug)) {
      const idx = kept.findIndex((p) => p.slug === row.slug);
      if (idx >= 0) kept[idx] = row;
    } else {
      kept.push(row);
      slugSet.add(row.slug);
    }
  }

  writeFileSync(jsonPath, JSON.stringify(kept));
  console.log(
    `[sync-device-catalog] products.json: removed mobile/tablet legacy rows, wrote ${nextDeviceRows.length} catalog product(s). Total: ${kept.length}`,
  );
}

async function syncDatabase(nextDeviceRows: SeedProduct[]) {
  const deleted = await db
    .delete(products)
    .where(
      or(
        eq(products.category, "mobile"),
        eq(products.category, "tablet"),
        eq(products.variantGroup, "device-catalog"),
      ),
    )
    .returning({ id: products.id });

  console.log(`[sync-device-catalog] DB: deleted ${deleted.length} mobile/tablet row(s).`);

  const slugs = nextDeviceRows.map((p) => p.slug);
  const existing = await db.select().from(products).where(inArray(products.slug, slugs));
  const existingBySlug = new Map(existing.map((p) => [p.slug!, p]));

  let inserted = 0;
  let updated = 0;

  for (const row of nextDeviceRows) {
    const payload = {
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
      price: row.price,
      category: row.category,
      subcategory: row.subcategory,
      slug: row.slug,
      imageUrl: row.image_url,
      images: row.images,
      brand: row.brand,
      ram: row.ram,
      color: row.color,
      storage: row.storage,
      preOrder: row.pre_order,
      variantGroup: row.variant_group,
      lastPriceUpdate: new Date(),
    };

    const found = existingBySlug.get(row.slug);
    if (found) {
      await db.update(products).set(payload).where(eq(products.id, found.id));
      updated++;
    } else {
      await db.insert(products).values(payload);
      inserted++;
    }
  }

  console.log(`[sync-device-catalog] DB: inserted ${inserted}, updated ${updated} catalog row(s).`);
}

async function main() {
  const withDb = process.argv.includes("--db");
  const jsonPath = path.join(process.cwd(), "server/seed-data/products.json");
  const legacyMobileTablet = JSON.parse(readFileSync(jsonPath, "utf8")) as Array<{
    category: string;
    slug?: string;
    name: string;
    image_url?: string;
  }>;

  const legacyForImages = legacyMobileTablet.filter(
    (p) => p.category === "mobile" || p.category === "tablet",
  );
  const imageIndex = buildInnovxImageIndex(
    legacyForImages.map((p) => ({
      id: 0,
      name: p.name,
      slug: p.slug ?? null,
      imageUrl: p.image_url ?? null,
    })) as never,
  );

  const nextRows = catalog.products.map((row) => toSeedProduct(row, imageIndex));
  updateProductsJson(nextRows);

  if (withDb) {
    await syncDatabase(nextRows);
  } else {
    console.log("[sync-device-catalog] Skipped DB (pass --db to sync PostgreSQL).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
