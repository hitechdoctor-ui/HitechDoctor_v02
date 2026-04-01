import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { findDesktopBrandBySlug, DESKTOP_BRANDS } from "@/data/desktop-brands";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { RepairPriceBreakdownCard } from "@/components/repair-price-breakdown";
import {
  REPAIR_CTA_FLEX,
  REPAIR_CTA_FULL,
  REPAIR_CTA_GRADIENT,
  REPAIR_CTA_WIDE,
  REPAIR_OUTLINE_CALL,
  REPAIR_PRICE_ROW_BOOK,
  REPAIR_SIDEBAR_ESHOP,
} from "@/lib/repair-touch-ui";
import {
  CheckCircle2, Monitor, HardDrive, Cpu, Zap, Shield,
  ChevronRight, Phone, Star, Clock, Wrench, ShoppingCart, ArrowRight,
  MemoryStick, RefreshCw, Bug, Gamepad2,
} from "lucide-react";

function SidebarProducts({ subcategory, label }: { subcategory: string; label: string }) {
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products", subcategory],
    queryFn: () => fetch(`/api/products?category=desktop&subcategory=${subcategory}`).then((r) => r.json()),
  });
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 border-b border-white/8 pb-2">{label}</p>
      {products.length === 0 && <p className="text-xs text-muted-foreground/50">Δεν βρέθηκαν προϊόντα.</p>}
      {products.slice(0, 4).map((p: any) => (
        <Link key={p.id} href={`/eshop/${p.slug || p.id}`}>
          <div className="flex gap-3 p-2 rounded-xl border border-white/8 bg-white/2 hover:border-primary/30 hover:bg-primary/4 transition-all cursor-pointer group" data-testid={`sidebar-product-${p.id}`}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-14 h-14 rounded-lg object-contain bg-white/5 shrink-0 p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
              <p className="text-sm font-extrabold text-primary mt-1">€{p.price}</p>
            </div>
          </div>
        </Link>
      ))}
      <Link href="/eshop?tab=desktop">
        <Button size="sm" variant="outline" className={`${REPAIR_SIDEBAR_ESHOP} border-primary/30 text-primary hover:bg-primary/10`} data-testid="button-sidebar-eshop">
          <ShoppingCart className="w-3 h-3 mr-1.5" />Μεταχειρισμένοι PC στο eShop
        </Button>
      </Link>
    </div>
  );
}

interface PriceRowProps {
  icon: typeof Monitor;
  label: string;
  price: number;
  suffix?: string;
  note?: string;
  highlight?: boolean;
  onBook?: () => void;
}

