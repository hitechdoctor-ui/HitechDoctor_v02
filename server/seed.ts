import type { InferInsertModel } from 'drizzle-orm';
import { db } from './db';
import { products, adminUsers } from '../shared/schema';
import rawData from './seed-data/products.json';
import bcrypt from 'bcrypt';

type SeedProduct = typeof rawData[0];
type InsertRow = InferInsertModel<typeof products>;

function seedJsonToInsertRow(p: SeedProduct): InsertRow {
  return {
    name: p.name ?? '',
    description: p.description ?? '',
    fullDescription: (p as { full_description?: string | null }).full_description ?? null,
    price: String(p.price ?? '0'),
    category: p.category ?? 'other',
    subcategory: (p as { subcategory?: string | null }).subcategory ?? null,
    slug: p.slug ?? '',
    imageUrl: (p as { image_url?: string | null }).image_url ?? null,
    images: (p as { images?: string[] | null }).images ?? null,
    compatibleModels: (p as { compatible_models?: string[] | null }).compatible_models ?? null,
    brand: p.brand ?? null,
    color: (p as { color?: string | null }).color ?? null,
    storage: (p as { storage?: string | null }).storage ?? null,
    preOrder: (p as { pre_order?: boolean }).pre_order ?? false,
    variantGroup: (p as { variant_group?: string | null }).variant_group ?? null,
  };
}

export async function seedProductsIfEmpty() {
  try {
    const existing = await db.select({ id: products.id }).from(products).limit(1);
    if (existing.length > 0) {
      return;
    }
    console.log('[seed] Products table is empty — seeding', rawData.length, 'products...');

    const rows = rawData.map(seedJsonToInsertRow);

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

    const missing = rawData.filter((p: SeedProduct) => {
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

export async function seedAdminIfEmpty() {
  try {
    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) return;
    const hash = await bcrypt.hash('Q@wertyuiop1975', 12);
    await db.insert(adminUsers).values({
      name: 'HiTech Doctor Admin',
      email: 'hitechdoctor@gmail.com',
      passwordHash: hash,
      role: 'superadmin',
    });
    console.log('[seed] Superadmin created: hitechdoctor@gmail.com');
  } catch (err) {
    console.error('[seed] Error seeding admin:', err);
  }
}
