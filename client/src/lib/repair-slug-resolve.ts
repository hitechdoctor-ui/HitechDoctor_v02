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
