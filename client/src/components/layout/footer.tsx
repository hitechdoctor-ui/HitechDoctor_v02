import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { RepairTrackerSection } from "@/components/repair-tracker-section";
import { Wrench, Package, Shield, Phone, Mail, MapPin, Facebook, Instagram, ExternalLink, Smartphone, Cable, Laptop, Monitor } from "lucide-react";
import { SiTiktok, SiViber } from "react-icons/si";
import { buildViberUrl } from "@/lib/viber";
import {
  BUSINESS_REGISTERED_NAME,
  BUSINESS_TRADE_NAME,
  BUSINESS_GEMI,
  BUSINESS_AFM,
  BUSINESS_DOU,
  formatBusinessAddressOneLine,
  BUSINESS_HOURS_SUMMARY,
} from "@/lib/business-info";

const NAV_MENUS = [
  {
    title: "Πληροφορίες",
    links: [
      { label: "Σχετικά με εμάς", href: "/sxetika-me-mas", external: false },
      { label: "Blog",              href: "/blog",           external: false },
      { label: "Συχνές Ερωτήσεις", href: "/faq",            external: false },
      { label: "Επικοινωνία",      href: "/epikoinonia",    external: false },
      { label: "Web Designer",     href: "/web-designer",   external: false },
    ],
  },
  {
    title: "Υπηρεσίες",
    links: [
      { label: "Επισκευή iPhone",   href: "/services/episkeui-iphone",  external: false },
      { label: "Επισκευή Κινητών",  href: "/services/episkeui-kiniton", external: false },
      { label: "IPSW Download (iPhone)", href: "/services/ipsw-download", external: false },
      { label: "IMEI Check", href: "/services/imei-check", external: false },
      { label: "Αποστολή Συσκευής (BoxNow)", href: "/services/apostoli-syskevis", external: false },
      { label: "Όλες οι Υπηρεσίες", href: "/services",                  external: false },
    ],
  },
  {
    title: "Νομικά & Βοήθεια",
    links: [
      { label: "Πολιτική Επιστροφών",      href: "/politiki-epistrofon", external: false },
      { label: "Όροι Χρήσης",              href: "/oroi-chrisis",        external: false },
      { label: "Τρόποι Πληρωμής",         href: "/tropoi-pliromis",   external: false },
      { label: "Όροι Επισκευής",           href: "/oroi-episkeuis",    external: false },
      { label: "Πολιτική Cookies",         href: "/politiki-cookies",  external: false },
      { label: "Δήλωση Προσβασιμότητας",  href: "/prosvassimotita",   external: false },
    ],
  },
];

const CONTACT = [
  { icon: Phone, label: "Τηλέφωνο", value: "698 188 2005",      href: "tel:6981882005" },
  { icon: Mail,  label: "Email",    value: "info@hitechdoctor.com", href: "mailto:info@hitechdoctor.com" },
  { icon: MapPin,label: "Διεύθυνση",value: formatBusinessAddressOneLine(), href: "/epikoinonia" },
];

// ── Meta για κατηγορίες — ίδιο με navbar ──────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; tab: string }> = {
  mobile:             { label: "Κινητά Τηλέφωνα",      icon: Smartphone, tab: "mobile" },
  "screen-protectors":{ label: "Τζάμια Προστασίας",    icon: Shield,     tab: "screen-protectors" },
  cases:              { label: "Θήκες Κινητών",         icon: Package,    tab: "cases" },
  chargers:           { label: "Φορτιστές & Καλώδια",  icon: Cable,      tab: "chargers" },
  laptop:             { label: "Μεταχειρισμένα Laptop",          icon: Laptop,   tab: "laptop" },
  desktop:            { label: "Μεταχειρισμένοι Υπολογιστές", icon: Monitor,  tab: "desktop" },
};

const FALLBACK_ESHOP = [
  { label: "Κινητά Τηλέφωνα",      href: "/eshop?tab=mobile" },
  { label: "Τζάμια Προστασίας",    href: "/eshop?tab=screen-protectors" },
  { label: "Θήκες Κινητών",        href: "/eshop?tab=cases" },
  { label: "Φορτιστές & Καλώδια",  href: "/eshop?tab=chargers" },
  { label: "Μεταχειρισμένα Laptop",          href: "/eshop?tab=laptop" },
  { label: "Μεταχειρισμένοι Υπολογιστές", href: "/eshop?tab=desktop" },
];

