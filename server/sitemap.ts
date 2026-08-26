import { findDesktopBrandBySlug } from "../client/src/data/desktop-brands";
import { findHuaweiBySlug } from "../client/src/data/huawei-devices";
import { findModelBySlug } from "../client/src/data/iphone-devices";
import { findLaptopBrandBySlug } from "../client/src/data/laptop-brands";
import { findOnePlusBySlug } from "../client/src/data/oneplus-devices";
import { findSamsungBySlug } from "../client/src/data/samsung-devices";
import { findTabletBrandBySlug } from "../client/src/data/tablet-brands";
import { findXiaomiBySlug } from "../client/src/data/xiaomi-devices";
import type { Product } from "@shared/schema";

/** Ίδιο origin με τα canonical `<link>` στις σελίδες (χωρίς www, χωρίς trailing slash). */
export const CANONICAL_SITE_ORIGIN = "https://hitechdoctor.com";

export function getCanonicalSiteOrigin(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.VITE_SITE_URL ||
    CANONICAL_SITE_ORIGIN;
  return raw.replace(/\/$/, "").trim();
}

/** Κανονικοποίηση path: leading slash, χωρίς trailing slash (εκτός από `/`). */
export function normalizeSitemapPath(pathname: string): string {
  let p = pathname.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

const PRIVATE_PATH_PREFIXES = ["/admin", "/auth", "/account", "/checkout", "/api"] as const;

/** Μόνο δημόσιες διαδρομές — ποτέ admin/auth/checkout/api. */
export function isPublicSitemapPath(pathname: string): boolean {
  const p = normalizeSitemapPath(pathname);
  for (const prefix of PRIVATE_PATH_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return false;
  }
  return true;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function collectModelSlugs(series: readonly { models?: readonly { slug?: string }[] }[]): string[] {
  return (series ?? []).flatMap((s) =>
    (s.models ?? [])
      .map((m) => m.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0),
  );
}

function uniqueSorted(paths: string[]): string[] {
  return Array.from(new Set(paths.map(normalizeSitemapPath))).sort((a, b) => a.localeCompare(b, "el"));
}

export async function buildPublicSitemapPaths(getProducts: () => Promise<Product[]>): Promise<string[]> {
  const staticPaths = [
    "/",
    "/services",
    "/services/episkeui-iphone",
    "/services/episkeui-samsung",
    "/services/episkeui-xiaomi",
    "/services/episkeui-huawei",
    "/services/episkeui-oneplus",
    "/services/episkeui-kiniton",
    "/services/episkeui-laptop",
    "/services/episkeui-tablet",
    "/services/episkeui-desktop",
    "/services/episkeui-apple-watch",
    "/services/episkeui-playstation",
    "/services/imei-check",
    "/services/ipsw-download",
    "/services/apostoli-syskevis",
    "/tools/screen-protector-checker",
    "/eshop-home",
    "/eshop",
    "/blog",
    "/check-status",
    "/contact",
    "/sxetika-me-mas",
    "/faq",
    "/tropoi-pliromis",
    "/oroi-episkeuis",
    "/politiki-cookies",
    "/politiki-epistrofon",
    "/oroi-chrisis",
    "/prosvassimotita",
    "/apple-service",
    "/web-designer",
    "/portfolio/hydrofix-gr",
    "/portfolio/regalo-gr",
    "/portfolio/louloudotopos",
    "/portfolio/bsnaomi-gr",
    "/portfolio/theatrehood-gr",
    "/portfolio/ath-ecs-gr",
    "/portfolio/nikosapost-gr",
    "/portfolio/metamorfosi-moschato-gr",
  ];

  const [
    { IPHONE_SERIES },
    { SAMSUNG_SERIES },
    { XIAOMI_SERIES },
    { HUAWEI_SERIES },
    { ONEPLUS_SERIES },
    { LAPTOP_BRANDS },
    { TABLET_BRANDS },
    { DESKTOP_BRANDS },
  ] = await Promise.all([
    import("../client/src/data/iphone-devices"),
    import("../client/src/data/samsung-devices"),
    import("../client/src/data/xiaomi-devices"),
    import("../client/src/data/huawei-devices"),
    import("../client/src/data/oneplus-devices"),
    import("../client/src/data/laptop-brands"),
    import("../client/src/data/tablet-brands"),
    import("../client/src/data/desktop-brands"),
  ]);

  const repairPaths = [
    ...collectModelSlugs(IPHONE_SERIES ?? [])
      .filter((slug) => findModelBySlug(slug) != null)
      .map((slug) => `/episkevi-iphone/${slug}`),
    ...collectModelSlugs(SAMSUNG_SERIES ?? [])
      .filter((slug) => findSamsungBySlug(slug) != null)
      .map((slug) => `/episkevi-samsung/${slug}`),
    ...collectModelSlugs(XIAOMI_SERIES ?? [])
      .filter((slug) => findXiaomiBySlug(slug) != null)
      .map((slug) => `/episkevi-xiaomi/${slug}`),
    ...collectModelSlugs(HUAWEI_SERIES ?? [])
      .filter((slug) => findHuaweiBySlug(slug) != null)
      .map((slug) => `/episkevi-huawei/${slug}`),
    ...collectModelSlugs(ONEPLUS_SERIES ?? [])
      .filter((slug) => findOnePlusBySlug(slug) != null)
      .map((slug) => `/episkevi-oneplus/${slug}`),
    ...(LAPTOP_BRANDS ?? [])
      .map((b) => b.slug)
      .filter((slug) => typeof slug === "string" && slug.trim().length > 0 && findLaptopBrandBySlug(slug) != null)
      .map((slug) => `/episkevi-laptop/${slug}`),
    ...(TABLET_BRANDS ?? [])
      .map((b) => b.slug)
      .filter((slug) => typeof slug === "string" && slug.trim().length > 0 && findTabletBrandBySlug(slug) != null)
      .map((slug) => `/episkevi-tablet/${slug}`),
    ...(DESKTOP_BRANDS ?? [])
      .map((b) => b.slug)
      .filter((slug) => typeof slug === "string" && slug.trim().length > 0 && findDesktopBrandBySlug(slug) != null)
      .map((slug) => `/episkevi-desktop/${slug}`),
  ];

  const { BLOG_POSTS } = await import("../client/src/data/blog-posts");
  const blogSlugs = new Set(
    (BLOG_POSTS ?? [])
      .map((p) => p.slug?.trim())
      .filter((slug): slug is string => !!slug),
  );
  const blogPaths = [...blogSlugs].map((slug) => `/blog/${slug}`);

  const products = await getProducts();
  const productPaths = (products ?? [])
    .map((p) => p.slug?.trim())
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug) => `/eshop/${slug}`);

  return uniqueSorted([...staticPaths, ...repairPaths, ...blogPaths, ...productPaths]).filter(
    isPublicSitemapPath,
  );
}

export async function buildSitemapXml(getProducts: () => Promise<Product[]>): Promise<string> {
  const origin = getCanonicalSiteOrigin();
  const paths = await buildPublicSitemapPaths(getProducts);

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${escXml(`${origin}${p}`)}</loc></url>`).join("\n") +
    `\n</urlset>\n`
  );
}
