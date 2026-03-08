export interface WatchModel {
  name: string;
  slug: string;
  year: number;
  sizes: string;
  touchPriceFrom: number;
  batteryPriceFrom: number;
  tag?: string;
  note?: string;
}

export const APPLE_WATCH_MODELS: WatchModel[] = [
  {
    name: "Apple Watch Ultra 2",
    slug: "ultra-2",
    year: 2024,
    sizes: "49mm",
    touchPriceFrom: 140,
    batteryPriceFrom: 70,
    tag: "Νεότερο",
    note: "Titanium case · Always-On Retina LTPO3 · Water Resistant 100m",
  },
  {
    name: "Apple Watch Series 10",
    slug: "series-10",
    year: 2024,
    sizes: "42mm / 46mm",
    touchPriceFrom: 120,
    batteryPriceFrom: 60,
    tag: "2024",
    note: "Aluminium / Titanium · LTPO OLED · Nέο ultra-thin design",
  },
  {
    name: "Apple Watch Ultra",
    slug: "ultra",
    year: 2022,
    sizes: "49mm",
    touchPriceFrom: 130,
    batteryPriceFrom: 65,
    tag: "Ultra",
    note: "Titanium case · Always-On Retina LTPO2 · Water Resistant 100m",
  },
  {
    name: "Apple Watch Series 9",
    slug: "series-9",
    year: 2023,
    sizes: "41mm / 45mm",
    touchPriceFrom: 110,
    batteryPriceFrom: 55,
    note: "Aluminium / Stainless Steel · LTPO2 OLED · S9 chip",
  },
  {
    name: "Apple Watch Series 8",
    slug: "series-8",
    year: 2022,
    sizes: "41mm / 45mm",
    touchPriceFrom: 100,
    batteryPriceFrom: 55,
    note: "Aluminium / Stainless Steel · LTPO2 OLED · S8 chip",
  },
  {
    name: "Apple Watch SE (2022)",
    slug: "se-2022",
    year: 2022,
    sizes: "40mm / 44mm",
    touchPriceFrom: 85,
    batteryPriceFrom: 45,
    note: "Aluminium · LTPO OLED · S8 chip — 2η γενιά",
  },
  {
    name: "Apple Watch Series 7",
    slug: "series-7",
    year: 2021,
    sizes: "41mm / 45mm",
    touchPriceFrom: 95,
    batteryPriceFrom: 50,
    note: "Aluminium / Stainless Steel · LTPO OLED · Always-On",
  },
  {
    name: "Apple Watch Series 6",
    slug: "series-6",
    year: 2020,
    sizes: "40mm / 44mm",
    touchPriceFrom: 90,
    batteryPriceFrom: 50,
    note: "Aluminium / Stainless Steel / Titanium · SpO2 sensor",
  },
  {
    name: "Apple Watch SE (2020)",
    slug: "se-2020",
    year: 2020,
    sizes: "40mm / 44mm",
    touchPriceFrom: 80,
    batteryPriceFrom: 45,
    note: "Aluminium · LTPO OLED · S5 chip — 1η γενιά",
  },
  {
    name: "Apple Watch Series 5",
    slug: "series-5",
    year: 2019,
    sizes: "40mm / 44mm",
    touchPriceFrom: 85,
    batteryPriceFrom: 45,
    note: "Aluminium / Stainless Steel / Titanium · Always-On Retina",
  },
  {
    name: "Apple Watch Series 4",
    slug: "series-4",
    year: 2018,
    sizes: "40mm / 44mm",
    touchPriceFrom: 80,
    batteryPriceFrom: 40,
    note: "Aluminium / Stainless Steel · Νέος σχεδιασμός με μεγαλύτερη οθόνη",
  },
  {
    name: "Apple Watch Series 3",
    slug: "series-3",
    year: 2017,
    sizes: "38mm / 42mm",
    touchPriceFrom: 80,
    batteryPriceFrom: 40,
    note: "Aluminium / Stainless Steel · GPS / GPS+Cellular",
  },
];