export function Footer() {
  const { data: categoryRows = [] } = useQuery<{ category: string; subcategory: string | null; count: number }[]>({
    queryKey: ["/api/products/categories"],
    staleTime: 5 * 60 * 1000,
  });

  // Build dynamic eShop links from DB
  const eshopLinks = (() => {
    const seen = new Set<string>();
    const result: { label: string; href: string }[] = [];
    categoryRows.forEach((row) => {
      const key = row.subcategory ?? row.category;
      if (seen.has(key)) return;
      seen.add(key);
      const meta = CATEGORY_META[key] ?? CATEGORY_META[row.category];
      if (!meta) return;
      result.push({ label: meta.label, href: `/eshop?tab=${meta.tab}` });
    });
    return result.length > 0 ? result : FALLBACK_ESHOP;
  })();

  return (
    <footer className="border-t border-white/8 bg-card/50 backdrop-blur-sm mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-12">
          <RepairTrackerSection />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Wrench className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                HiTech <span className="text-primary">Doctor</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-3">
              Επαγγελματική επισκευή κινητών, tablet, laptop και gaming console.
              Αξεσουάρ iPhone υψηλής ποιότητας. Εγγύηση εργασίας 6 μήνες.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 mb-4 space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              <p className="text-foreground font-semibold text-xs">Στοιχεία επιχείρησης</p>
              <p>
                <span className="text-muted-foreground/70">Επωνυμία: </span>
                {BUSINESS_REGISTERED_NAME}
                {BUSINESS_REGISTERED_NAME !== BUSINESS_TRADE_NAME && (
                  <span className="text-muted-foreground/60"> ({BUSINESS_TRADE_NAME})</span>
                )}
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{formatBusinessAddressOneLine()}</span>
              </p>
              <p>
                <span className="text-muted-foreground/70">Αρ. ΓΕΜΗ: </span>
                <span className="font-mono text-primary/80">{BUSINESS_GEMI}</span>
              </p>
              {BUSINESS_AFM ? (
                <p>
                  <span className="text-muted-foreground/70">ΑΦΜ: </span>
                  <span className="font-mono">{BUSINESS_AFM}</span>
                  {BUSINESS_DOU ? (
                    <>
                      <span className="text-muted-foreground/50"> · </span>
                      <span className="text-muted-foreground/70">ΔΟΥ: </span>
                      <span>{BUSINESS_DOU}</span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="text-muted-foreground/55 text-[10px]">
                  ΑΦΜ και ΔΟΥ: αναγράφονται στα εκδιδόμενα παραστατικά· διατίθενται και κατόπιν αιτήματος στο {CONTACT[1].value}.
                </p>
              )}
              <p className="text-muted-foreground/80 pt-1 border-t border-white/6">
                <span className="text-muted-foreground/70">Ωράριο: </span>
                {BUSINESS_HOURS_SUMMARY}
              </p>
            </div>

            <div className="space-y-2.5 mb-5">
              {CONTACT.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5">
                  <c.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  {c.href ? (
                    <a href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{c.value}</a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{c.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="https://facebook.com/hitechdoctor" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="footer-social-facebook"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/10 transition-all">
                <Facebook className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <a href="https://instagram.com/hitechdoctor" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="footer-social-instagram"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-pink-500/40 hover:bg-pink-500/10 transition-all">
                <Instagram className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <a href="https://tiktok.com/@hitechdoctor" target="_blank" rel="noopener noreferrer" aria-label="TikTok" data-testid="footer-social-tiktok"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/10 transition-all">
                <SiTiktok className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <a href={buildViberUrl()} target="_blank" rel="noopener noreferrer" aria-label="Viber" data-testid="footer-social-viber"
                className="w-8 h-8 rounded-lg bg-[#7360f2]/15 border border-[#7360f2]/35 flex items-center justify-center hover:border-[#7360f2]/55 hover:bg-[#7360f2]/25 transition-all">
                <SiViber className="w-3.5 h-3.5 text-[#7360f2]" />
              </a>
            </div>
          </div>

          {/* Dynamic eShop column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-primary" />
              eShop
            </h3>
            <ul className="space-y-2.5">
              {eshopLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                    data-testid={`footer-eshop-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/eshop" className="text-sm text-primary/70 hover:text-primary transition-colors font-medium" data-testid="footer-eshop-all">
                  → Όλα τα Προϊόντα
                </Link>
              </li>
            </ul>
          </div>

          {/* Static nav menus */}
          {NAV_MENUS.map((menu) => (
            <div key={menu.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
                {menu.title}
              </h3>
              <ul className="space-y-2.5">
                {menu.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                      data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {l.label}
                      {l.external && <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-4 border-t border-white/5">
          <PriceDisclaimer className="text-center max-w-2xl mx-auto" />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} HiTech Doctor. Με επιφύλαξη παντός δικαιώματος. Design & Development by{" "}
            <a href="https://hitechdoctor.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              HiTech Doctor
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <Link href="/politiki-epistrofon" className="text-xs text-muted-foreground/60 hover:text-primary transition-colors">
              Πολιτική Επιστροφών
            </Link>
            <span className="text-xs text-muted-foreground/30 hidden sm:inline">|</span>
            <Link href="/oroi-chrisis" className="text-xs text-muted-foreground/60 hover:text-primary transition-colors">
              Όροι Χρήσης
            </Link>
            <span className="text-xs text-muted-foreground/30 hidden sm:inline">|</span>
            <Link href="/oroi-episkeuis" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
              <Shield className="w-3 h-3 inline mr-1" />
              Όροι επισκευής
            </Link>
            <span className="text-xs text-muted-foreground/30 hidden sm:inline">|</span>
            <Link href="/politiki-cookies" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
              Cookies
            </Link>
            <span className="text-xs text-muted-foreground/30 hidden sm:inline">|</span>
            <Link href="/eshop" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
              <Package className="w-3 h-3 inline mr-1" />
              eShop
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
