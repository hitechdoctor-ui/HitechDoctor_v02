import { Link } from "wouter";
import { Wrench, Package, Shield, Phone, Mail, MapPin, Facebook, Instagram, ExternalLink } from "lucide-react";

const NAV_MENUS = [
  {
    title: "Νομικά & Πολιτική",
    links: [
      { label: "Όροι Τεχνικού Ελέγχου & Επισκευής", href: "/oroi-episkeuis", external: false },
    ],
  },
  {
    title: "Υπηρεσίες",
    links: [
      { label: "Επισκευή iPhone",    href: "/services/episkeui-iphone",  external: false },
      { label: "Επισκευή Κινητών",  href: "/services/episkeui-kiniton", external: false },
      { label: "Όλες οι Υπηρεσίες", href: "/services",                  external: false },
    ],
  },
  {
    title: "eShop",
    links: [
      { label: "Τζάμια Προστασίας", href: "/eshop", external: false },
      { label: "Θήκες iPhone",       href: "/eshop", external: false },
      { label: "Φορτιστές & Καλώδια",href: "/eshop", external: false },
    ],
  },
];

const CONTACT = [
  { icon: Phone, label: "Τηλέφωνο", value: "698 188 2005", href: "tel:6981882005" },
  { icon: Mail,  label: "Email",    value: "info@hitechdoctor.gr", href: "mailto:info@hitechdoctor.gr" },
  { icon: MapPin,label: "Διεύθυνση", value: "Αθήνα, Ελλάδα", href: null },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-card/50 backdrop-blur-sm mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

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
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Επαγγελματική επισκευή κινητών, tablet, laptop και gaming console.
              Αξεσουάρ iPhone υψηλής ποιότητας.
            </p>
            {/* Contact */}
            <div className="space-y-2.5">
              {CONTACT.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5">
                  <c.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  {c.href ? (
                    <a
                      href={c.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{c.value}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all"
              >
                <Facebook className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all"
              >
                <Instagram className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Nav menus */}
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
            © {new Date().getFullYear()} HiTech Doctor. Όλα τα δικαιώματα διατηρούνται.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/oroi-episkeuis"
              className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <Shield className="w-3 h-3 inline mr-1" />
              Όροι & GDPR
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
