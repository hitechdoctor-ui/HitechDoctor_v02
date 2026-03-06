export interface SamsungModel {
  name: string;
  slug: string;
  screen: string;
  tag?: string;
  screenPrice: number;
  screenPriceOEM?: number;
  batteryPrice: number;
  portPrice: number;
  foldable?: boolean;
  hasInnerScreen?: boolean;
  innerScreenPrice?: number;
}

export interface SamsungSeries {
  id: string;
  label: string;
  color: string;
  accentClass: string;
  badgeClass: string;
  models: SamsungModel[];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/samsung\s+galaxy\s+/i, "")
    .replace(/samsung\s+/i, "")
    .replace(/[()]/g, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const SAMSUNG_SERIES: SamsungSeries[] = [
  {
    id: "a",
    label: "Galaxy A Series",
    color: "#3b82f6",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    models: [
      { name: "Samsung Galaxy A56 5G", slug: slug("Samsung Galaxy A56 5G"), screen: "6.7″ AMOLED 120Hz",          tag: "NEW", screenPrice: 120, batteryPrice: 65, portPrice: 55 },
      { name: "Samsung Galaxy A55 5G", slug: slug("Samsung Galaxy A55 5G"), screen: "6.6″ Super AMOLED 120Hz",           screenPrice: 110, screenPriceOEM: 75,  batteryPrice: 60, portPrice: 50 },
      { name: "Samsung Galaxy A36 5G", slug: slug("Samsung Galaxy A36 5G"), screen: "6.7″ AMOLED 120Hz",          tag: "NEW", screenPrice: 130, batteryPrice: 58, portPrice: 50 },
      { name: "Samsung Galaxy A35 5G", slug: slug("Samsung Galaxy A35 5G"), screen: "6.6″ Super AMOLED 120Hz",           screenPrice: 110, batteryPrice: 55, portPrice: 50 },
      { name: "Samsung Galaxy A26 5G", slug: slug("Samsung Galaxy A26 5G"), screen: "6.7″ AMOLED 120Hz",          tag: "NEW", screenPrice: 110, batteryPrice: 52, portPrice: 45 },
      { name: "Samsung Galaxy A25 5G", slug: slug("Samsung Galaxy A25 5G"), screen: "6.5″ Super AMOLED 120Hz",           screenPrice: 100, batteryPrice: 50, portPrice: 45 },
      { name: "Samsung Galaxy A17 5G", slug: slug("Samsung Galaxy A17 5G"), screen: "6.7″ AMOLED 120Hz",          tag: "NEW", screenPrice: 100, batteryPrice: 48, portPrice: 40 },
      { name: "Samsung Galaxy A16 5G", slug: slug("Samsung Galaxy A16 5G"), screen: "6.7″ Super AMOLED 90Hz",            screenPrice: 100, batteryPrice: 45, portPrice: 40 },
      { name: "Samsung Galaxy A15 5G", slug: slug("Samsung Galaxy A15 5G"), screen: "6.5″ Super AMOLED 90Hz",             screenPrice: 85,  batteryPrice: 43, portPrice: 40 },
    ],
  },
  {
    id: "s",
    label: "Galaxy S Series",
    color: "#8b5cf6",
    accentClass: "border-violet-500/30 bg-violet-500/8",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    models: [
      { name: "Samsung Galaxy S25 Ultra", slug: slug("Samsung Galaxy S25 Ultra"), screen: "6.9″ QHD+ Dynamic AMOLED 2X 120Hz", tag: "NEW", screenPrice: 280, screenPriceOEM: 175, batteryPrice: 90, portPrice: 70 },
      { name: "Samsung Galaxy S25+",      slug: slug("Samsung Galaxy S25+"),      screen: "6.7″ Dynamic AMOLED 2X 120Hz",      tag: "NEW", screenPrice: 220, screenPriceOEM: 140, batteryPrice: 85, portPrice: 65 },
      { name: "Samsung Galaxy S25",       slug: slug("Samsung Galaxy S25"),       screen: "6.2″ Dynamic AMOLED 2X 120Hz",      tag: "NEW", screenPrice: 185, screenPriceOEM: 115, batteryPrice: 80, portPrice: 65 },
      { name: "Samsung Galaxy S24 Ultra", slug: slug("Samsung Galaxy S24 Ultra"), screen: "6.8″ QHD+ Dynamic AMOLED 2X 120Hz",           screenPrice: 260, screenPriceOEM: 165, batteryPrice: 88, portPrice: 70 },
      { name: "Samsung Galaxy S24+",      slug: slug("Samsung Galaxy S24+"),      screen: "6.7″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 200, screenPriceOEM: 125, batteryPrice: 82, portPrice: 65 },
      { name: "Samsung Galaxy S24 FE",    slug: slug("Samsung Galaxy S24 FE"),    screen: "6.7″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 155, screenPriceOEM: 100, batteryPrice: 72, portPrice: 60 },
      { name: "Samsung Galaxy S24",       slug: slug("Samsung Galaxy S24"),       screen: "6.2″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 165, screenPriceOEM: 105, batteryPrice: 76, portPrice: 65 },
      { name: "Samsung Galaxy S23 Ultra", slug: slug("Samsung Galaxy S23 Ultra"), screen: "6.8″ QHD+ Dynamic AMOLED 2X 120Hz",           screenPrice: 235, screenPriceOEM: 150, batteryPrice: 85, portPrice: 70 },
      { name: "Samsung Galaxy S23+",      slug: slug("Samsung Galaxy S23+"),      screen: "6.6″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 180, screenPriceOEM: 115, batteryPrice: 75, portPrice: 65 },
      { name: "Samsung Galaxy S23 FE",    slug: slug("Samsung Galaxy S23 FE"),    screen: "6.4″ Dynamic AMOLED 120Hz",                     screenPrice: 140, screenPriceOEM: 90,  batteryPrice: 68, portPrice: 60 },
      { name: "Samsung Galaxy S23",       slug: slug("Samsung Galaxy S23"),       screen: "6.1″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 150, screenPriceOEM: 95,  batteryPrice: 70, portPrice: 65 },
      { name: "Samsung Galaxy S22 Ultra", slug: slug("Samsung Galaxy S22 Ultra"), screen: "6.8″ QHD+ Dynamic AMOLED 2X 120Hz",           screenPrice: 200, screenPriceOEM: 125, batteryPrice: 78, portPrice: 70 },
      { name: "Samsung Galaxy S22+",      slug: slug("Samsung Galaxy S22+"),      screen: "6.6″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 155, screenPriceOEM: 98,  batteryPrice: 70, portPrice: 65 },
      { name: "Samsung Galaxy S22",       slug: slug("Samsung Galaxy S22"),       screen: "6.1″ Dynamic AMOLED 2X 120Hz",                  screenPrice: 130, screenPriceOEM: 82,  batteryPrice: 65, portPrice: 65 },
    ],
  },
  {
    id: "z",
    label: "Galaxy Z Series",
    color: "#f59e0b",
    accentClass: "border-amber-500/30 bg-amber-500/8",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    models: [
      { name: "Samsung Galaxy Z Fold 7",    slug: slug("Samsung Galaxy Z Fold 7"),    screen: "7.9″ Main AMOLED + 6.5″ Cover",    tag: "NEW", foldable: true, hasInnerScreen: true, screenPrice: 320, screenPriceOEM: 220, innerScreenPrice: 520, batteryPrice: 165, portPrice: 80 },
      { name: "Samsung Galaxy Z Fold 6",    slug: slug("Samsung Galaxy Z Fold 6"),    screen: "7.6″ Main AMOLED + 6.3″ Cover",             foldable: true, hasInnerScreen: true, screenPrice: 300, screenPriceOEM: 210, innerScreenPrice: 490, batteryPrice: 158, portPrice: 80 },
      { name: "Samsung Galaxy Z Fold 5",    slug: slug("Samsung Galaxy Z Fold 5"),    screen: "7.6″ Main AMOLED + 6.2″ Cover",             foldable: true, hasInnerScreen: true, screenPrice: 280, screenPriceOEM: 195, innerScreenPrice: 460, batteryPrice: 150, portPrice: 80 },
      { name: "Samsung Galaxy Z Flip 7",    slug: slug("Samsung Galaxy Z Flip 7"),    screen: "6.7″ Foldable AMOLED + 4.0″ Cover", tag: "NEW", foldable: true, hasInnerScreen: true, screenPrice: 220, screenPriceOEM: 155, innerScreenPrice: 290, batteryPrice: 130, portPrice: 70 },
      { name: "Samsung Galaxy Z Flip 7 FE", slug: slug("Samsung Galaxy Z Flip 7 FE"), screen: "6.7″ Foldable AMOLED + 3.4″ Cover", tag: "NEW", foldable: true, hasInnerScreen: true, screenPrice: 190, screenPriceOEM: 135, innerScreenPrice: 260, batteryPrice: 120, portPrice: 70 },
      { name: "Samsung Galaxy Z Flip 6",    slug: slug("Samsung Galaxy Z Flip 6"),    screen: "6.7″ Foldable AMOLED + 3.4″ Cover",          foldable: true, hasInnerScreen: true, screenPrice: 210, screenPriceOEM: 148, innerScreenPrice: 275, batteryPrice: 125, portPrice: 70 },
      { name: "Samsung Galaxy Z Flip 5",    slug: slug("Samsung Galaxy Z Flip 5"),    screen: "6.7″ Foldable AMOLED + 3.4″ Cover",          foldable: true, hasInnerScreen: true, screenPrice: 195, screenPriceOEM: 138, innerScreenPrice: 260, batteryPrice: 120, portPrice: 70 },
      { name: "Samsung Galaxy Z Fold 4",    slug: slug("Samsung Galaxy Z Fold 4"),    screen: "7.6″ Main AMOLED + 6.2″ Cover",             foldable: true, hasInnerScreen: true, screenPrice: 265, screenPriceOEM: 185, innerScreenPrice: 430, batteryPrice: 140, portPrice: 80 },
      { name: "Samsung Galaxy Z Flip 4",    slug: slug("Samsung Galaxy Z Flip 4"),    screen: "6.7″ Foldable AMOLED + 1.9″ Cover",          foldable: true, hasInnerScreen: true, screenPrice: 185, screenPriceOEM: 130, innerScreenPrice: 245, batteryPrice: 115, portPrice: 70 },
    ],
  },
];

export function findSamsungBySlug(s: string): SamsungModel | undefined {
  for (const series of SAMSUNG_SERIES) {
    const found = series.models.find((m) => m.slug === s);
    if (found) return found;
  }
  return undefined;
}

export function allSamsungModels(): SamsungModel[] {
  return SAMSUNG_SERIES.flatMap((s) => s.models);
}
