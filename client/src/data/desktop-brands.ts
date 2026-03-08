export interface DesktopBrand {
  name: string;
  slug: string;
  seriesLabel: string;
  tag?: string;
  ramUpgradeFrom: number;
  ssdUpgradeFrom: number;
  psuFrom: number;
  thermalPrice: number;
  osInstallFrom: number;
  virusRemovalFrom: number;
  motherboardDiagFrom: number;
  screenPriceFrom?: number;
  color: string;
  accentClass: string;
  badgeClass: string;
  iconColor: string;
  notes?: string;
}

export const DESKTOP_BRANDS: DesktopBrand[] = [
  {
    name: "Dell",
    slug: "dell",
    seriesLabel: "OptiPlex · Inspiron Desktop · XPS · Vostro",
    ramUpgradeFrom: 25,
    ssdUpgradeFrom: 25,
    psuFrom: 40,
    thermalPrice: 40,
    osInstallFrom: 50,
    virusRemovalFrom: 40,
    motherboardDiagFrom: 55,
    color: "#3b82f6",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    iconColor: "text-blue-400",
  },
  {
    name: "HP",
    slug: "hp",
    seriesLabel: "ProDesk · EliteDesk · Pavilion Desktop · OMEN",
    ramUpgradeFrom: 25,
    ssdUpgradeFrom: 25,
    psuFrom: 40,
    thermalPrice: 40,
    osInstallFrom: 50,
    virusRemovalFrom: 40,
    motherboardDiagFrom: 55,
    color: "#06b6d4",
    accentClass: "border-cyan-500/30 bg-cyan-500/8",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    iconColor: "text-cyan-400",
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    seriesLabel: "ThinkCentre · IdeaCentre · Legion Tower",
    ramUpgradeFrom: 25,
    ssdUpgradeFrom: 25,
    psuFrom: 40,
    thermalPrice: 40,
    osInstallFrom: 50,
    virusRemovalFrom: 40,
    motherboardDiagFrom: 55,
    color: "#ef4444",
    accentClass: "border-red-500/30 bg-red-500/8",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    iconColor: "text-red-400",
  },
  {
    name: "Apple iMac",
    slug: "apple-imac",
    seriesLabel: "iMac 21.5\" · iMac 24\" · Mac Mini · Mac Pro",
    tag: "Premium",
    screenPriceFrom: 200,
    ramUpgradeFrom: 35,
    ssdUpgradeFrom: 35,
    psuFrom: 80,
    thermalPrice: 60,
    osInstallFrom: 60,
    virusRemovalFrom: 50,
    motherboardDiagFrom: 80,
    notes: "Τα iMac M1/M2/M3 έχουν unified memory — RAM/SSD δεν αναβαθμίζονται. Η αποσυναρμολόγηση iMac είναι πολύπλοκη και χρεώνεται αναλόγως.",
    color: "#9ca3af",
    accentClass: "border-gray-500/30 bg-gray-500/8",
    badgeClass: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    iconColor: "text-gray-300",
  },
  {
    name: "Custom / Gaming PC",
    slug: "custom-gaming-pc",
    seriesLabel: "Custom Build · Gaming Rig · Workstation · Mini PC",
    tag: "Gaming",
    ramUpgradeFrom: 20,
    ssdUpgradeFrom: 20,
    psuFrom: 35,
    thermalPrice: 40,
    osInstallFrom: 50,
    virusRemovalFrom: 40,
    motherboardDiagFrom: 50,
    notes: "Εξειδίκευση σε gaming builds, overclocking, water cooling και full system upgrades. Επισκευή κάρτας γραφικών (GPU) από €50.",
    color: "#a855f7",
    accentClass: "border-purple-500/30 bg-purple-500/8",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    iconColor: "text-purple-400",
  },
];

export function findDesktopBrandBySlug(s: string): DesktopBrand | undefined {
  return DESKTOP_BRANDS.find((b) => b.slug === s);
}
