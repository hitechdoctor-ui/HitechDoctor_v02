#!/usr/bin/env tsx
/**
 * Update iPhone 18 Pro Max products with correct images and descriptions
 */

import 'dotenv/config';
import { db } from '../server/db.js';
import { products } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import rawData from '../server/seed-data/products.json' assert { type: 'json' };

async function updateIPhone18ProMax() {
  try {
    console.log('🔄 Updating iPhone 18 Pro Max products...\n');
    
    // Find the products in seed data
    const iphone18ProMaxProducts = rawData.filter((p: any) => 
      p.name.includes('iPhone 18 Pro Max') && 
      (p.name.includes('Black') || p.name.includes('Glacier'))
    );
    
    console.log(`Found ${iphone18ProMaxProducts.length} products in seed data\n`);
    
    for (const seedProduct of iphone18ProMaxProducts as any[]) {
      console.log(`📝 Updating: ${seedProduct.name}`);
      
      // Find existing product by name
      const existing = await db.select()
        .from(products)
        .where(eq(products.name, seedProduct.name))
        .limit(1);
      
      if (existing.length === 0) {
        console.log(`  ➕ Product not found, inserting...`);
        await db.insert(products).values({
          name: seedProduct.name,
          description: seedProduct.description,
          fullDescription: seedProduct.full_description,
          price: String(seedProduct.price),
          category: seedProduct.category,
          subcategory: seedProduct.subcategory || null,
          slug: seedProduct.slug,
          imageUrl: seedProduct.images?.[0] || null,
          images: seedProduct.images || null,
          brand: seedProduct.brand,
          color: seedProduct.color,
          storage: seedProduct.storage,
          variantGroup: seedProduct.variant_group,
          hidePriceComparison: seedProduct.hide_price_comparison || false,
          preOrder: false,
          compatibleModels: null,
          ram: '12GB',
        });
        console.log(`  ✅ Inserted\n`);
      } else {
        console.log(`  🔄 Product exists (ID: ${existing[0].id}), updating...`);
        await db.update(products)
          .set({
            description: seedProduct.description,
            fullDescription: seedProduct.full_description,
            price: String(seedProduct.price),
            imageUrl: seedProduct.images?.[0] || null,
            images: seedProduct.images || null,
            variantGroup: seedProduct.variant_group,
            hidePriceComparison: seedProduct.hide_price_comparison || false,
            ram: '12GB',
          })
          .where(eq(products.id, existing[0].id));
        console.log(`  ✅ Updated\n`);
      }
    }
    
    console.log('✅ All iPhone 18 Pro Max products updated successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateIPhone18ProMax();
