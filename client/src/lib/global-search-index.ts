/**
 * Ίδια λογική ευρετηρίασης/ταιριάσματος με το Global Search (χωρίς React icons).
 * Χρησιμοποιείται από το client UI και από τον server (chat-repair) για εσωτερική αναζήτηση.
 */
import type { Product } from "@shared/schema";
import { SAMSUNG_SERIES } from "@/data/samsung-devices";
import { IPHONE_SERIES } from "@/data/iphone-devices";
import { XIAOMI_SERIES } from "@/data/xiaomi-devices";
import { HUAWEI_SERIES } from "@/data/huawei-devices";
import { ONEPLUS_SERIES } from "@/data/oneplus-devices";
import { LAPTOP_BRANDS } from "@/data/laptop-brands";
import { TABLET_BRANDS } from "@/data/tablet-brands";
import { DESKTOP_BRANDS } from "@/data/desktop-brands";
import { APPLE_WATCH_MODELS } from "@/data/apple-watch-models";
import { BLOG_POSTS } from "@/data/blog-posts";

export type GlobalSearchCategory =
  | "service"
  | "iphone"
  | "samsung"
  | "xiaomi"
  | "huawei"
  | "oneplus"
  | "tablet"
  | "laptop"
  | "desktop"
  | "watch"
  | "page"
  | "blog";

export type GlobalSearchIndexEntry = {
  name: string;
  href: string;
  sub: string;
  category: GlobalSearchCategory;
  keywords?: string;
};

/** Σειρά εμφάνισης ομαδοποιημένων κατηγοριών — ίδια με το `global-search.tsx`. */
export const GLOBAL_SEARCH_UI_CATEGORY_ORDER: GlobalSearchCategory[] = [
  "service",
  "iphone",
  "samsung",
  "page",
  "blog",
];

const MAX_PER_CATEGORY = 4;

