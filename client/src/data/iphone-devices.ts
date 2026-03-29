export interface ScreenTier {
  label: string;
  sublabel: string;
  price: number;
  features: string[];
  badge?: string;
  recommended?: boolean;
}

export interface BatteryTier {
  label: string;
  sublabel: string;
  price: number;
  features: string[];
  badge?: string;
  recommended?: boolean;
}

export interface IPhoneModel {
  name: string;
  slug: string;
  screen: string;
  port: "USB-C" | "Lightning";
  tag?: string;
  screenTiers: ScreenTier[];
  batteryTiers: BatteryTier[];
  chargingPortPrice: number;
}

export interface IPhoneSeries {
  id: string;
  label: string;
  color: string;
  accentClass: string;
  badgeClass: string;
  models: IPhoneModel[];
}

const BATTERY_TIERS: BatteryTier[] = [
  {
    label: "Γνήσια",
    sublabel: "Apple OEM",
    price: 119,
    features: ["Γνήσια χωρητικότητα mAh", "Apple-certified κυψέλη", "Εγγύηση 24 μηνών", "Βαθμονόμηση μέσω iOS"],
    badge: "Apple",
    recommended: false,
  },
  {
    label: "Turbo",
    sublabel: "High Capacity",
    price: 70,
    features: ["Premium aftermarket κυψέλη", "≥95% γνήσιας χωρητικότητας", "Εγγύηση 12 μηνών", "Πιστοποιημένο εργαστήριο"],
    badge: "Best Value",
    recommended: true,
  },
  {
    label: "Standard",
    sublabel: "Βασική Αντικατάσταση",
    price: 45,
    features: ["Aftermarket κυψέλη", "Βασική χωρητικότητα", "Εγγύηση 6 μηνών", "Οικονομική επιλογή"],
    badge: undefined,
    recommended: false,
  },
];

