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
import {
  buildIphone17_256gbFullDescription,
  isIphone17_256gbSlug,
} from "../server/seed-data/descriptions/iphone-17-256gb-full-description";

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

type CatalogPricingExtras = {
  retail_price?: number;
  price_skroutz?: string;
  price_kotsovolos?: string;
  price_bestprice?: string;
  manual_skroutz?: boolean;
  manual_kotsovolos?: boolean;
  manual_bestprice?: boolean;
  url_skroutz?: string;
  url_kotsovolos?: string;
  url_bestprice?: string;
};

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
} & CatalogPricingExtras;

function retailPriceForRow(row: CatalogRow): string {
  const extras = row as CatalogRow & CatalogPricingExtras;
  if (extras.retail_price != null && Number.isFinite(Number(extras.retail_price))) {
    return Number(extras.retail_price).toFixed(2);
  }
  return (Number(row.price) * retailMarkupForRow(row)).toFixed(2);
}

function competitorFieldsFromCatalog(row: CatalogRow): CatalogPricingExtras {
  const p = row as CatalogRow & CatalogPricingExtras;
  const out: CatalogPricingExtras = {};
  if (p.price_kotsovolos?.trim()) {
    out.price_kotsovolos = p.price_kotsovolos.trim();
    out.manual_kotsovolos = p.manual_kotsovolos ?? true;
    if (p.url_kotsovolos?.trim()) out.url_kotsovolos = p.url_kotsovolos.trim();
  }
  if (p.price_skroutz?.trim()) {
    out.price_skroutz = p.price_skroutz.trim();
    out.manual_skroutz = p.manual_skroutz ?? true;
    if (p.url_skroutz?.trim()) out.url_skroutz = p.url_skroutz.trim();
  }
  if (p.price_bestprice?.trim()) {
    out.price_bestprice = p.price_bestprice.trim();
    out.manual_bestprice = p.manual_bestprice ?? true;
    if (p.url_bestprice?.trim()) out.url_bestprice = p.url_bestprice.trim();
  }
  return out;
}

function deviceCategoryForRow(row: CatalogRow): InnovxDeviceCategory {
  if (row.category === "tablet") return "tablet";
  if (row.subcategory === "smartwatch") return "smartwatch";
  if (row.category === "accessory") return "accessory";
  return "mobile";
}

