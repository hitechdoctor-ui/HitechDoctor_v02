import { db } from './db';
import { products } from '../shared/schema';
import rawData from './seed-data/products.json';

type SeedProduct = typeof rawData[0];

export async function seedProductsIfEmpty() {
  try {
    const existing = await db.select({ id: products.id }).from(products).limit(1);
    if (existing.length > 0) {
      return;
    }
    console.log('[seed] Products table is empty — seeding', rawData.length, 'products...');

    const rows = rawData.map((p: SeedProduct) => ({
      name: p.name ?? '',
      description: p.description ?? '',
      fullDescription: (p as any).full_description ?? null,
      price: p.price ?? '0',
      category: p.category ?? 'other',
      subcategory: (p as any).subcategory ?? null,
      slug: p.slug ?? '',
      imageUrl: (p as any).image_url ?? '',
      images: (p as any).images ?? null,
      compatibleModels: (p as any).compatible_models ?? null,
      brand: p.brand ?? null,
      color: p.color ?? null,
      storage: p.storage ?? null,
      isPreOrder: (p as any).pre_order ?? false,
      variantGroup: (p as any).variant_group ?? null,
    }));

    const BATCH = 30;
    for (let i = 0; i < rows.length; i += BATCH) {
      await db.insert(products).values(rows.slice(i, i + BATCH));
    }

    console.log('[seed] Done — inserted', rows.length, 'products.');
  } catch (err) {
    console.error('[seed] Error seeding products:', err);
  }
}
