import {
  DEFAULT_PAGE_SEO,
  STATIC_PAGE_SEO,
  normalizeSeoPath,
  staticSeoToPageMeta,
  type PageSeoMeta,
} from "@shared/seo-meta";
import { findDesktopBrandBySlug } from "../client/src/data/desktop-brands";
import { findHuaweiBySlug } from "../client/src/data/huawei-devices";
import { findModelBySlug } from "../client/src/data/iphone-devices";
import { findLaptopBrandBySlug } from "../client/src/data/laptop-brands";
import { findOnePlusBySlug } from "../client/src/data/oneplus-devices";
import { findSamsungBySlug } from "../client/src/data/samsung-devices";
import { findTabletBrandBySlug } from "../client/src/data/tablet-brands";
import { findXiaomiBySlug } from "../client/src/data/xiaomi-devices";
import { BLOG_POSTS } from "../client/src/data/blog-posts";
import type { IStorage } from "./storage";

type RepairRoute = {
  prefix: string;
  label: string;
  finder: (slug: string) => { name: string } | null | undefined;
};

const REPAIR_ROUTES: RepairRoute[] = [
  { prefix: "/episkevi-iphone/", label: "iPhone", finder: findModelBySlug },
  { prefix: "/episkevi-v2-iphone/", label: "iPhone", finder: findModelBySlug },
  { prefix: "/episkevi-samsung/", label: "Samsung", finder: findSamsungBySlug },
  { prefix: "/episkevi-xiaomi/", label: "Xiaomi", finder: findXiaomiBySlug },
  { prefix: "/episkevi-huawei/", label: "Huawei", finder: findHuaweiBySlug },
  { prefix: "/episkevi-oneplus/", label: "OnePlus", finder: findOnePlusBySlug },
  { prefix: "/episkevi-laptop/", label: "Laptop", finder: findLaptopBrandBySlug },
  { prefix: "/episkevi-tablet/", label: "Tablet", finder: findTabletBrandBySlug },
  { prefix: "/episkevi-desktop/", label: "Desktop", finder: findDesktopBrandBySlug },
];

function resolveRepairSeo(path: string, siteOrigin: string): PageSeoMeta | null {
  for (const route of REPAIR_ROUTES) {
    if (!path.startsWith(route.prefix)) continue;
    const slug = path.slice(route.prefix.length);
    if (!slug || slug.includes("/")) continue;
    const device = route.finder(slug);
    if (!device) continue;
    return {
      title: `Επισκευή ${route.label} ${device.name}`,
      description: `Επισκευή ${device.name} στο HiTech Doctor Μοσχάτο. Οθόνη, μπαταρία, θύρες. Γρήγορα, με γραπτή εγγύηση.`,
      url: `${siteOrigin}${path}`,
    };
  }
  return null;
}

export async function resolvePageSeo(
  pathname: string,
  siteOrigin: string,
  storage?: IStorage,
): Promise<PageSeoMeta> {
  const path = normalizeSeoPath(pathname);

  const staticEntry = STATIC_PAGE_SEO[path];
  if (staticEntry) return staticSeoToPageMeta(staticEntry, path, siteOrigin);

  const repairMeta = resolveRepairSeo(path, siteOrigin);
  if (repairMeta) return repairMeta;

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const post = BLOG_POSTS.find((p) => p.slug === blogMatch[1]);
    if (post) {
      return {
        title: post.title,
        description: post.excerpt,
        image: post.image,
        type: "article",
        url: `${siteOrigin}${path}`,
      };
    }
  }

  const eshopMatch = path.match(/^\/eshop\/([^/]+)$/);
  if (eshopMatch && storage) {
    const product = await storage.getProductBySlug(eshopMatch[1]!);
    if (product) {
      const desc =
        product.description?.slice(0, 158) ||
        `${product.name} — αγορά online από το HiTech Doctor eShop.`;
      return {
        title: product.name,
        description: desc,
        image: product.imageUrl ?? undefined,
        type: "product",
        url: `${siteOrigin}${path}`,
      };
    }
  }

  return staticSeoToPageMeta(DEFAULT_PAGE_SEO, path, siteOrigin);
}