export function buildGlobalSearchIndex(): GlobalSearchIndexEntry[] {
  const entries: GlobalSearchIndexEntry[] = [];

  entries.push(
    { name: "Επισκευή iPhone", href: "/services/episkeui-iphone", sub: "Όλα τα μοντέλα iPhone", category: "service" },
    { name: "IPSW Download", href: "/services/ipsw-download", sub: "Επίσημα firmware .ipsw για iPhone", category: "service", keywords: "ipsw firmware restore ios" },
    { name: "IMEI Check", href: "/services/imei-check", sub: "Έλεγχος IMEI — Model, iCloud, Warranty", category: "service", keywords: "imei check icloud" },
    { name: "Αποστολή Συσκευής (BoxNow)", href: "/services/apostoli-syskevis", sub: "Locker, στοιχεία & κωδικός αναφοράς", category: "service", keywords: "boxnow locker αποστολη δεμα courier" },
    { name: "Expert Hub (Apple)", href: "/apple-service", sub: "Firmware, εργαλεία IMEI, οδηγοί", category: "page", keywords: "apple hub expert support" },
    { name: "Επισκευή Samsung Galaxy", href: "/services/episkeui-samsung", sub: "A · S · Z Series", category: "service", keywords: "samsung galaxy" },
    { name: "Επισκευή Xiaomi / Redmi / Poco", href: "/services/episkeui-xiaomi", sub: "Redmi Note · Redmi · Xiaomi · Poco", category: "service", keywords: "xiaomi redmi poco" },
    { name: "Επισκευή Huawei", href: "/services/episkeui-huawei", sub: "P · Mate · Nova · Y Series", category: "service", keywords: "huawei p mate nova" },
    { name: "Επισκευή OnePlus", href: "/services/episkeui-oneplus", sub: "Flagship · Nord Series", category: "service", keywords: "oneplus nord" },
    { name: "Επισκευή Κινητών", href: "/services/episkeui-kiniton", sub: "iPhone · Samsung · Xiaomi", category: "service" },
    { name: "Επισκευή Laptop", href: "/services", sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Tablet", href: "/services", sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή PlayStation", href: "/services", sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Υπολογιστή", href: "/services", sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Apple Watch", href: "/services/episkeui-apple-watch", sub: "Touch & Μπαταρία · Series 3-Ultra 2", category: "watch" },
  );

  entries.push(
    { name: "Σχετικά με εμάς", href: "/sxetika-me-mas", sub: "Η ιστορία μας", category: "page" },
    { name: "Επικοινωνία", href: "/contact", sub: "Τηλέφωνο & Διεύθυνση", category: "page" },
    { name: "Συχνές Ερωτήσεις (FAQ)", href: "/faq", sub: "Απαντήσεις σε ερωτήσεις", category: "page" },
    { name: "eShop", href: "/eshop", sub: "Αξεσουάρ · Κινητά · Laptops", category: "page" },
    { name: "Blog — Συμβουλές & Οδηγοί", href: "/blog", sub: "Άρθρα για κινητά & επισκευή", category: "page" },
    { name: "Τρόποι Πληρωμής", href: "/tropoi-pliromis", sub: "Κάρτα · Μετρητά · Δόσεις", category: "page" },
    { name: "Πολιτική Επιστροφών", href: "/politiki-epistrofon", sub: "eShop & υπαναχώρηση 14 ημερών", category: "page", keywords: "επιστροφη χρηματα υπαναχωρηση εγγυηση αγορας" },
    { name: "Όροι Χρήσης", href: "/oroi-chrisis", sub: "Ιστότοπος & eShop", category: "page", keywords: "terms χρηση site eshop" },
    { name: "Όροι Επισκευής", href: "/oroi-episkeuis", sub: "Τεχνικός έλεγχος & συσκευή", category: "page", keywords: "gdpr συσκευη επισκευη οροι" },
  );

  for (const series of IPHONE_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-iphone/${model.slug}`,
        sub: `Οθόνη από €${model.screenTiers[2].price} · Μπαταρία από €${model.batteryTiers[2].price}`,
        category: "iphone",
        keywords: `iphone ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  for (const series of SAMSUNG_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-samsung/${model.slug}`,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "samsung",
        keywords: `samsung galaxy ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  for (const series of XIAOMI_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-xiaomi/${model.slug}`,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "xiaomi",
        keywords: `xiaomi redmi poco ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  for (const series of HUAWEI_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-huawei/${model.slug}`,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "huawei",
        keywords: `huawei ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  for (const series of ONEPLUS_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-oneplus/${model.slug}`,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "oneplus",
        keywords: `oneplus ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  for (const brand of TABLET_BRANDS) {
    entries.push({
      name: `Επισκευή ${brand.name}`,
      href: `/episkevi-tablet/${brand.slug}`,
      sub: `Tablet · ${brand.seriesLabel}`,
      category: "tablet",
      keywords: `tablet ${brand.name.toLowerCase()} επισκευη αλλαγη οθονη μπαταρια φορτιση`,
    });
  }
  entries.push({
    name: "Επισκευή Tablet — Όλες οι Μάρκες",
    href: "/services/episkeui-tablet",
    sub: "Tablet · iPad, Samsung Tab, Lenovo, Huawei",
    category: "tablet",
    keywords: "tablet επισκευη ipad samsung tab lenovo huawei αλλαγη οθονη μπαταρια",
  });

  for (const brand of LAPTOP_BRANDS) {
    entries.push({
      name: `Επισκευή ${brand.name}`,
      href: `/episkevi-laptop/${brand.slug}`,
      sub: `Laptop · ${brand.seriesLabel}`,
      category: "laptop",
      keywords: `laptop ${brand.name.toLowerCase()} επισκευη αλλαγη οθονη μπαταρια πληκτρολογιο`,
    });
  }
  entries.push({
    name: "Επισκευή Laptop — Όλες οι Μάρκες",
    href: "/services/episkeui-laptop",
    sub: "Laptop · MacBook, Dell, HP, Lenovo, ASUS, Acer",
    category: "laptop",
    keywords: "laptop επισκευη macbook dell hp lenovo asus acer αλλαγη οθονη μπαταρια πληκτρολογιο",
  });

  for (const brand of DESKTOP_BRANDS) {
    entries.push({
      name: `Επισκευή ${brand.name}`,
      href: `/episkevi-desktop/${brand.slug}`,
      sub: `Desktop · ${brand.seriesLabel}`,
      category: "desktop",
      keywords: `desktop pc υπολογιστης ${brand.name.toLowerCase()} επισκευη αναβαθμιση ram ssd τροφοδοτικο windows`,
    });
  }
  entries.push({
    name: "Επισκευή Desktop — Όλες οι Κατηγορίες",
    href: "/services/episkeui-desktop",
    sub: "Desktop · Dell, HP, Lenovo, iMac, Custom PC",
    category: "desktop",
    keywords: "desktop υπολογιστης επισκευη αναβαθμιση ram ssd psu τροφοδοτικο windows imac gaming pc",
  });

  for (const model of APPLE_WATCH_MODELS) {
    entries.push({
      name: `Επισκευή ${model.name}`,
      href: "/services/episkeui-apple-watch",
      sub: `Apple Watch · ${model.sizes} · Touch από €${model.touchPriceFrom} · Μπαταρία €${model.batteryPriceFrom}`,
      category: "watch",
      keywords: `apple watch ${model.name.toLowerCase()} επισκευη touch μπαταρια αλλαγη τζαμι`,
    });
  }

  for (const post of BLOG_POSTS) {
    entries.push({
      name: post.title,
      href: `/blog/${post.slug}`,
      sub: `Blog · ${post.category}`,
      category: "blog",
      keywords: post.title.toLowerCase(),
    });
  }

  return entries;
}

/** Ίδιο φίλτρο προϊόντων eShop με το Global Search. */
export function matchProductsForGlobalSearch(products: Product[], q: string): Product[] {
  const ql = q.trim().toLowerCase();
  if (ql.length < 1) return [];
  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        p.description.toLowerCase().includes(ql) ||
        p.slug?.toLowerCase().includes(ql) ||
        (p.subcategory ?? "").toLowerCase().includes(ql) ||
        p.category.toLowerCase().includes(ql)
    )
    .slice(0, 5);
}

export function groupMatchedEntries(
  entries: GlobalSearchIndexEntry[],
  q: string,
  maxPerCategory = MAX_PER_CATEGORY
): Record<string, GlobalSearchIndexEntry[]> {
  const ql = q.trim().toLowerCase();
  const grouped: Record<string, GlobalSearchIndexEntry[]> = {};
  if (ql.length < 1) return grouped;
  for (const entry of entries) {
    const searchable = `${entry.name} ${entry.sub} ${entry.keywords ?? ""}`.toLowerCase();
    if (!searchable.includes(ql)) continue;
    if (!grouped[entry.category]) grouped[entry.category] = [];
    if (grouped[entry.category].length < maxPerCategory) {
      grouped[entry.category].push(entry);
    }
  }
  return grouped;
}

/**
 * Τα πρώτα N αποτελέσματα με την ίδια σειρά με το dropdown: πρώτα eShop (έως 5),
 * μετά οι κατηγορίες κατά `GLOBAL_SEARCH_UI_CATEGORY_ORDER`.
 */
export function getGlobalSearchTopResults(
  products: Product[],
  index: GlobalSearchIndexEntry[],
  q: string,
  maxTotal: number,
  categoryOrder: readonly GlobalSearchCategory[] = GLOBAL_SEARCH_UI_CATEGORY_ORDER
): Array<{ kind: "product"; product: Product } | { kind: "entry"; entry: GlobalSearchIndexEntry }> {
  const matchedProducts = matchProductsForGlobalSearch(products, q);
  const grouped = groupMatchedEntries(index, q, MAX_PER_CATEGORY);
  const out: Array<{ kind: "product"; product: Product } | { kind: "entry"; entry: GlobalSearchIndexEntry }> = [];

  for (const p of matchedProducts) {
    if (out.length >= maxTotal) break;
    out.push({ kind: "product", product: p });
  }
  for (const cat of categoryOrder) {
    const arr = grouped[cat];
    if (!arr) continue;
    for (const e of arr) {
      if (out.length >= maxTotal) break;
      out.push({ kind: "entry", entry: e });
    }
  }
  return out;
}

/** Slug μοντέλου από href επισκευής (για repair_price_overrides + /repair/{slug}). */
export function extractRepairModelSlugFromHref(href: string): string | null {
  const patterns = [
    /^\/episkevi-iphone\/([^/?#]+)/,
    /^\/episkevi-samsung\/([^/?#]+)/,
    /^\/episkevi-xiaomi\/([^/?#]+)/,
    /^\/episkevi-huawei\/([^/?#]+)/,
    /^\/episkevi-oneplus\/([^/?#]+)/,
    /^\/episkevi-laptop\/([^/?#]+)/,
    /^\/episkevi-tablet\/([^/?#]+)/,
    /^\/episkevi-desktop\/([^/?#]+)/,
  ];
  for (const re of patterns) {
    const m = href.match(re);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}
