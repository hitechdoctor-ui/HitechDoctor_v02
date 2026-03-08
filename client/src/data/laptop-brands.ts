export interface LaptopBrand {
  name: string;
  slug: string;
  seriesLabel: string;
  tag?: string;
  screenPriceFrom: number;
  batteryPriceFrom: number;
  keyboardPriceFrom: number;
  thermalPrice: number;
  portPriceFrom: number;
  upgradeLabor: number;
  color: string;
  accentClass: string;
  badgeClass: string;
  iconColor: string;
}

export const LAPTOP_BRANDS: LaptopBrand[] = [
  {
    name: "Apple MacBook",
    slug: "apple-macbook",
    seriesLabel: "MacBook Air · MacBook Pro · MacBook",
    tag: "Premium",
    screenPriceFrom: 200,
    batteryPriceFrom: 120,
    keyboardPriceFrom: 150,
    thermalPrice: 55,
    portPriceFrom: 80,
    upgradeLabor: 0,
    color: "#9ca3af",
    accentClass: "border-gray-500/30 bg-gray-500/8",
    badgeClass: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    iconColor: "text-gray-300",
  },
  {
    name: "Dell",
    slug: "dell",
    seriesLabel: "Inspiron · XPS · Latitude · Vostro",
    screenPriceFrom: 70,
    batteryPriceFrom: 60,
    keyboardPriceFrom: 50,
    thermalPrice: 40,
    portPriceFrom: 55,
    upgradeLabor: 25,
    color: "#3b82f6",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    iconColor: "text-blue-400",
  },
  {
    name: "HP",
    slug: "hp",
    seriesLabel: "Pavilion · EliteBook · ProBook · ENVY",
    screenPriceFrom: 70,
    batteryPriceFrom: 60,
    keyboardPriceFrom: 45,
    thermalPrice: 40,
    portPriceFrom: 50,
    upgradeLabor: 25,
    color: "#06b6d4",
    accentClass: "border-cyan-500/30 bg-cyan-500/8",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    iconColor: "text-cyan-400",
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    seriesLabel: "ThinkPad · IdeaPad · Legion · Yoga",
    screenPriceFrom: 75,
    batteryPriceFrom: 65,
    keyboardPriceFrom: 55,
    thermalPrice: 40,
    portPriceFrom: 50,
    upgradeLabor: 25,
    color: "#ef4444",
    accentClass: "border-red-500/30 bg-red-500/8",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    iconColor: "text-red-400",
  },
  {
    name: "ASUS",
    slug: "asus",
    seriesLabel: "VivoBook · ZenBook · ROG · TUF",
    screenPriceFrom: 80,
    batteryPriceFrom: 65,
    keyboardPriceFrom: 55,
    thermalPrice: 40,
    portPriceFrom: 55,
    upgradeLabor: 25,
    color: "#f97316",
    accentClass: "border-orange-500/30 bg-orange-500/8",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    iconColor: "text-orange-400",
  },
  {
    name: "Acer",
    slug: "acer",
    seriesLabel: "Aspire · Swift · Nitro · Predator",
    screenPriceFrom: 65,
    batteryPriceFrom: 55,
    keyboardPriceFrom: 45,
    thermalPrice: 35,
    portPriceFrom: 48,
    upgradeLabor: 25,
    color: "#22c55e",
    accentClass: "border-green-500/30 bg-green-500/8",
    badgeClass: "border-green-500/30 bg-green-500/10 text-green-400",
    iconColor: "text-green-400",
  },
];

export function findLaptopBrandBySlug(s: string): LaptopBrand | undefined {
  return LAPTOP_BRANDS.find((b) => b.slug === s);
}
