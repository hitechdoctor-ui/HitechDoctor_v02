import { buildPublicSitemapPaths } from "../server/sitemap";
import removed from "../server/removed-eshop-slugs.json";
import seed from "../server/seed-data/products.json";
import type { Product } from "@shared/schema";

const products = seed as Product[];

const paths = await buildPublicSitemapPaths(
  async () => products,
  async () => {
    const m = new Map<string, { category: string; subcategory: string | null; count: number }>();
    for (const p of products) {
      const k = `${p.category}\0${p.subcategory ?? ""}`;
      const row = m.get(k) ?? { category: p.category, subcategory: p.subcategory ?? null, count: 0 };
      row.count += 1;
      m.set(k, row);
    }
    return [...m.values()];
  },
);

const productPaths = paths.filter((p) => p.startsWith("/eshop/"));
const removedSet = new Set((removed as string[]).map((s) => s.toLowerCase()));
const bad = productPaths.filter((p) => removedSet.has(p.slice("/eshop/".length).toLowerCase()));

console.log("product URLs in sitemap:", productPaths.length);
console.log("removed slugs leaked:", bad.length);
if (bad.length) {
  console.error(bad.slice(0, 10));
  process.exit(1);
}
console.log("eshop index paths:", paths.filter((p) => p.startsWith("/eshop")));
