export interface OnePlusModel {
  name: string;
  slug: string;
  screen: string;
  tag?: string;
  screenPrice: number;
  screenPriceOEM?: number;
  batteryPrice: number;
  portPrice: number;
}

export interface OnePlusSeries {
  id: string;
  label: string;
  color: string;
  accentClass: string;
  badgeClass: string;
  models: OnePlusModel[];
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

export const ONEPLUS_SERIES: OnePlusSeries[] = [
  {
    id: "flagship",
    label: "Flagship Series",
    color: "#ef4444",
    accentClass: "border-red-500/30 bg-red-500/8",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    models: [
      { name: "OnePlus 13",     slug: slug("OnePlus 13"),     screen: "6.82″ LTPO AMOLED 120Hz", tag: "NEW", screenPrice: 300, batteryPrice: 95, portPrice: 78 },
      { name: "OnePlus 12",     slug: slug("OnePlus 12"),     screen: "6.82″ LTPO AMOLED 120Hz",             screenPrice: 280, batteryPrice: 90, portPrice: 75 },
      { name: "OnePlus 11",     slug: slug("OnePlus 11"),     screen: "6.7″ LTPO AMOLED 120Hz",              screenPrice: 250, batteryPrice: 85, portPrice: 70 },
      { name: "OnePlus 10 Pro", slug: slug("OnePlus 10 Pro"), screen: "6.7″ LTPO AMOLED 120Hz",              screenPrice: 220, batteryPrice: 85, portPrice: 65 },
      { name: "OnePlus 9 Pro",  slug: slug("OnePlus 9 Pro"),  screen: "6.7″ LTPO AMOLED 120Hz",              screenPrice: 200, batteryPrice: 80, portPrice: 65 },
      { name: "OnePlus 9",      slug: slug("OnePlus 9"),      screen: "6.55″ FHD+ AMOLED 120Hz",             screenPrice: 170, batteryPrice: 75, portPrice: 60 },
      { name: "OnePlus 8T",     slug: slug("OnePlus 8T"),     screen: "6.55″ FHD+ AMOLED 120Hz",             screenPrice: 160, batteryPrice: 75, portPrice: 60 },
      { name: "OnePlus 8 Pro",  slug: slug("OnePlus 8 Pro"),  screen: "6.78″ QHD+ AMOLED 120Hz",             screenPrice: 170, batteryPrice: 75, portPrice: 60 },
    ],
  },
  {
    id: "nord",
    label: "Nord Series",
    color: "#6366f1",
    accentClass: "border-indigo-500/30 bg-indigo-500/8",
    badgeClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    models: [
      { name: "OnePlus Nord 4",        slug: slug("OnePlus Nord 4"),        screen: "6.74″ AMOLED 120Hz",   tag: "NEW", screenPrice: 160, batteryPrice: 70, portPrice: 55 },
      { name: "OnePlus Nord CE 4",     slug: slug("OnePlus Nord CE 4"),     screen: "6.67″ AMOLED 120Hz",               screenPrice: 140, batteryPrice: 65, portPrice: 52 },
      { name: "OnePlus Nord CE 4 Lite",slug: slug("OnePlus Nord CE 4 Lite"),screen: "6.67″ AMOLED 120Hz",               screenPrice: 120, batteryPrice: 60, portPrice: 48 },
      { name: "OnePlus Nord 3",        slug: slug("OnePlus Nord 3"),        screen: "6.74″ AMOLED 120Hz",               screenPrice: 150, batteryPrice: 68, portPrice: 55 },
      { name: "OnePlus Nord CE 3",     slug: slug("OnePlus Nord CE 3"),     screen: "6.7″ AMOLED 120Hz",                screenPrice: 130, batteryPrice: 62, portPrice: 50 },
      { name: "OnePlus Nord 2T",       slug: slug("OnePlus Nord 2T"),       screen: "6.43″ AMOLED 90Hz",                screenPrice: 130, batteryPrice: 60, portPrice: 48 },
      { name: "OnePlus Nord CE 2",     slug: slug("OnePlus Nord CE 2"),     screen: "6.43″ AMOLED 90Hz",                screenPrice: 110, batteryPrice: 55, portPrice: 45 },
      { name: "OnePlus Nord CE 2 Lite",slug: slug("OnePlus Nord CE 2 Lite"),screen: "6.59″ IPS LCD 120Hz",              screenPrice: 90,  batteryPrice: 50, portPrice: 42 },
    ],
  },
];

export function findOnePlusBySlug(s: string): OnePlusModel | undefined {
  for (const series of ONEPLUS_SERIES) {
    const found = series.models.find((m) => m.slug === s);
    if (found) return found;
  }
  return undefined;
}

export function allOnePlusModels(): OnePlusModel[] {
  return ONEPLUS_SERIES.flatMap((s) => s.models);
}

export function findOnePlusSeriesForModel(slug: string): OnePlusSeries | undefined {
  return ONEPLUS_SERIES.find((s) => s.models.some((m) => m.slug === slug));
}