export function screenTiers(standardPrice: number): ScreenTier[] {
  const premium = Math.round((standardPrice * 1.6) / 5) * 5;
  const genuine = Math.round((standardPrice * 2.5) / 5) * 5;
  return [
    {
      label: "Γνήσια",
      sublabel: "Apple OEM / OLED",
      price: genuine,
      features: ["100% αυθεντική εικόνα & χρώματα", "Face ID / TrueDepth πλήρης λειτουργία", "Apple-certified ανταλλακτικό", "Εγγύηση 24 μηνών"],
      badge: "Apple",
      recommended: false,
    },
    {
      label: "Premium",
      sublabel: "High-Quality Aftermarket",
      price: premium,
      features: ["OLED/LCD υψηλής πιστότητας", "Φωτεινότητα & αφή ισοδύναμη γνήσιας", "Face ID συμβατότητα", "Εγγύηση 12 μηνών"],
      badge: "Προτεινόμενο",
      recommended: true,
    },
    {
      label: "Standard",
      sublabel: "Οικονομική Επιλογή",
      price: standardPrice,
      features: ["Aftermarket LCD/OLED οθόνη", "Πλήρης αφή & εικόνα", "Βασική εγγύηση 6 μηνών", "Ιδανικό για παλιά μοντέλα"],
      badge: undefined,
      recommended: false,
    },
  ];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/iphone\s+/i, "")
    .replace(/\(3η γενιά\)/i, "3")
    .replace(/\(2η γενιά\)/i, "2")
    .replace(/\(1η γενιά\)/i, "1")
    .replace(/[()]/g, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const IPHONE_SERIES: IPhoneSeries[] = [
  {
    id: "17",
    label: "iPhone 17",
    color: "#94a3b8",
    accentClass: "border-slate-500/30 bg-slate-500/8",
    badgeClass: "bg-slate-500/15 border-slate-500/30 text-slate-300",
    models: [
      { name: "iPhone 17 Pro Max", slug: slug("iPhone 17 Pro Max"), screen: "6.9″ LTPO OLED ProMotion 120Hz", port: "USB-C", tag: "NEW", screenTiers: screenTiers(280), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 17 Pro",     slug: slug("iPhone 17 Pro"),     screen: "6.3″ LTPO OLED ProMotion 120Hz", port: "USB-C", tag: "NEW", screenTiers: screenTiers(260), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 17 Plus",    slug: slug("iPhone 17 Plus"),    screen: "6.9″ OLED 60Hz",                port: "USB-C", tag: "NEW", screenTiers: screenTiers(180), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 17",         slug: slug("iPhone 17"),         screen: "6.1″ OLED 60Hz",                port: "USB-C", tag: "NEW", screenTiers: screenTiers(160), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "16",
    label: "iPhone 16",
    color: "#60a5fa",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "bg-blue-500/15 border-blue-500/30 text-blue-300",
    models: [
      { name: "iPhone 16 Pro Max", slug: slug("iPhone 16 Pro Max"), screen: "6.9″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenTiers: screenTiers(250), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 16 Pro",     slug: slug("iPhone 16 Pro"),     screen: "6.3″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenTiers: screenTiers(230), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 16 Plus",    slug: slug("iPhone 16 Plus"),    screen: "6.7″ OLED 60Hz",                port: "USB-C", screenTiers: screenTiers(165), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 16",         slug: slug("iPhone 16"),         screen: "6.1″ OLED 60Hz",                port: "USB-C", screenTiers: screenTiers(145), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "15",
    label: "iPhone 15",
    color: "#34d399",
    accentClass: "border-emerald-500/30 bg-emerald-500/8",
    badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    models: [
      { name: "iPhone 15 Pro Max", slug: slug("iPhone 15 Pro Max"), screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenTiers: screenTiers(220), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 15 Pro",     slug: slug("iPhone 15 Pro"),     screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenTiers: screenTiers(200), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 15 Plus",    slug: slug("iPhone 15 Plus"),    screen: "6.7″ OLED 60Hz",                port: "USB-C", screenTiers: screenTiers(140), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 15",         slug: slug("iPhone 15"),         screen: "6.1″ OLED 60Hz",                port: "USB-C", screenTiers: screenTiers(120), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "14",
    label: "iPhone 14",
    color: "#f472b6",
    accentClass: "border-pink-500/30 bg-pink-500/8",
    badgeClass: "bg-pink-500/15 border-pink-500/30 text-pink-300",
    models: [
      { name: "iPhone 14 Pro Max", slug: slug("iPhone 14 Pro Max"), screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenTiers: screenTiers(190), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 14 Pro",     slug: slug("iPhone 14 Pro"),     screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenTiers: screenTiers(175), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 14 Plus",    slug: slug("iPhone 14 Plus"),    screen: "6.7″ OLED 60Hz",                port: "Lightning", screenTiers: screenTiers(120), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 14",         slug: slug("iPhone 14"),         screen: "6.1″ OLED 60Hz",                port: "Lightning", screenTiers: screenTiers(100), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "13",
    label: "iPhone 13",
    color: "#a78bfa",
    accentClass: "border-violet-500/30 bg-violet-500/8",
    badgeClass: "bg-violet-500/15 border-violet-500/30 text-violet-300",
    models: [
      { name: "iPhone 13 Pro Max", slug: slug("iPhone 13 Pro Max"), screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenTiers: screenTiers(150), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 13 Pro",     slug: slug("iPhone 13 Pro"),     screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenTiers: screenTiers(135), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 13",         slug: slug("iPhone 13"),         screen: "6.1″ OLED 60Hz",                port: "Lightning", screenTiers: screenTiers(90),  batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 13 Mini",    slug: slug("iPhone 13 Mini"),    screen: "5.4″ OLED 60Hz",                port: "Lightning", screenTiers: screenTiers(85),  batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "12",
    label: "iPhone 12",
    color: "#fb923c",
    accentClass: "border-orange-500/30 bg-orange-500/8",
    badgeClass: "bg-orange-500/15 border-orange-500/30 text-orange-300",
    models: [
      { name: "iPhone 12 Pro Max", slug: slug("iPhone 12 Pro Max"), screen: "6.7″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(120), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 12 Pro",     slug: slug("iPhone 12 Pro"),     screen: "6.1″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(110), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 12",         slug: slug("iPhone 12"),         screen: "6.1″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(80),  batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 12 Mini",    slug: slug("iPhone 12 Mini"),    screen: "5.4″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(75),  batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "11",
    label: "iPhone 11",
    color: "#facc15",
    accentClass: "border-yellow-500/30 bg-yellow-500/8",
    badgeClass: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
    models: [
      { name: "iPhone 11 Pro Max", slug: slug("iPhone 11 Pro Max"), screen: "6.5″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(90), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 11 Pro",     slug: slug("iPhone 11 Pro"),     screen: "5.8″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(80), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 11",         slug: slug("iPhone 11"),         screen: "6.1″ LCD 60Hz",  port: "Lightning", screenTiers: screenTiers(55), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "x",
    label: "iPhone X / XS / XR",
    color: "#22d3ee",
    accentClass: "border-cyan-500/30 bg-cyan-500/8",
    badgeClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    models: [
      { name: "iPhone XS Max", slug: slug("iPhone XS Max"), screen: "6.5″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(80), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone XS",     slug: slug("iPhone XS"),     screen: "5.8″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(75), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone XR",     slug: slug("iPhone XR"),     screen: "6.1″ LCD 60Hz",  port: "Lightning", screenTiers: screenTiers(55), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone X",      slug: slug("iPhone X"),      screen: "5.8″ OLED 60Hz", port: "Lightning", screenTiers: screenTiers(70), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "se",
    label: "iPhone SE",
    color: "#4ade80",
    accentClass: "border-green-500/30 bg-green-500/8",
    badgeClass: "bg-green-500/15 border-green-500/30 text-green-300",
    models: [
      { name: "iPhone SE (3η Γενιά)", slug: "se-3", screen: "4.7″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(50), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone SE (2η Γενιά)", slug: "se-2", screen: "4.7″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(45), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone SE (1η Γενιά)", slug: "se-1", screen: "4.0″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(35), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
  {
    id: "8",
    label: "iPhone 8 / 7",
    color: "#e2e8f0",
    accentClass: "border-gray-500/30 bg-gray-500/8",
    badgeClass: "bg-gray-500/15 border-gray-400",
    models: [
      { name: "iPhone 8 Plus", slug: slug("iPhone 8 Plus"), screen: "5.5″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(50), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 8",      slug: slug("iPhone 8"),      screen: "4.7″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(45), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 7 Plus", slug: slug("iPhone 7 Plus"), screen: "5.5″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(40), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
      { name: "iPhone 7",      slug: slug("iPhone 7"),      screen: "4.7″ LCD 60Hz", port: "Lightning", screenTiers: screenTiers(35), batteryTiers: BATTERY_TIERS, chargingPortPrice: 70 },
    ],
  },
];

export function findModelBySlug(s: string): IPhoneModel | null {
  for (const series of IPHONE_SERIES) {
    for (const model of series.models) {
      if (model.slug === s) return model;
    }
  }
  return null;
}

export function allModels(): IPhoneModel[] {
  return IPHONE_SERIES.flatMap((s) => s.models);
}
