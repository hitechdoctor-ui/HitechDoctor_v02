import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Package, Shield, Phone, Mail, MapPin, Facebook, Instagram, ExternalLink, Smartphone, Cable, Laptop, Monitor } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const NAV_MENUS = [
  {
    title: "Πληροφορίες",
    links: [
      { label: "Σχετικά με εμάς", href: "/sxetika-me-mas", external: false },
      { label: "Blog",              href: "/blog",           external: false },
      { label: "Συχνές Ερωτήσεις", href: "/faq",            external: false },
      { label: "Επικοινωνία",      href: "/epikoinonia",    external: false },
    ],
  },
  {
    title: "Υπηρεσίες",
    links: [
      { label: "Επισκευή iPhone",   href: "/services/episkeui-iphone",  external: false },
      { label: "Επισκευή Κινητών",  href: "/services/episkeui-kiniton", external: false },
      { label: "Όλες οι Υπηρεσίες", href: "/services",                  external: false },
    ],
  },
  {
    title: "Νομικά & Βοήθεια",
    links: [
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
  { icon: MapPin,label: "Διεύθυνση",value: "Βρείτε μας στον χάρτη", href: "/epikoinonia" },
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 mb-4">
              <span className="text-[10px] text-muted-foreground/60">Αρ. ΓΕΜΗ:</span>
              <span className="text-[10px] font-mono font-semibold text-primary/80">56870309000</span>
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

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} HiTech Doctor. Με επιφύλαξη παντός δικαιώματος. Design & Development by{" "}
            <a href="https://hitechdoctor.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              HiTech Doctor
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/oroi-episkeuis" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
              <Shield className="w-3 h-3 inline mr-1" />
              Όροι & GDPR
            </Link>
            <span className="text-xs text-muted-foreground/30">|</span>
            <Link href="/politiki-cookies" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
              Cookies
            </Link>
            <span className="text-xs text-muted-foreground/30">|</span>
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