function PriceRow({ icon: Icon, label, price, suffix = "+", note, highlight, onBook }: PriceRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${highlight ? "border-primary/40 bg-primary/8 shadow-[0_0_16px_rgba(0,210,200,0.1)]" : "border-white/10 bg-card hover:border-white/20"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${highlight ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-white/10"}`}>
          <Icon className={`w-5 h-5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-sm text-foreground">{label}</p>
          {note && <p className="text-[10px] text-muted-foreground mt-0.5">{note}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <p className={`text-2xl font-extrabold ${highlight ? "text-primary" : "text-foreground"}`}>
            €{price}<span className="text-base font-semibold text-muted-foreground">{suffix}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">συμπ. ΦΠΑ</p>
        </div>
        {onBook && (
          <Button onClick={onBook} size="sm" className={`${REPAIR_PRICE_ROW_BOOK} shrink-0`}
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            data-testid={`button-book-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            Ραντεβού
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DesktopRepairDetail() {
  const [, params] = useRoute("/episkevi-desktop/:slug");
  const brandSlug = params?.slug ?? "";
  const brand = findDesktopBrandBySlug(brandSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultTotal, setModalDefaultTotal] = useState<number | undefined>();
  const openRepairModal = (totalInclVat: number) => {
    setModalDefaultTotal(totalInclVat);
    setModalOpen(true);
  };

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Κατηγορία δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Η κατηγορία δεν υπάρχει στη βάση μας.</p>
          <Link href="/services/episkeui-desktop">
            <Button className={REPAIR_CTA_GRADIENT} style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}>
              ← Επιστροφή στην Επισκευή Υπολογιστών
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `Επισκευή & Αναβάθμιση ${brand.name} — Τιμές RAM, SSD, PSU, OS | HiTech Doctor Αθήνα`;
  const pageDesc = `Επισκευή & αναβάθμιση ${brand.name} στην Αθήνα (${brand.seriesLabel}). RAM/SSD από €${brand.ramUpgradeFrom}, τροφοδοτικό από €${brand.psuFrom}, εγκατάσταση OS €${brand.osInstallFrom}. Γραπτή εγγύηση.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-desktop/${brand.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Επισκευή & Αναβάθμιση ${brand.name}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "HiTech Doctor",
      "url": "https://hitechdoctor.com",
      "telephone": "+306981882005",
      "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
    },
    "description": pageDesc,
    "serviceType": `Επισκευή ${brand.name}`,
    "areaServed": "Αθήνα",
    "offers": [
      { "@type": "Offer", "name": `Αναβάθμιση RAM ${brand.name}`, "price": brand.ramUpgradeFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Αναβάθμιση SSD ${brand.name}`, "price": brand.ssdUpgradeFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Αντικατάσταση PSU ${brand.name}`, "price": brand.psuFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Εγκατάσταση OS ${brand.name}`, "price": brand.osInstallFrom, "priceCurrency": "EUR" },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
      { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Επισκευή Υπολογιστή", "item": "https://hitechdoctor.com/services/episkeui-desktop" },
      { "@type": "ListItem", "position": 4, "name": brand.name, "item": canonicalUrl },
    ],
  };

  const otherBrands = DESKTOP_BRANDS.filter((b) => b.slug !== brand.slug);
  const isGaming = brand.slug === "custom-gaming-pc";
  const isImac = brand.slug === "apple-imac";
  const defaultBookTotal = brand.screenPriceFrom ?? brand.ramUpgradeFrom;

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo title={pageTitle} description={pageDesc} url={canonicalUrl} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={`επισκευή ${brand.name}, αναβάθμιση ${brand.name}, ${brand.name} service Αθήνα, ${brand.seriesLabel}, εγκατάσταση windows, αφαίρεση ιών PC`} />
      </Helmet>

      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-desktop" className="hover:text-primary transition-colors">Επισκευή Υπολογιστή</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium">{brand.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-wrap items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {brand.tag && <Badge className={`text-[10px] font-bold ${brand.tag === "Gaming" ? "bg-purple-500 text-white" : "bg-primary text-black"}`}>{brand.tag}</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground leading-tight">
              {isGaming ? "Επισκευή & Αναβάθμιση" : "Επισκευή"} {brand.name}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">{brand.seriesLabel} · Αθήνα, Ελλάδα</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[{ icon: Shield, text: "Γραπτή Εγγύηση" }, { icon: Clock, text: "Γρήγορη Εξυπηρέτηση" }, { icon: Wrench, text: "Δωρεάν Διάγνωση" }].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <b.icon className="w-3.5 h-3.5 text-primary" />{b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anchor nav */}
        <div className="sticky top-16 z-30 -mx-4 px-4 bg-background/80 backdrop-blur border-b border-white/8 mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {[
              { href: "#section-prices",    label: "Τιμές" },
              { href: "#section-ram",       label: "RAM" },
              { href: "#section-ssd",       label: "SSD" },
              { href: "#section-psu",       label: "Τροφοδοτικό" },
              { href: "#section-thermal",   label: "Thermal" },
              { href: "#section-os",        label: "OS / Windows" },
              { href: "#section-virus",     label: "Αφαίρεση Ιών" },
              ...(isImac ? [{ href: "#section-screen", label: "Οθόνη iMac" }] : []),
              ...(isGaming ? [{ href: "#section-gpu", label: "GPU" }] : []),
              { href: "#section-form",      label: "Αίτημα" },
              { href: "#section-faq",       label: "FAQ" },
            ].map((a) => (
              <a key={a.href} href={a.href}
                className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                data-testid={`anchor-${a.href.replace("#", "")}`}>
                {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-10">

            {/* Price table */}
            <section id="section-prices">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Τιμοκατάλογος — {brand.name}</h2>
              {brand.notes && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-xs text-amber-300 mb-4">
                  {brand.notes}
                </div>
              )}
              <div className="space-y-3">
                {brand.screenPriceFrom && (
                  <PriceRow icon={Monitor}    label="Αλλαγή Οθόνης iMac"      price={brand.screenPriceFrom} note="iMac 21.5 / 24 inch / display assembly" highlight onBook={() => openRepairModal(brand.screenPriceFrom!)} />
                )}
                <PriceRow icon={MemoryStick} label="Αναβάθμιση RAM"            price={brand.ramUpgradeFrom}  suffix="+ εξαρτ." note="Εργασία τοποθέτησης (εκτός κόστους RAM)"   highlight={!brand.screenPriceFrom} onBook={() => openRepairModal(brand.ramUpgradeFrom)} />
                <PriceRow icon={HardDrive}   label="Αναβάθμιση SSD / HDD"      price={brand.ssdUpgradeFrom}  suffix="+ εξαρτ." note="SATA ή NVMe M.2 — cloning δεδομένων"       onBook={() => openRepairModal(brand.ssdUpgradeFrom)} />
                <PriceRow icon={Zap}         label="Τροφοδοτικό (PSU)"          price={brand.psuFrom}         suffix="+ εξαρτ." note="Εργασία + διάγνωση (εκτός κόστους PSU)"  onBook={() => openRepairModal(brand.psuFrom)} />
                <PriceRow icon={Cpu}         label="Thermal Paste CPU/GPU"      price={brand.thermalPrice}    suffix=""         note="Αντικατάσταση πάστας + καθαρισμός"         onBook={() => openRepairModal(brand.thermalPrice)} />
                <PriceRow icon={RefreshCw}   label="Εγκατάσταση OS"            price={brand.osInstallFrom}   suffix=""         note="Windows 10/11 / macOS / Linux (εργασία)"   onBook={() => openRepairModal(brand.osInstallFrom)} />
                <PriceRow icon={Bug}         label="Αφαίρεση Ιών / Malware"    price={brand.virusRemovalFrom} suffix=""         note="Πλήρης καθαρισμός + προστασία"             onBook={() => openRepairModal(brand.virusRemovalFrom)} />
                <PriceRow icon={Monitor}     label="Διάγνωση Μητρικής"          price={brand.motherboardDiagFrom} suffix="+"    note="Έλεγχος + κοστολόγηση επισκευής"          onBook={() => openRepairModal(brand.motherboardDiagFrom)} />
                {isGaming && (
                  <PriceRow icon={Gamepad2}  label="Επισκευή GPU (Κάρτα Γραφικών)" price={50} suffix="+" note="Reballing, κοντύλι, αντικατάσταση ανεμιστήρα" onBook={() => openRepairModal(50)} />
                )}
              </div>
              <PriceDisclaimer className="mt-3" />
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[{ icon: Shield, label: "Εγγύηση", sub: "Γραπτή εγγύηση" }, { icon: Clock, label: "Γρήγορα", sub: "Αυθημερόν/1-2 ώρες" }, { icon: Star, label: "Τεχνικοί", sub: "Εξειδικευμένοι" }].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl border border-white/8 bg-white/2">
                    <b.icon className="w-5 h-5 text-primary mb-1.5" />
                    <p className="text-xs font-bold text-foreground">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* iMac screen */}
            {isImac && (
              <section id="section-screen">
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Οθόνης iMac</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Το iMac είναι All-in-One — η οθόνη αποτελεί μέρος της κύριας μονάδας. Αντικαθιστούμε το panel ή ολόκληρο το display assembly με <strong className="text-foreground">ανταλλακτικό ίδιας ποιότητας</strong>. Η αποσυναρμολόγηση iMac απαιτεί εξειδικευμένα εργαλεία.
                </p>
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-xs text-amber-300 mb-3">
                  iMac M1/M2/M3 (2021+): Εξαιρετικά πολύπλοκη αποσυναρμολόγηση. Επικοινωνήστε για αξιολόγηση πριν.
                </div>
                <ul className="list-none space-y-1.5">
                  {["Αντικατάσταση LCD/IPS display assembly", "Δοκιμή φωτεινότητας, χρωμάτων & αδειών pixel", "Επισκευή backlight αν απαιτείται", "Γραπτή εγγύηση εργασίας & ανταλλακτικού"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                    </li>
                  ))}
                </ul>
                {brand.screenPriceFrom != null && (
                  <RepairPriceBreakdownCard totalInclVat={brand.screenPriceFrom} className="mt-3" />
                )}
              </section>
            )}

            {/* RAM */}
            <section id="section-ram">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αναβάθμιση RAM — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Ο υπολογιστής σας αργεί, κολλάει σε multitasking ή έχει λίγη μνήμη; Η αύξηση RAM είναι η πιο <strong className="text-foreground">οικονομική βελτίωση απόδοσης</strong>. Ελέγχουμε συμβατότητα, τοποθετούμε και δοκιμάζουμε stability.
              </p>
              {isImac && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-xs text-amber-300 mb-3">
                  iMac M1/M2/M3: Unified memory ενσωματωμένη στο chip — δεν αναβαθμίζεται. Ισχύει μόνο για Intel iMac (2009–2020).
                </div>
              )}
              <ul className="list-none space-y-1.5">
                {["Έλεγχος τύπου (DDR3/DDR4/DDR5) & slots", "Επέκταση ή αντικατάσταση modules", "Δοκιμή stability (MemTest86)", "Εγγύηση εργασίας & ανταλλακτικού"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <RepairPriceBreakdownCard totalInclVat={brand.ramUpgradeFrom} className="mt-3" />
            </section>

            {/* SSD */}
            <section id="section-ssd">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αναβάθμιση SSD / HDD — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αντικατάσταση παλιού HDD ή αναβάθμιση σε γρήγορο NVMe M.2 SSD. Ο υπολογιστής <strong className="text-foreground">εκκινεί σε δευτερόλεπτα</strong> και τα προγράμματα ανοίγουν στιγμιαία. Μεταφέρουμε τα δεδομένα σας χωρίς απώλεια.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Αναβάθμιση SSD", items: ["SATA 2.5\" ή NVMe M.2 — κατάλληλο για το PC σας", "Cloning OS & δεδομένων (disk-to-disk)", "Βελτιστοποίηση Windows μετά την εγκατάσταση", "Εγγύηση εργασίας"] },
                  { title: "Αντικατάσταση HDD", items: ["Αντικατάσταση δυσλειτουργικού ή αργού HDD", "Ανάκτηση δεδομένων πριν (αν απαιτείται)", "Εγκατάσταση OS από την αρχή ή cloning", "Εγγύηση εργασίας"] },
                ].map((card) => (
                  <div key={card.title} className="p-4 rounded-xl border border-white/10 bg-card">
                    <p className="text-sm font-bold text-foreground mb-2">{card.title}</p>
                    <ul className="space-y-1">
                      {card.items.map((i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />{i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <RepairPriceBreakdownCard totalInclVat={brand.ssdUpgradeFrom} className="mt-3" />
            </section>

            {/* PSU */}
            <section id="section-psu">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Τροφοδοτικό (PSU) — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Ο υπολογιστής δεν ανάβει, σβήνει αυτόματα ή κάνει "κλικ"; Συχνά η αιτία είναι το τροφοδοτικό. Κάνουμε διάγνωση, ελέγχουμε τάσεις και αντικαθιστούμε με πιστοποιημένο PSU <strong className="text-foreground">80+ Bronze ή Gold</strong>.
              </p>
              <ul className="list-none space-y-1.5">
                {["Μέτρηση τάσεων PSU (multimeter / tester)", "Αντικατάσταση με 80+ πιστοποιημένο τροφοδοτικό", "Δοκιμή φορτίου μετά την εγκατάσταση", "Εγγύηση εργασίας & ανταλλακτικού"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* Thermal paste */}
            <section id="section-thermal">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Thermal Paste CPU/GPU — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Υπερθέρμανση, throttling και δυνατός ανεμιστήρας; Η αλλαγή θερμοαγώγιμης πάστας μειώνει τις θερμοκρασίες κατά <strong className="text-foreground">10-20°C</strong> στις περισσότερες περιπτώσεις.
              </p>
              <ul className="list-none space-y-1.5">
                {["Αποσυναρμολόγηση & καθαρισμός ψυγείου & ανεμιστήρων", "Αφαίρεση παλιάς θερμοαγώγιμης πάστας", `Τοποθέτηση premium thermal paste (€${brand.thermalPrice})`, "Δοκιμή θερμοκρασιών CPU/GPU υπό φορτίο"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* OS Install */}
            <section id="section-os">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Εγκατάσταση OS — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Εγκατάσταση <strong className="text-foreground">Windows 10 / Windows 11 / macOS / Linux</strong> από μηδέν ή upgrade. Ρύθμιση drivers, updates και βασικών προγραμμάτων. Backup δεδομένων πριν ζητηθεί.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { title: "Windows 10/11", items: ["Καθαρή εγκατάσταση", "Drivers + Windows Update", "Βασικά προγράμματα", "Activation (αν διαθέτετε key)"] },
                  { title: "macOS", items: ["Reinstall / Upgrade macOS", "Βελτιστοποίηση Ventura/Sonoma", "Migration Assistant", "Time Machine setup"] },
                  { title: "Linux", items: ["Ubuntu · Mint · Fedora", "Dual boot με Windows", "Ρύθμιση drivers", "Βασική εκπαίδευση"] },
                ].map((card) => (
                  <div key={card.title} className="p-4 rounded-xl border border-white/10 bg-card">
                    <p className="text-sm font-bold text-foreground mb-2">{card.title}</p>
                    <ul className="space-y-1">
                      {card.items.map((i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />{i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Virus removal */}
            <section id="section-virus">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αφαίρεση Ιών & Malware — {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Ransomware, adware, trojans, spyware; Πλήρης καθαρισμός του συστήματος με επαγγελματικά εργαλεία και ρύθμιση <strong className="text-foreground">antivirus προστασίας</strong> για το μέλλον. Αν ο ιός έχει καταστρέψει το OS, προτείνουμε καθαρή επανεγκατάσταση.
              </p>
              <ul className="list-none space-y-1.5">
                {["Πλήρης scan με MalwareBytes / Kaspersky", "Αφαίρεση malware, adware & PUP", "Έλεγχος startup & services", "Ρύθμιση antivirus & firewall", "Εκπαίδευση ασφαλούς χρήσης"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* GPU section (gaming only) */}
            {isGaming && (
              <section id="section-gpu">
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Επισκευή Κάρτας Γραφικών (GPU)</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Αρτέφακτα, crashes, μαύρη οθόνη ή μη αναγνώριση GPU; Εξειδικευόμαστε σε <strong className="text-foreground">reballing, re-soldering, ανταλλαγή ανεμιστήρων</strong> και thermal pad replacement σε NVIDIA & AMD κάρτες γραφικών.
                </p>
                <ul className="list-none space-y-1.5">
                  {["Διάγνωση GPU — software & hardware", "Reballing BGA chip (για μόνιμη επισκευή)", "Αλλαγή ανεμιστήρα GPU", "Thermal paste & thermal pads GPU", "Επισκευή VRM & capacitors", "Δοκιμή stability (FurMark, 3DMark)"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Repair request */}
            <section id="section-form" className="p-6 rounded-2xl border border-white/10 bg-card">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">Αίτημα Επισκευής — {brand.name}</h2>
              <p className="text-sm text-muted-foreground mb-5">Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας εντός 30 λεπτών.</p>
              <Button onClick={() => openRepairModal(defaultBookTotal)} className={`${REPAIR_CTA_WIDE} shadow-[0_0_24px_rgba(0,210,200,0.25)]`}
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                data-testid="button-open-repair-form">
                <Wrench className="w-4 h-4 mr-2" />Άνοιξε τη Φόρμα Επισκευής
              </Button>
              <div className="mt-4 flex flex-wrap gap-4">
                <a href="tel:+306981882005" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" />6981 882 005
                </a>
                <a href="mailto:info@hitechdoctor.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary" />info@hitechdoctor.com
                </a>
              </div>
            </section>

            {/* Other categories */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">Άλλες Κατηγορίες Υπολογιστών</p>
              <div className="flex flex-wrap gap-2">
                {otherBrands.map((b) => (
                  <Link key={b.slug} href={`/episkevi-desktop/${b.slug}`}>
                    <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-card hover:border-primary/40 hover:text-primary text-muted-foreground transition-all cursor-pointer">{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <section id="section-faq">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Συχνές Ερωτήσεις</h2>
              <div className="space-y-3">
                {[
                  { q: `Πόσο κοστίζει η αναβάθμιση RAM στο ${brand.name};`, a: `Η εργασία αναβάθμισης RAM σε ${brand.name} ξεκινά από €${brand.ramUpgradeFrom} (εκτός κόστους RAM module). Κάνουμε πρώτα δωρεάν έλεγχο συμβατότητας.` },
                  { q: "Αξίζει να αναβαθμίσω σε SSD;", a: "Ναι — η αναβάθμιση από HDD σε SSD είναι η πιο εντυπωσιακή βελτίωση που μπορείτε να κάνετε. Εκκίνηση Windows σε 10-15 δευτερόλεπτα αντί 1-2 λεπτά. Γίνεται cloning των δεδομένων σας χωρίς απώλεια." },
                  { q: "Πόσο χρόνο κάνει η εγκατάσταση Windows;", a: "Καθαρή εγκατάσταση Windows 10/11 + drivers + updates: 2-3 ώρες. Αν συνδυαστεί με αναβάθμιση SSD: 3-4 ώρες συνολικά." },
                  { q: "Μπορώ να σώσω τα δεδομένα μου;", a: "Σχεδόν πάντα. Κάνουμε backup πριν από κάθε εργασία. Αν ο δίσκος έχει βλάβη, γίνεται πρώτα απόπειρα ανάκτησης δεδομένων." },
                  { q: "Δίνετε εγγύηση;", a: "Ναι, κάθε εργασία καλύπτεται από γραπτή εγγύηση. Εγκατάσταση OS: 1 μήνας. Hardware (RAM/SSD): εγγύηση κατασκευαστή. Εργασία: 3 μήνες." },
                  ...(isImac ? [{ q: "Επισκευάζετε iMac M1/M2/M3;", a: "Ναι, επισκευάζουμε iMac M1/M2/M3 αλλά η αποσυναρμολόγηση είναι εξαιρετικά πολύπλοκη. Αλλαγή οθόνης, PSU και καθαρισμός είναι εφικτά. RAM/SSD δεν αναβαθμίζονται (unified)." }] : []),
                  ...(isGaming ? [{ q: "Επισκευάζετε κάρτα γραφικών;", a: "Ναι! Επισκευή GPU (reballing, αλλαγή ανεμιστήρα, thermal paste, VRM) για NVIDIA & AMD. Κόστος από €50+ ανάλογα βλάβης. Δωρεάν διάγνωση πρώτα." }] : []),
                ].map(({ q, a }) => (
                  <details key={q} className="group bg-card pcb-border rounded-xl p-4 cursor-pointer" data-testid={`faq-${q.substring(0, 20).replace(/\s+/g, "-").toLowerCase()}`}>
                    <summary className="flex items-center justify-between font-display font-bold text-sm text-foreground select-none list-none">
                      {q}<ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                    </summary>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="bg-card pcb-border rounded-2xl p-5 border border-primary/20">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 border-b border-white/8 pb-2 mb-3">Σύνοψη Τιμών</p>
                <div className="space-y-2 mb-4">
                  {[
                    ...(brand.screenPriceFrom ? [{ label: "Οθόνη iMac από", price: `€${brand.screenPriceFrom}+`, bold: true }] : []),
                    { label: "RAM (εργασία από)", price: `€${brand.ramUpgradeFrom}+`, bold: !brand.screenPriceFrom },
                    { label: "SSD (εργασία από)", price: `€${brand.ssdUpgradeFrom}+` },
                    { label: "Τροφοδοτικό από", price: `€${brand.psuFrom}+` },
                    { label: "Thermal Paste", price: `€${brand.thermalPrice}` },
                    { label: "Εγκατάσταση OS", price: `€${brand.osInstallFrom}` },
                    { label: "Αφαίρεση Ιών", price: `€${brand.virusRemovalFrom}` },
                    ...(isGaming ? [{ label: "Επισκευή GPU από", price: "€50+" }] : []),
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-bold ${row.bold ? "text-primary" : "text-foreground"}`}>{row.price}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => openRepairModal(defaultBookTotal)} className={`${REPAIR_CTA_FULL} mb-2 shadow-[0_0_20px_rgba(0,210,200,0.25)]`}
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                  data-testid="button-sidebar-book">
                  <Wrench className="w-4 h-4 mr-2" />Κλείσε Ραντεβού
                </Button>
                <a href="tel:+306981882005" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline" data-testid="link-sidebar-phone">
                  <Phone className="w-3.5 h-3.5" /> 6981 882 005
                </a>
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground">Δωρεάν διάγνωση χωρίς δέσμευση</p>
                </div>
              </div>
              <div className="bg-card pcb-border rounded-2xl p-4 border border-white/10">
                <SidebarProducts subcategory="desktop" label="Μεταχειρισμένοι PC" />
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky CTA — πάνω από το bottom app nav */}
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[130] flex gap-2 border-t border-primary/20 bg-background/95 p-3 backdrop-blur lg:hidden">
          <Button onClick={() => openRepairModal(defaultBookTotal)} className={REPAIR_CTA_FLEX}
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            data-testid="button-mobile-book">
            <Wrench className="mr-2 h-4 w-4" />Αίτημα Επισκευής
          </Button>
          <a href="tel:+306981882005" className="shrink-0" aria-label="Κλήση στο 6981 882 005">
            <Button variant="outline" className={REPAIR_OUTLINE_CALL} data-testid="button-mobile-call">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </main>

      <Footer />
      <RepairRequestModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setModalDefaultTotal(undefined);
        }}
        defaultDeviceName={`${brand.name} desktop`}
        defaultTotalInclVat={modalDefaultTotal}
        temperedGlassOffer={false}
      />
    </div>
  );
}
