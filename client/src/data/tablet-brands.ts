export interface TabletBrand {
  name: string;
  slug: string;
  seriesLabel: string;
  tag?: string;
  screenPriceFrom: number;
  batteryPriceFrom: number;
  portPriceFrom: number;
  backGlassPriceFrom: number;
  color: string;
  accentClass: string;
  badgeClass: string;
  iconColor: string;
}

export const TABLET_BRANDS: TabletBrand[] = [
  {
    name: "Apple iPad",
    slug: "apple-ipad",
    seriesLabel: "iPad mini · iPad Air · iPad · iPad Pro",
    tag: "Premium",
    screenPriceFrom: 90,
    batteryPriceFrom: 80,
    portPriceFrom: 55,
    backGlassPriceFrom: 70,
    color: "#9ca3af",
    accentClass: "border-gray-500/30 bg-gray-500/8",
    badgeClass: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    iconColor: "text-gray-300",
  },
  {
    name: "Samsung Galaxy Tab",
    slug: "samsung-galaxy-tab",
    seriesLabel: "Galaxy Tab A · Tab S · Tab S9 · Tab S10",
    screenPriceFrom: 75,
    batteryPriceFrom: 70,
    portPriceFrom: 45,
    backGlassPriceFrom: 55,
    color: "#3b82f6",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    iconColor: "text-blue-400",
  },
  {
    name: "Lenovo Tab",
    slug: "lenovo-tab",
    seriesLabel: "Tab P · Tab M · Tab P11 · Tab P12",
    screenPriceFrom: 60,
    batteryPriceFrom: 55,
    portPriceFrom: 40,
    backGlassPriceFrom: 45,
    color: "#ef4444",
    accentClass: "border-red-500/30 bg-red-500/8",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    iconColor: "text-red-400",
  },
  {
    name: "Huawei MatePad",
    slug: "huawei-matepad",
    seriesLabel: "MatePad · MatePad Pro · MatePad 11 · MediaPad",
    screenPriceFrom: 80,
    batteryPriceFrom: 70,
    portPriceFrom: 45,
    backGlassPriceFrom: 55,
    color: "#ef4444",
    accentClass: "border-rose-500/30 bg-rose-500/8",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    iconColor: "text-rose-400",
  },
];

export function findTabletBrandBySlug(s: string): TabletBrand | undefined {
  return TABLET_BRANDS.find((b) => b.slug === s);
}
