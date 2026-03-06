export interface HuaweiModel {
  name: string;
  slug: string;
  screen: string;
  tag?: string;
  screenPrice: number;
  screenPriceOEM?: number;
  batteryPrice: number;
  portPrice: number;
}

export interface HuaweiSeries {
  id: string;
  label: string;
  color: string;
  accentClass: string;
  badgeClass: string;
  models: HuaweiModel[];
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

export const HUAWEI_SERIES: HuaweiSeries[] = [
  {
    id: "p-series",
    label: "P Series",
    color: "#ef4444",
    accentClass: "border-red-500/30 bg-red-500/8",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    models: [
      { name: "Huawei P60 Pro",  slug: slug("Huawei P60 Pro"),  screen: "6.67″ OLED 120Hz",       tag: "NEW", screenPrice: 250, batteryPrice: 90, portPrice: 70 },
      { name: "Huawei P50 Pro",  slug: slug("Huawei P50 Pro"),  screen: "6.6″ OLED 120Hz",                    screenPrice: 210, batteryPrice: 85, portPrice: 65 },
      { name: "Huawei P50",      slug: slug("Huawei P50"),      screen: "6.5″ OLED 90Hz",                     screenPrice: 180, batteryPrice: 80, portPrice: 60 },
      { name: "Huawei P40 Pro",  slug: slug("Huawei P40 Pro"),  screen: "6.58″ OLED 90Hz",                    screenPrice: 200, batteryPrice: 85, portPrice: 65 },
      { name: "Huawei P40",      slug: slug("Huawei P40"),      screen: "6.1″ OLED 60Hz",                     screenPrice: 170, batteryPrice: 75, portPrice: 60 },
      { name: "Huawei P30 Pro",  slug: slug("Huawei P30 Pro"),  screen: "6.47″ OLED 60Hz",                    screenPrice: 180, batteryPrice: 75, portPrice: 60 },
      { name: "Huawei P30",      slug: slug("Huawei P30"),      screen: "6.1″ OLED 60Hz",                     screenPrice: 150, batteryPrice: 70, portPrice: 55 },
      { name: "Huawei P20 Pro",  slug: slug("Huawei P20 Pro"),  screen: "6.1″ OLED 60Hz",                     screenPrice: 130, batteryPrice: 65, portPrice: 50 },
      { name: "Huawei P20",      slug: slug("Huawei P20"),      screen: "5.8″ OLED 60Hz",                     screenPrice: 110, batteryPrice: 60, portPrice: 48 },
    ],
  },
  {
    id: "mate-series",
    label: "Mate Series",
    color: "#f59e0b",
    accentClass: "border-amber-500/30 bg-amber-500/8",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    models: [
      { name: "Huawei Mate 60 Pro",  slug: slug("Huawei Mate 60 Pro"),  screen: "6.82″ LTPO OLED 120Hz", tag: "NEW", screenPrice: 280, batteryPrice: 95, portPrice: 75 },
      { name: "Huawei Mate 50 Pro",  slug: slug("Huawei Mate 50 Pro"),  screen: "6.74″ OLED 120Hz",                  screenPrice: 230, batteryPrice: 90, portPrice: 70 },
      { name: "Huawei Mate 50",      slug: slug("Huawei Mate 50"),      screen: "6.7″ OLED 90Hz",                    screenPrice: 200, batteryPrice: 85, portPrice: 65 },
      { name: "Huawei Mate 40 Pro",  slug: slug("Huawei Mate 40 Pro"),  screen: "6.76″ OLED 90Hz",                   screenPrice: 220, batteryPrice: 88, portPrice: 70 },
      { name: "Huawei Mate 30 Pro",  slug: slug("Huawei Mate 30 Pro"),  screen: "6.53″ OLED 90Hz",                   screenPrice: 200, batteryPrice: 85, portPrice: 65 },
      { name: "Huawei Mate 20 Pro",  slug: slug("Huawei Mate 20 Pro"),  screen: "6.39″ OLED 60Hz",                   screenPrice: 160, batteryPrice: 75, portPrice: 60 },
    ],
  },
  {
    id: "nova-series",
    label: "Nova Series",
    color: "#8b5cf6",
    accentClass: "border-violet-500/30 bg-violet-500/8",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    models: [
      { name: "Huawei Nova 13 Pro",  slug: slug("Huawei Nova 13 Pro"),  screen: "6.76″ OLED 120Hz", tag: "NEW", screenPrice: 130, batteryPrice: 60, portPrice: 50 },
      { name: "Huawei Nova 12 Pro",  slug: slug("Huawei Nova 12 Pro"),  screen: "6.77″ OLED 120Hz",             screenPrice: 120, batteryPrice: 58, portPrice: 48 },
      { name: "Huawei Nova 11 Pro",  slug: slug("Huawei Nova 11 Pro"),  screen: "6.78″ OLED 120Hz",             screenPrice: 110, batteryPrice: 55, portPrice: 45 },
      { name: "Huawei Nova 10 Pro",  slug: slug("Huawei Nova 10 Pro"),  screen: "6.78″ OLED 120Hz",             screenPrice: 100, batteryPrice: 52, portPrice: 45 },
      { name: "Huawei Nova 9 Pro",   slug: slug("Huawei Nova 9 Pro"),   screen: "6.72″ OLED 120Hz",             screenPrice: 90,  batteryPrice: 50, portPrice: 42 },
      { name: "Huawei Nova 9",       slug: slug("Huawei Nova 9"),       screen: "6.57″ OLED 120Hz",             screenPrice: 80,  batteryPrice: 48, portPrice: 40 },
    ],
  },
  {
    id: "y-series",
    label: "Y Series",
    color: "#64748b",
    accentClass: "border-slate-500/30 bg-slate-500/8",
    badgeClass: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    models: [
      { name: "Huawei Y90",  slug: slug("Huawei Y90"),  screen: "6.7″ IPS LCD 120Hz",  screenPrice: 80,  batteryPrice: 48, portPrice: 40 },
      { name: "Huawei Y72",  slug: slug("Huawei Y72"),  screen: "6.7″ IPS LCD 60Hz",   screenPrice: 70,  batteryPrice: 45, portPrice: 38 },
      { name: "Huawei Y70",  slug: slug("Huawei Y70"),  screen: "6.75″ IPS LCD 60Hz",  screenPrice: 65,  batteryPrice: 43, portPrice: 38 },
      { name: "Huawei Y61",  slug: slug("Huawei Y61"),  screen: "6.52″ IPS LCD 60Hz",  screenPrice: 60,  batteryPrice: 42, portPrice: 35 },
      { name: "Huawei Y9s",  slug: slug("Huawei Y9s"),  screen: "6.59″ IPS LCD 60Hz",  screenPrice: 70,  batteryPrice: 45, portPrice: 38 },
    ],
  },
];

export function findHuaweiBySlug(s: string): HuaweiModel | undefined {
  for (const series of HUAWEI_SERIES) {
    const found = series.models.find((m) => m.slug === s);
    if (found) return found;
  }
  return undefined;
}

export function allHuaweiModels(): HuaweiModel[] {
  return HUAWEI_SERIES.flatMap((s) => s.models);
}

export function findHuaweiSeriesForModel(slug: string): HuaweiSeries | undefined {
  return HUAWEI_SERIES.find((s) => s.models.some((m) => m.slug === slug));
}
