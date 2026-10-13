#!/usr/bin/env tsx
/**
 * Update iPhone 18 Pro Max products with correct local images and descriptions.
 * Prefers seed rows that have /images/… (not placehold.co).
 */

import "dotenv/config";
import { db } from "../server/db.js";
import { products } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import rawData from "../server/seed-data/products.json" assert { type: "json" };

function isLocalImage(url: string | undefined | null): boolean {
  return typeof url === "string" && url.startsWith("/images/");
}

async function updateIPhone18ProMax() {
  try {
    console.log("🔄 Updating iPhone 18 Pro Max products...\n");

    const byName = new Map<string, any>();
    for (const p of rawData as any[]) {
      if (!p?.name?.includes("iPhone 18 Pro Max")) continue;
      if (!p.name.includes("Black") && !p.name.includes("Glacier")) continue;
      const img = p.image_url || p.images?.[0];
      const prev = byName.get(p.name);
      // Prefer entries with local gallery images
      if (!prev || (isLocalImage(img) && !isLocalImage(prev.image_url || prev.images?.[0]))) {
        byName.set(p.name, p);
      }
    }

    const list = Array.from(byName.values());
    console.log(`Found ${list.length} product(s) to sync\n`);

    for (const seedProduct of list) {
      console.log(`📝 Updating: ${seedProduct.name}`);
      const images: string[] = Array.isArray(seedProduct.images)
        ? seedProduct.images
        : seedProduct.image_url
          ? [seedProduct.image_url]
          : [];
      const imageUrl = seedProduct.image_url || images[0] || null;

      const existing = await db
        .select()
        .from(products)
        .where(eq(products.name, seedProduct.name))
        .limit(1);

      const values = {
        description: seedProduct.description,
        fullDescription: seedProduct.full_description ?? null,
        price: String(seedProduct.price),
        category: seedProduct.category,
        subcategory: seedProduct.subcategory || null,
        slug: seedProduct.slug,
        imageUrl,
        images: images.length ? images : null,
        brand: seedProduct.brand,
        color: seedProduct.color,
        storage: seedProduct.storage,
        variantGroup: seedProduct.variant_group ?? "device-catalog",
        hidePriceComparison: seedProduct.hide_price_comparison || false,
        preOrder: false,
        compatibleModels: null as string[] | null,
        ram: "12GB",
      };

      if (existing.length === 0) {
        console.log("  ➕ Inserting...");
        await db.insert(products).values(values);
        console.log("  ✅ Inserted\n");
      } else {
        console.log(`  🔄 Updating ID ${existing[0].id}...`);
        await db.update(products).set(values).where(eq(products.id, existing[0].id));
        console.log("  ✅ Updated\n");
      }
    }

    console.log("✅ iPhone 18 Pro Max products updated!");
  } catch (error) {
    console.error("❌ Error updating products:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateIPhone18ProMax();
