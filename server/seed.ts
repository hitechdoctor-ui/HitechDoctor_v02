import type { InferInsertModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { products, adminUsers } from '../shared/schema';
import rawData from './seed-data/products.json';
import refurbishedIphones from './seed-data/refurbished-iphones.json';

const catalogSeedData = [...rawData, ...refurbishedIphones];
import bcrypt from 'bcrypt';
import { getSuperAdminEmail } from '@shared/admin-roles';

type SeedProduct = (typeof catalogSeedData)[0];

type SeedProductJson = SeedProduct & {
  ram?: string | null;
  price_kotsovolos?: string | null;
  price_skroutz?: string | null;
  price_bestprice?: string | null;
  manual_kotsovolos?: boolean | null;
  manual_skroutz?: boolean | null;
  manual_bestprice?: boolean | null;
  url_kotsovolos?: string | null;
  url_skroutz?: string | null;
  url_bestprice?: string | null;
};

type InsertRow = InferInsertModel<typeof products>;

/** Τιμές ανταγωνιστών + manual flags όπως στο products.json — κοινό για insert & merge στην DB */
function competitorFieldsFromSeedJson(p: SeedProductJson): Partial<InsertRow> | null {
  const patch: Partial<InsertRow> = {};
  const pk =
    p.price_kotsovolos != null && String(p.price_kotsovolos).trim() !== ""
      ? String(p.price_kotsovolos).trim()
      : undefined;
  const ps =
    p.price_skroutz != null && String(p.price_skroutz).trim() !== ""
      ? String(p.price_skroutz).trim()
      : undefined;
  const pb =
    p.price_bestprice != null && String(p.price_bestprice).trim() !== ""
      ? String(p.price_bestprice).trim()
      : undefined;

  if (pk != null) {
    patch.priceKotsovolos = pk;
    patch.manualKotsovolos = p.manual_kotsovolos ?? true;
    if (p.url_kotsovolos?.trim()) patch.urlKotsovolos = p.url_kotsovolos.trim();
  }
  if (ps != null) {
    patch.priceSkroutz = ps;
    patch.manualSkroutz = p.manual_skroutz ?? true;
    if (p.url_skroutz?.trim()) patch.urlSkroutz = p.url_skroutz.trim();
  }
  if (pb != null) {
    patch.priceBestPrice = pb;
    patch.manualBestPrice = p.manual_bestprice ?? true;
    if (p.url_bestprice?.trim()) patch.urlBestPrice = p.url_bestprice.trim();
  }
  if (Object.keys(patch).length === 0) return null;
  patch.lastPriceUpdate = new Date();
  return patch;
}

function seedJsonToInsertRow(p: SeedProductJson): InsertRow {
  const row: InsertRow = {
    name: p.name ?? '',
    description: p.description ?? '',
    fullDescription: p.full_description ?? null,
    price: String(p.price ?? '0'),
    category: p.category ?? 'other',
    subcategory: p.subcategory ?? null,
    slug: p.slug ?? '',
    imageUrl: p.image_url ?? null,
    images: p.images ?? null,
    compatibleModels: p.compatible_models ?? null,
    brand: p.brand ?? null,
    ram: p.ram ?? null,
    color: p.color ?? null,
    storage: p.storage ?? null,
    preOrder: p.pre_order ?? false,
    variantGroup: p.variant_group ?? null,
  };
  const c = competitorFieldsFromSeedJson(p);
  if (c) Object.assign(row, c);
  return row;
}

export async function seedProductsIfEmpty() {
  try {
    const existing = await db.select({ id: products.id }).from(products).limit(1);
    if (existing.length > 0) {
      return;
    }
    console.log('[seed] Products table is empty — seeding', catalogSeedData.length, 'products...');

    const rows = catalogSeedData.map(seedJsonToInsertRow);

    const BATCH = 30;
    for (let i = 0; i < rows.length; i += BATCH) {
      await db.insert(products).values(rows.slice(i, i + BATCH));
    }

    console.log('[seed] Done — inserted', rows.length, 'products.');
  } catch (err) {
    console.error('[seed] Error seeding products:', err);
  }
}

/** Εισάγει γραμμές από το products.json αν λείπει το slug (για ήδη πληρωμένο DB π.χ. Railway). */
export async function seedCatalogNewProductsFromJson() {
  try {
    const rows = await db.select({ slug: products.slug }).from(products);
    const existingSlugs = new Set(
      rows.map((r) => r.slug).filter((s): s is string => typeof s === "string" && s.length > 0),
    );

    const missing = catalogSeedData.filter((p: SeedProduct) => {
      const s = (p as { slug?: string }).slug ?? "";
      return s.length > 0 && !existingSlugs.has(s);
    });
    if (missing.length === 0) {
      return;
    }

    console.log(
      `[seed] Catalog: inserting ${missing.length} new product(s) from products.json (missing slugs)`,
    );
    const BATCH = 30;
    const mapped = missing.map(seedJsonToInsertRow);
    for (let i = 0; i < mapped.length; i += BATCH) {
      await db.insert(products).values(mapped.slice(i, i + BATCH));
    }
  } catch (err) {
    console.error('[seed] Error inserting new catalog products:', err);
  }
}

/** Ενημερώνει τιμές Skroutz/Kotsovolos/BestPrice από το products.json για ήδη υπάρχοντα slugs */
export async function mergeSeedCompetitorPricesFromJson() {
  try {
    let n = 0;
    for (const raw of catalogSeedData) {
      const p = raw as SeedProductJson;
      const slug = (p.slug ?? '').trim();
      if (!slug) continue;
      const patch = competitorFieldsFromSeedJson(p);
      if (!patch) continue;

      await db.update(products).set(patch).where(eq(products.slug, slug));
      n += 1;
    }
    if (n > 0) {
      console.log(`[seed] Catalog: updated competitor pricing for ${n} product row(s) from products.json`);
    }
  } catch (err) {
    console.error('[seed] mergeSeedCompetitorPricesFromJson:', err);
  }
}

/** Ενημερώνει εικόνες refurbished iPhone από το JSON (για ήδη υπάρχοντα slugs στο Railway). */
export async function mergeRefurbishedImagesFromJson() {
  try {
    let n = 0;
    for (const raw of refurbishedIphones) {
      const slug = ((raw as { slug?: string }).slug ?? "").trim();
      const imageUrl = ((raw as { image_url?: string | null }).image_url ?? "").trim();
      if (!slug || !imageUrl) continue;
      await db.update(products).set({ imageUrl }).where(eq(products.slug, slug));
      n += 1;
    }
    if (n > 0) {
      console.log(`[seed] Refurbished: updated image_url for ${n} product(s) from refurbished-iphones.json`);
    }
  } catch (err) {
    console.error("[seed] mergeRefurbishedImagesFromJson:", err);
  }
}

export async function seedAdminIfEmpty() {
  try {
    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) return;
    const hash = await bcrypt.hash('Q@wertyuiop1975', 12);
    const ownerEmail = getSuperAdminEmail();
    await db.insert(adminUsers).values({
      name: 'HiTech Doctor Admin',
      email: ownerEmail,
      passwordHash: hash,
      role: 'superadmin',
    });
    console.log('[seed] Superadmin created:', ownerEmail);
  } catch (err) {
    console.error('[seed] Error seeding admin:', err);
  }
}
