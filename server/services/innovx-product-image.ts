import { readFileSync } from "node:fs";
import path from "node:path";
import type { Product } from "@shared/schema";
import type { InnovxDeviceCategory } from "./innovx-parser";

export type InnovxImageSource = "email" | "slug" | "name" | "placeholder";

export interface InnovxResolvedImage {
  imageUrl: string;
  source: InnovxImageSource;
}

export interface InnovxImageIndex {
  bySlug: Map<string, string>;
  byName: Map<string, string>;
}

const PLACEHOLDER_BY_CATEGORY: Record<InnovxDeviceCategory, string> = {
  mobile: "/images/refurbished-othones-iphone.png",
  tablet: "/og-image.png",
  smartwatch: "/og-image.png",
  accessory: "/og-image.png",
};

const DEFAULT_PLACEHOLDER = "/og-image.png";

let seedImageBySlug: Map<string, string> | null = null;

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function loadSeedImageBySlug(): Map<string, string> {
  if (seedImageBySlug) return seedImageBySlug;

  seedImageBySlug = new Map();
  try {
    const filePath = path.join(process.cwd(), "server/seed-data/products.json");
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as Array<{
      slug?: string;
      image_url?: string | null;
      name?: string;
    }>;

    for (const row of raw) {
      const url = row.image_url?.trim();
      if (!url) continue;
      if (row.slug) seedImageBySlug.set(row.slug, url);
      if (row.name) seedImageBySlug.set(`name:${normalizeName(row.name)}`, url);
    }
  } catch {
    // Seed file optional at runtime (e.g. production build without seed-data).
  }

  return seedImageBySlug;
}

/** Φτιάχνει ευρετήριο εικόνων από seed + υπάρχοντα προϊόντα DB (πριν τη διαγραφή Innovx). */
export function buildInnovxImageIndex(catalog: Product[]): InnovxImageIndex {
  const bySlug = new Map<string, string>();
  const byName = new Map<string, string>();

  for (const [slug, url] of loadSeedImageBySlug()) {
    if (slug.startsWith("name:")) {
      byName.set(slug.slice(5), url);
    } else {
      bySlug.set(slug, url);
    }
  }

  for (const product of catalog) {
    const url = product.imageUrl?.trim();
    if (!url) continue;
    if (product.slug) bySlug.set(product.slug, url);
    byName.set(normalizeName(product.name), url);
  }

  return { bySlug, byName };
}

function findIndexedImage(title: string, slug: string, index: InnovxImageIndex): string | null {
  const direct = index.bySlug.get(slug);
  if (direct) return direct;

  let best: { url: string; score: number } | null = null;
  for (const [seedSlug, url] of index.bySlug) {
    if (slug.includes(seedSlug) || seedSlug.includes(slug)) {
      const score = Math.min(slug.length, seedSlug.length);
      if (!best || score > best.score) best = { url, score };
    }
  }
  if (best) return best.url;

  const normTitle = normalizeName(title);
  const byExactName = index.byName.get(normTitle);
  if (byExactName) return byExactName;

  for (const [name, url] of index.byName) {
    if (normTitle.includes(name) || name.includes(normTitle)) {
      return url;
    }
  }

  return null;
}

function normalizeEmailImageUrl(raw?: string | null): string | null {
  const url = raw?.trim();
  if (!url || url.startsWith("cid:")) return null;
  return url;
}

/** Επιλύει εικόνα προϊόντος Innovx: email → catalog/seed → placeholder ανά κατηγορία. */
export function resolveInnovxProductImage(params: {
  title: string;
  slug: string;
  deviceCategory: InnovxDeviceCategory;
  emailImageUrl?: string | null;
  imageIndex: InnovxImageIndex;
}): InnovxResolvedImage {
  const emailImage = normalizeEmailImageUrl(params.emailImageUrl);
  if (emailImage) {
    return { imageUrl: emailImage, source: "email" };
  }

  const indexed = findIndexedImage(params.title, params.slug, params.imageIndex);
  if (indexed) {
    const source = params.imageIndex.bySlug.has(params.slug) ? "slug" : "name";
    return { imageUrl: indexed, source };
  }

  return {
    imageUrl: PLACEHOLDER_BY_CATEGORY[params.deviceCategory] ?? DEFAULT_PLACEHOLDER,
    source: "placeholder",
  };
}
