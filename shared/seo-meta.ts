export const CANONICAL_SITE_ORIGIN = "https://hitechdoctor.com";

export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export type OgType = "website" | "article" | "product";

export interface PageSeoMeta {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: OgType;
}

export interface StaticSeoEntry {
  title: string;
  description: string;
  image?: string;
  type?: OgType;
}

/** Αποφεύγει διπλό suffix όταν το title ήδη αναφέρει HiTech Doctor. */
export function buildDocumentTitle(title: string): string {
  const t = title.trim();
  if (/HiTech Doctor/i.test(t)) return t;
  return `${t} | HiTech Doctor`;
}

/** Meta description ~160 χαρακτήρες. */
export function clampMetaDescription(description: string, max = 158): string {
  const d = description.trim().replace(/\s+/g, " ");
  if (d.length <= max) return d;
  const cut = d.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > 48 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${base}…`;
}

export function normalizeSeoPath(pathname: string): string {
  let p = pathname.trim().split("?")[0]?.split("#")[0] ?? "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export function resolveAbsoluteImageUrl(
  image: string | null | undefined,
  siteOrigin = CANONICAL_SITE_ORIGIN,
): string {
  const fallback = `${siteOrigin}${DEFAULT_OG_IMAGE_PATH}`;
  if (!image?.trim()) return fallback;
  const img = image.trim();
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("//")) return `https:${img}`;
  return `${siteOrigin}${img.startsWith("/") ? img : `/${img}`}`;
}

export function buildPageUrl(path: string, siteOrigin = CANONICAL_SITE_ORIGIN): string {
  const normalized = normalizeSeoPath(path);
  return normalized === "/" ? `${siteOrigin}/` : `${siteOrigin}${normalized}`;
}

const ESHOP_OG = "/images/refurbished-othones-iphone.png";

/** Στατικά meta για δημόσιες σελίδες — χρησιμοποιούνται από client Seo και server HTML injection. */
export const STATIC_PAGE_SEO: Record<string, StaticSeoEntry> = {
  "/": {
    title: "HiTech Doctor | Εξειδικευμένο Κέντρο Επισκευής Tech",
    description:
      "Ο τεχνολογικός σας γιατρός στην Αθήνα. Επαγγελματική επισκευή σε iPhone, Samsung, Xiaomi, Tablet, Laptop, Mac & IT Support με 12 χρόνια εμπειρίας.",
  },
  "/services": {
    title: "Υπηρεσίες Επισκευής & IT Support",
    description:
      "Οι μόνοι στην Ελλάδα με εξειδικευμένη αντικατάσταση οθόνης/υγείας Apple Watch! Άμεση επισκευή PlayStation, iMac, Dell, HP, Lenovo και gaming κονσολών.",
  },
  "/services/episkeui-kiniton": {
    title: "Επισκευή Κινητών Τηλεφώνων",
    description: "Επισκευή smartphone όλων των μαρκών — οθόνη, μπαταρία, θύρες. HiTech Doctor Μοσχάτο.",
  },
  "/services/episkeui-iphone": {
    title: "Επισκευή iPhone Αθήνα",
    description: "Εξειδικευμένη επισκευή iPhone — οθόνη, μπαταρία, Face ID, θύρες. Express service στο Μοσχάτο.",
  },
  "/services/episkeui-samsung": {
    title: "Επισκευή Samsung Αθήνα",
    description: "Επισκευή Samsung Galaxy — AMOLED οθόνη, μπαταρία, θύρες φόρτισης. HiTech Doctor.",
  },
  "/services/episkeui-xiaomi": {
    title: "Επισκευή Xiaomi / Redmi / POCO",
    description: "Επισκευή Xiaomi, Redmi και POCO — οθόνη, μπαταρία, θύρες. Γρήγορα & με εγγύηση.",
  },
  "/services/episkeui-huawei": {
    title: "Επισκευή Huawei",
    description: "Επισκευή Huawei smartphone & tablet — οθόνη, μπαταρία, θύρες. HiTech Doctor Αθήνα.",
  },
  "/services/episkeui-oneplus": {
    title: "Επισκευή OnePlus",
    description: "Επισκευή OnePlus — οθόνη AMOLED, μπαταρία, θύρες. Εξειδικευμένο service στο Μοσχάτο.",
  },
  "/services/episkeui-laptop": {
    title: "Επισκευή Laptop",
    description: "Επισκευή laptop Dell, HP, Lenovo, MacBook — οθόνη, μπαταρία, SSD, πληκτρολόγιο.",
  },
  "/services/episkeui-tablet": {
    title: "Επισκευή Tablet",
    description: "Επισκευή iPad, Samsung Tab και άλλων tablet — οθόνη, μπαταρία, θύρες.",
  },
  "/services/episkeui-desktop": {
    title: "Επισκευή Desktop & IT Support",
    description: "Επισκευή υπολογιστών, upgrade, δίκτυα και IT support για επιχειρήσεις & ιδιώτες.",
  },
  "/services/episkeui-apple-watch": {
    title: "Επισκευή Apple Watch",
    description: "Εξειδικευμένη επισκευή Apple Watch — οθόνη, μπαταρία, Digital Crown. HiTech Doctor.",
  },
  "/services/episkeui-playstation": {
    title: "Επισκευή PlayStation",
    description: "Επισκευή PS4 & PS5 — HDMI, θερμική πάστα, SSD upgrade, controller. Express service.",
  },
  "/services/imei-check": {
    title: "IMEI Check — Δωρεάν έλεγχος συσκευής",
    description:
      "Έλεγχος IMEI 15 ψηφίων: μοντέλο, iCloud/Find My, εγγύηση. Οδηγίες *#06*, HiTech Doctor.",
  },
  "/services/ipsw-download": {
    title: "IPSW Download — Λήψη Firmware iPhone/iPad",
    description: "Κατέβασε επίσημα IPSW firmware για iPhone & iPad. HiTech Doctor Apple Expert Hub.",
  },
  "/services/apostoli-syskevis": {
    title: "Αποστολή Συσκευής για Επισκευή",
    description: "Στείλε τη συσκευή σου για επισκευή με Box Now — πανελλαδική αποστολή & επιστροφή.",
  },
  "/tools/screen-protector-checker": {
    title: "Έλεγχος Συμβατότητας Τζαμιού",
    description:
      "Διαδραστικό εργαλείο: βρείτε ποιες συσκευές μοιράζονται το ίδιο προστατευτικό τζάμι οθόνης.",
  },
  "/apple-service": {
    title: "Apple Service — Εξειδικευμένο Apple Hub",
    description: "Apple Expert Hub: επισκευές iPhone/iPad/Mac, IPSW, IMEI check, genuine parts.",
  },
  "/web-designer": {
    title: "Web Designer Αθήνα — Κατασκευή Ιστοσελίδων & E-Shop",
    description:
      "Κατασκευή επαγγελματικών ιστοσελίδων και e-shops στην Αθήνα. React, SEO, Tailwind CSS.",
  },
  "/eshop-home": {
    title: "eShop HiTech Doctor",
    description: "Online κατάστημα κινητών, αξεσουάρ iPhone και μεταχειρισμένων laptop.",
    image: ESHOP_OG,
  },
  "/eshop": {
    title: "eShop — Αξεσουάρ & Κινητά iPhone",
    description:
      "Κινητά τηλέφωνα, τζάμια προστασίας iPhone, θήκες και φορτιστές. Δωρεάν αποστολή από €30.",
    image: ESHOP_OG,
  },
  "/blog": {
    title: "Blog — Συμβουλές & Οδηγοί Tech",
    description: "Άρθρα για επισκευή κινητών, συντήρηση συσκευών και tips από τους τεχνικούς μας.",
    type: "website",
  },
  "/check-status": {
    title: "Έλεγχος Κατάστασης Επισκευής",
    description: "Δείτε online την πρόοδο της επισκευής σας με τον κωδικό παρακολούθησης.",
  },
  "/contact": {
    title: "Επικοινωνία & Τοποθεσία",
    description:
      "Βρες μας στο Μοσχάτο, κάλεσε ή στείλε μήνυμα για άμεση τεχνική υποστήριξη και κοστολόγηση.",
  },
  "/epikoinonia": {
    title: "Επικοινωνία & Τοποθεσία",
    description:
      "Βρες μας στο Μοσχάτο, κάλεσε ή στείλε μήνυμα για άμεση τεχνική υποστήριξη και κοστολόγηση.",
  },
  "/sxetika-me-mas": {
    title: "Ποιος είναι ο HiTech Doctor; | 12 Χρόνια Εμπειρίας",
    description:
      "Γνωρίστε την ομάδα μας. Αξιόπιστες, γρήγορες και εγγυημένες λύσεις για κάθε ηλεκτρονική συσκευή.",
  },
  "/faq": {
    title: "Συχνές Ερωτήσεις (FAQ)",
    description: "Απαντήσεις σε συχνές ερωτήσεις για επισκευές, εγγύηση, τιμές και αποστολές.",
  },
  "/tropoi-pliromis": {
    title: "Τρόποι Πληρωμής",
    description: "Κάρτα, μετρητά, τραπεζική κατάθεση και άλλοι τρόποι πληρωμής στο HiTech Doctor.",
  },
  "/oroi-episkeuis": {
    title: "Όροι Επισκευής",
    description: "Όροι και προϋποθέσεις επισκευής συσκευών στο HiTech Doctor.",
  },
  "/politiki-cookies": {
    title: "Πολιτική Cookies",
    description: "Πώς χρησιμοποιούμε cookies στο hitechdoctor.com.",
  },
  "/politiki-epistrofon": {
    title: "Πολιτική Επιστροφών",
    description: "Όροι επιστροφών και αλλαγών για αγορές από το eShop HiTech Doctor.",
  },
  "/oroi-chrisis": {
    title: "Όροι Χρήσης Ιστοσελίδας",
    description: "Όροι χρήσης του hitechdoctor.com.",
  },
  "/prosvassimotita": {
    title: "Δήλωση Προσβασιμότητας",
    description: "Δέσμευση του HiTech Doctor για προσβάσιμο περιεχόμενο και υπηρεσίες.",
  },
};

export const DEFAULT_PAGE_SEO: StaticSeoEntry = {
  title: "HiTech Doctor | Εξειδικευμένο Κέντρο Επισκευής Tech",
  description:
    "Επισκευή iPhone, Samsung, laptop & tablet στο Μοσχάτο. Express service, γραπτή εγγύηση, eShop.",
};

export function staticSeoToPageMeta(
  entry: StaticSeoEntry,
  path: string,
  siteOrigin = CANONICAL_SITE_ORIGIN,
): PageSeoMeta {
  return {
    title: entry.title,
    description: entry.description,
    image: entry.image,
    type: entry.type,
    url: buildPageUrl(path, siteOrigin),
  };
}
