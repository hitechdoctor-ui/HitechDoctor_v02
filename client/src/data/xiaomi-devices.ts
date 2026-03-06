export interface XiaomiModel {
  name: string;
  slug: string;
  screen: string;
  tag?: string;
  screenPrice: number;
  screenPriceOEM?: number;
  batteryPrice: number;
  portPrice: number;
}

export interface XiaomiSeries {
  id: string;
  label: string;
  color: string;
  accentClass: string;
  badgeClass: string;
  models: XiaomiModel[];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[()]/g, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const XIAOMI_SERIES: XiaomiSeries[] = [
  {
    id: "redmi-note",
    label: "Redmi Note Series",
    color: "#8b5cf6",
    accentClass: "border-violet-500/30 bg-violet-500/8",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    models: [
      { name: "Redmi Note 15 Pro",  slug: slug("Redmi Note 15 Pro"),  screen: "6.67″ AMOLED 120Hz", tag: "NEW", screenPrice: 95,  batteryPrice: 55, portPrice: 45 },
      { name: "Redmi Note 15",      slug: slug("Redmi Note 15"),      screen: "6.67″ AMOLED 120Hz", tag: "NEW", screenPrice: 80,  batteryPrice: 50, portPrice: 40 },
      { name: "Redmi Note 14 Pro+", slug: slug("Redmi Note 14 Pro+"), screen: "6.67″ AMOLED 120Hz",             screenPrice: 110, batteryPrice: 58, portPrice: 45 },
      { name: "Redmi Note 14 Pro",  slug: slug("Redmi Note 14 Pro"),  screen: "6.67″ AMOLED 120Hz",             screenPrice: 95,  batteryPrice: 55, portPrice: 45 },
      { name: "Redmi Note 14",      slug: slug("Redmi Note 14"),      screen: "6.67″ AMOLED 90Hz",              screenPrice: 75,  batteryPrice: 50, portPrice: 40 },
      { name: "Redmi Note 13 Pro+", slug: slug("Redmi Note 13 Pro+"), screen: "6.67″ AMOLED 120Hz",             screenPrice: 105, batteryPrice: 55, portPrice: 45 },
      { name: "Redmi Note 13 Pro",  slug: slug("Redmi Note 13 Pro"),  screen: "6.67″ AMOLED 120Hz",             screenPrice: 90,  batteryPrice: 52, portPrice: 45 },
      { name: "Redmi Note 13",      slug: slug("Redmi Note 13"),      screen: "6.67″ AMOLED 120Hz",             screenPrice: 70,  batteryPrice: 48, portPrice: 40 },
      { name: "Redmi Note 12 Pro",  slug: slug("Redmi Note 12 Pro"),  screen: "6.67″ AMOLED 120Hz",             screenPrice: 80,  batteryPrice: 50, portPrice: 40 },
      { name: "Redmi Note 12",      slug: slug("Redmi Note 12"),      screen: "6.67″ AMOLED 120Hz",             screenPrice: 60,  batteryPrice: 45, portPrice: 40 },
    ],
  },
  {
    id: "redmi",
    label: "Redmi Series",
    color: "#3b82f6",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    models: [
      { name: "Redmi 15C 5G", slug: slug("Redmi 15C 5G"), screen: "6.88″ IPS LCD 120Hz", tag: "NEW", screenPrice: 50, batteryPrice: 38, portPrice: 35 },
      { name: "Redmi 15C",    slug: slug("Redmi 15C"),    screen: "6.88″ IPS LCD 90Hz",  tag: "NEW", screenPrice: 48, batteryPrice: 38, portPrice: 35 },
      { name: "Redmi 15",     slug: slug("Redmi 15"),     screen: "6.67″ AMOLED 120Hz",  tag: "NEW", screenPrice: 62, batteryPrice: 42, portPrice: 38 },
      { name: "Redmi 14C",    slug: slug("Redmi 14C"),    screen: "6.88″ IPS LCD 120Hz",             screenPrice: 48, batteryPrice: 38, portPrice: 35 },
      { name: "Redmi 14",     slug: slug("Redmi 14"),     screen: "6.67″ AMOLED 120Hz",              screenPrice: 58, batteryPrice: 40, portPrice: 35 },
      { name: "Redmi 13C",    slug: slug("Redmi 13C"),    screen: "6.74″ IPS LCD 90Hz",              screenPrice: 45, batteryPrice: 38, portPrice: 35 },
      { name: "Redmi 13",     slug: slug("Redmi 13"),     screen: "6.79″ IPS LCD 90Hz",              screenPrice: 55, batteryPrice: 40, portPrice: 35 },
    ],
  },
  {
    id: "xiaomi",
    label: "Xiaomi Series",
    color: "#f97316",
    accentClass: "border-orange-500/30 bg-orange-500/8",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    models: [
      { name: "Xiaomi 15 Ultra",  slug: slug("Xiaomi 15 Ultra"),  screen: "6.73″ LTPO AMOLED 120Hz", tag: "NEW", screenPrice: 240, batteryPrice: 90, portPrice: 70 },
      { name: "Xiaomi 15",        slug: slug("Xiaomi 15"),        screen: "6.36″ AMOLED 120Hz",       tag: "NEW", screenPrice: 185, batteryPrice: 80, portPrice: 65 },
      { name: "Xiaomi 14T Pro",   slug: slug("Xiaomi 14T Pro"),   screen: "6.67″ LTPO AMOLED 144Hz",              screenPrice: 170, batteryPrice: 75, portPrice: 60 },
      { name: "Xiaomi 14T",       slug: slug("Xiaomi 14T"),       screen: "6.67″ AMOLED 144Hz",                   screenPrice: 145, batteryPrice: 70, portPrice: 55 },
      { name: "Xiaomi 14 Ultra",  slug: slug("Xiaomi 14 Ultra"),  screen: "6.73″ LTPO AMOLED 120Hz",              screenPrice: 220, batteryPrice: 88, portPrice: 70 },
      { name: "Xiaomi 14",        slug: slug("Xiaomi 14"),        screen: "6.36″ AMOLED 120Hz",                   screenPrice: 155, batteryPrice: 72, portPrice: 55 },
      { name: "Xiaomi 13T Pro",   slug: slug("Xiaomi 13T Pro"),   screen: "6.67″ AMOLED 144Hz",                   screenPrice: 160, batteryPrice: 72, portPrice: 55 },
      { name: "Xiaomi 13T",       slug: slug("Xiaomi 13T"),       screen: "6.67″ AMOLED 144Hz",                   screenPrice: 135, batteryPrice: 68, portPrice: 55 },
      { name: "Xiaomi 13",        slug: slug("Xiaomi 13"),        screen: "6.36″ AMOLED 120Hz",                   screenPrice: 140, batteryPrice: 70, portPrice: 55 },
    ],
  },
  {
    id: "poco",
    label: "Poco Series",
    color: "#eab308",
    accentClass: "border-yellow-500/30 bg-yellow-500/8",
    badgeClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    models: [
      { name: "Poco X7 Pro",  slug: slug("Poco X7 Pro"),  screen: "6.67″ AMOLED 120Hz", tag: "NEW", screenPrice: 120, batteryPrice: 58, portPrice: 45 },
      { name: "Poco X7",      slug: slug("Poco X7"),      screen: "6.67″ AMOLED 120Hz", tag: "NEW", screenPrice: 100, batteryPrice: 55, portPrice: 45 },
      { name: "Poco X6 Pro",  slug: slug("Poco X6 Pro"),  screen: "6.67″ AMOLED 120Hz",             screenPrice: 115, batteryPrice: 58, portPrice: 45 },
      { name: "Poco X6",      slug: slug("Poco X6"),      screen: "6.67″ AMOLED 120Hz",             screenPrice: 95,  batteryPrice: 55, portPrice: 45 },
      { name: "Poco F6 Pro",  slug: slug("Poco F6 Pro"),  screen: "6.67″ LTPO AMOLED 120Hz",        screenPrice: 125, batteryPrice: 60, portPrice: 45 },
      { name: "Poco F6",      slug: slug("Poco F6"),      screen: "6.67″ AMOLED 120Hz",             screenPrice: 105, batteryPrice: 58, portPrice: 45 },
      { name: "Poco X5 Pro",  slug: slug("Poco X5 Pro"),  screen: "6.67″ AMOLED 120Hz",             screenPrice: 105, batteryPrice: 55, portPrice: 40 },
      { name: "Poco X5",      slug: slug("Poco X5"),      screen: "6.67″ AMOLED 120Hz",             screenPrice: 85,  batteryPrice: 50, portPrice: 40 },
    ],
  },
];

export function findXiaomiBySlug(s: string): XiaomiModel | undefined {
  for (const series of XIAOMI_SERIES) {
    const found = series.models.find((m) => m.slug === s);
    if (found) return found;
  }
  return undefined;
}

export function allXiaomiModels(): XiaomiModel[] {
  return XIAOMI_SERIES.flatMap((s) => s.models);
}

export function findXiaomiSeriesForModel(slug: string): XiaomiSeries | undefined {
  return XIAOMI_SERIES.find((s) => s.models.some((m) => m.slug === slug));
}
