import type { Express, RequestHandler } from "express";
import removedSlugs from "./removed-eshop-slugs.json";
import { storage } from "./storage";

const REMOVED_ESHOP_SLUGS = new Set(
  (removedSlugs as string[]).map((s) => s.trim().toLowerCase()).filter(Boolean),
);

export function isRemovedEshopSlug(slug: string): boolean {
  return REMOVED_ESHOP_SLUGS.has(slug.trim().toLowerCase());
}

/** Καθορίζει HTTP status για σελίδα προϊόντος πριν το SPA (SEO: όχι 200 σε διαγραμμένα SKU). */
export async function resolveEshopProductHttpStatus(
  slug: string,
): Promise<200 | 404 | 410> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return 404;
  if (isRemovedEshopSlug(normalized)) return 410;
  const product = await storage.getProductBySlug(normalized);
  return product ? 200 : 404;
}

const eshopSlugHandler: RequestHandler = async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : "";
  if (!slug) return next();

  if (/^\d+$/.test(slug)) {
    const id = Number.parseInt(slug, 10);
    const byId = await storage.getProduct(id);
    if (byId?.slug) {
      res.locals.spaHttpStatus = 410;
      return next();
    }
    res.locals.spaHttpStatus = 404;
    return next();
  }

  const status = await resolveEshopProductHttpStatus(slug);
  if (status !== 200) res.locals.spaHttpStatus = status;
  next();
};

/** GET/HEAD `/eshop/:slug` — 410 για διαγραμμένα catalog SKU, 404 αν δεν υπάρχει. */
export function registerEshopProductHttpStatus(app: Express): void {
  app.get("/eshop/:slug", eshopSlugHandler);
  app.head("/eshop/:slug", eshopSlugHandler);
}
