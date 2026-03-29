import { allModels } from "@/data/iphone-devices";
import { allSamsungModels } from "@/data/samsung-devices";
import { allXiaomiModels } from "@/data/xiaomi-devices";
import { allHuaweiModels } from "@/data/huawei-devices";
import { allOnePlusModels } from "@/data/oneplus-devices";
import { LAPTOP_BRANDS } from "@/data/laptop-brands";
import { TABLET_BRANDS } from "@/data/tablet-brands";
import { DESKTOP_BRANDS } from "@/data/desktop-brands";

/**
 * Επιστρέφει το path σελίδας επισκευής για ένα slug μοντέλου/μάρκας, ή null.
 * Σειρά: κινητά (iPhone, Samsung, …) → laptop brands → tablet → desktop.
 * Αν το ίδιο slug υπάρχει σε laptop & desktop (π.χ. dell), προτιμάται laptop.
 */
export function resolveRepairSlugToPath(slug: string): string | null {
  const s = slug.trim();
  if (!s) return null;

  for (const m of allModels()) {
    if (m.slug === s) return `/episkevi-iphone/${s}`;
  }
  for (const m of allSamsungModels()) {
    if (m.slug === s) return `/episkevi-samsung/${s}`;
  }
  for (const m of allXiaomiModels()) {
    if (m.slug === s) return `/episkevi-xiaomi/${s}`;
  }
  for (const m of allHuaweiModels()) {
    if (m.slug === s) return `/episkevi-huawei/${s}`;
  }
  for (const m of allOnePlusModels()) {
    if (m.slug === s) return `/episkevi-oneplus/${s}`;
  }

  if (LAPTOP_BRANDS.some((b) => b.slug === s)) return `/episkevi-laptop/${s}`;
  if (TABLET_BRANDS.some((b) => b.slug === s)) return `/episkevi-tablet/${s}`;
  if (DESKTOP_BRANDS.some((b) => b.slug === s)) return `/episkevi-desktop/${s}`;

  return null;
}

/** Αφαιρεί επίθημα βλάβης από slug τύπου `samsung-a56-screen` → `samsung-a56` */
export function stripRepairServiceSuffixes(slug: string): string {
  let s = slug.trim().toLowerCase();
  let prev = "";
  const re = /-(screen|battery|display|port|service|back-glass|charging|camera|speaker|mic|lcd|touch|glass|water|other)$/i;
  while (s !== prev) {
    prev = s;
    s = s.replace(re, "");
  }
  return s;
}

/** Δοκιμάζει το slug και παραλλαγές χωρίς επίθημα (για /repair/... από το chat). */
export function guessRepairSlugCandidates(slug: string): string[] {
  const s = slug.trim().toLowerCase();
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (x: string) => {
    if (!x || seen.has(x)) return;
    seen.add(x);
    out.push(x);
  };
  push(s);
  let cur = s;
  for (let i = 0; i < 8; i++) {
    const next = stripRepairServiceSuffixes(cur);
    if (next === cur) break;
    push(next);
    cur = next;
  }
  return out;
}

/** Πρώτο ταιριστό path σελίδας επισκευής ή null. */
export function resolveRepairSlugToPathWithFallbacks(slug: string): string | null {
  for (const candidate of guessRepairSlugCandidates(slug)) {
    const p = resolveRepairSlugToPath(candidate);
    if (p) return p;
  }
  return null;
}

const BRAND_LABEL: Record<string, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  samsung: "Samsung",
  galaxy: "Galaxy",
  xiaomi: "Xiaomi",
  redmi: "Redmi",
  poco: "POCO",
  huawei: "Huawei",
  oneplus: "OnePlus",
  apple: "Apple",
};

/** Εμφανίσιμο όνομα συσκευής από slug URL (π.χ. samsung-a56-screen → Samsung A56). */
export function decodeRepairSlugToDisplayName(slug: string): string {
  const base = stripRepairServiceSuffixes(slug);
  const parts = base.split("-").filter(Boolean);
  return parts
    .map((p) => {
      const low = p.toLowerCase();
      if (BRAND_LABEL[low]) return BRAND_LABEL[low];
      if (/^a\d{2,3}$/i.test(p)) return p.toUpperCase();
      if (/^\d+$/i.test(p)) return p;
      if (/^(pro|max|plus|mini|ultra|fe|e)$/i.test(p)) return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}