/** SEO περιγραφή με λέξεις-κλειδιά — χρησιμοποιείται όταν λείπει custom description στο catalog. */
function buildCatalogProductDescription(row: CatalogRow): string {
  const custom = (row as CatalogRow & { description?: string }).description?.trim();
  if (custom) return custom;

  const brand = (row.brand ?? "").trim();
  const color = (row.color ?? "").trim();
  const storage = (row.storage ?? "").trim();
  const ram = (row.ram ?? "").trim();
  const name = row.name;
  const specBits = [ram, storage, color].filter(Boolean);
  const specsSuffix = specBits.length ? ` (${specBits.join(", ")})` : "";

  if (row.subcategory === "feature-phone") {
    return `${name} — κινητό με κουμπιά${color ? ` σε ${color}` : ""}, dual SIM, εύκολη χρήση και μεγάλη αυτονομία μπαταρίας. Αγορά online από HiTech Doctor Αθήνα · eShop κινητών Nokia, εγγύηση, ανταλλακτικά και γρήγορη αποστολή σε όλη την Ελλάδα.`;
  }

  if (row.subcategory === "smartwatch") {
    return `${name} — smartwatch ${brand}${specsSuffix}, ειδοποιήσεις, fitness και συμβατότητα smartphone. Αγορά online HiTech Doctor eShop, εγγύηση 12 μήνες, ανταλλακτικά ρολογιών και αποστολή 1–2 εργάσιμες.`;
  }

  if (row.subcategory === "tablet" || row.category === "tablet") {
    return `${name} — tablet ${brand}${specsSuffix} για streaming, σπουδές και εργασία. Αγορά tablet online από HiTech Doctor Αθήνα, eShop, εγγύηση 12 μήνες, competitive τιμές και παράδοση σε όλη την Ελλάδα.`;
  }

  if (/iphone/i.test(name)) {
    return `${name} — Apple iPhone 5G${specsSuffix}, Dynamic Island, premium κάμερες και iOS. Αγορά iPhone online από HiTech Doctor Αθήνα · νέο smartphone Apple, εγγύηση 12 μήνες, άμεση διαθεσιμότητα eShop, ασφαλείς πληρωμές και αποστολή.`;
  }

  if (brand === "Samsung" || /galaxy/i.test(name)) {
    return `${name} — Samsung Galaxy smartphone 5G${specsSuffix}, κάμερα, AMOLED οθόνη και One UI. Αγορά Samsung online HiTech Doctor Αθήνα, eShop κινητά, εγγύηση 12 μήνες, γρήγορη αποστολή.`;
  }

  if (/xiaomi|redmi|poco|17t/i.test(name) || brand === "Xiaomi") {
    return `${name} — Xiaomi smartphone 5G${specsSuffix}, ισχυρές κάμερες και MIUI/HyperOS. Αγορά Xiaomi online από HiTech Doctor eShop Αθήνα, εγγύηση 12 μήνες, ανταλλακτικά και παράδοση.`;
  }

  return `${name}${specsSuffix} — smartphone για καθημερινή χρήση, 5G και modern οθόνη. Αγορά online από HiTech Doctor eShop Αθήνα, εγγύηση 12 μήνες, competitive τιμές κινητών και αποστολή 1–2 εργάσιμες.`;
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

  const gallery =
    Array.isArray((row as CatalogRow & { images?: string[] }).images) &&
    (row as CatalogRow & { images?: string[] }).images!.length > 0
      ? (row as CatalogRow & { images?: string[] }).images!.map((u) => u.trim()).filter(Boolean)
      : [resolved.imageUrl];

  return {
    name: row.name,
    description: buildCatalogProductDescription(row),
    full_description:
      (row as CatalogRow & { full_description?: string | null }).full_description?.trim() ||
      (isIphone17_256gbSlug(slug)
        ? buildIphone17_256gbFullDescription(row.name, row.color ?? "")
        : null),
    price: retailPriceForRow(row),
    category: row.category,
    subcategory: row.subcategory ?? null,
    slug,
    image_url: gallery[0] ?? resolved.imageUrl,
    images: gallery,
    compatible_models: null,
    brand: row.brand ?? null,
    ram: row.ram ?? null,
    color: row.color ?? null,
    storage: row.storage ?? null,
    pre_order: row.pre_order ?? false,
    variant_group: row.variant_group ?? "device-catalog",
    ...competitorFieldsFromCatalog(row),
  };
}

function competitorDbPatch(row: SeedProduct) {
  const patch: Record<string, unknown> = {};
  if (row.price_kotsovolos?.trim()) {
    patch.priceKotsovolos = row.price_kotsovolos.trim();
    patch.manualKotsovolos = row.manual_kotsovolos ?? true;
    if (row.url_kotsovolos?.trim()) patch.urlKotsovolos = row.url_kotsovolos.trim();
  }
  if (row.price_skroutz?.trim()) {
    patch.priceSkroutz = row.price_skroutz.trim();
    patch.manualSkroutz = row.manual_skroutz ?? true;
    if (row.url_skroutz?.trim()) patch.urlSkroutz = row.url_skroutz.trim();
  }
  if (row.price_bestprice?.trim()) {
    patch.priceBestPrice = row.price_bestprice.trim();
    patch.manualBestPrice = row.manual_bestprice ?? true;
    if (row.url_bestprice?.trim()) patch.urlBestPrice = row.url_bestprice.trim();
  }
  return patch;
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
      ...competitorDbPatch(row),
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
