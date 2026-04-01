import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { findLaptopBrandBySlug, LAPTOP_BRANDS } from "@/data/laptop-brands";
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
  CheckCircle2, Monitor, Battery, Keyboard, HardDrive, Cpu, Zap,
  ChevronRight, Phone, Shield, Star, Clock, Wrench, ShoppingCart, ArrowRight,
} from "lucide-react";

function SidebarProducts({ subcategory, label }: { subcategory: string; label: string }) {
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products", subcategory],
    queryFn: () => fetch(`/api/products?category=accessory&subcategory=${subcategory}`).then((r) => r.json()),
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
      <Link href="/eshop">
        <Button size="sm" variant="outline" className={`${REPAIR_SIDEBAR_ESHOP} border-primary/30 text-primary hover:bg-primary/10`} data-testid="button-sidebar-eshop">
          <ShoppingCart className="w-3 h-3 mr-1.5" />Δείτε Όλα στο eShop
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

export default function LaptopRepairDetail() {
  const [, params] = useRoute("/episkevi-laptop/:slug");
  const brandSlug = params?.slug ?? "";
  const brand = findLaptopBrandBySlug(brandSlug);
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
          <h1 className="text-2xl font-bold mb-4">Μάρκα δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Η μάρκα δεν υπάρχει στη βάση μας.</p>
          <Link href="/services/episkeui-laptop">
            <Button className={REPAIR_CTA_GRADIENT} style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}>
              ← Επιστροφή στις μάρκες Laptop
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `Επισκευή ${brand.name} — Τιμές Αλλαγής Οθόνης, Μπαταρίας & Πληκτρολογίου | HiTech Doctor Αθήνα`;
  const pageDesc = `Επισκευή ${brand.name} στην Αθήνα (${brand.seriesLabel}). Αλλαγή οθόνης από €${brand.screenPriceFrom}, μπαταρία από €${brand.batteryPriceFrom}, πληκτρολόγιο από €${brand.keyboardPriceFrom}. Γνήσια ανταλλακτικά, εγγύηση.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-laptop/${brand.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Επισκευή ${brand.name}`,
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
      { "@type": "Offer", "name": `Αλλαγή Οθόνης ${brand.name}`, "price": brand.screenPriceFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Αλλαγή Μπαταρίας ${brand.name}`, "price": brand.batteryPriceFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Αλλαγή Πληκτρολογίου ${brand.name}`, "price": brand.keyboardPriceFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Thermal Paste & Καθαρισμός ${brand.name}`, "price": brand.thermalPrice, "priceCurrency": "EUR" },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
      { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Επισκευή Laptop", "item": "https://hitechdoctor.com/services/episkeui-laptop" },
      { "@type": "ListItem", "position": 4, "name": brand.name, "item": canonicalUrl },
    ],
  };

  const otherBrands = LAPTOP_BRANDS.filter((b) => b.slug !== brand.slug);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo title={pageTitle} description={pageDesc} url={canonicalUrl} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={`επισκευή ${brand.name}, αλλαγή οθόνης ${brand.name}, αλλαγή μπαταρίας ${brand.name}, ${brand.name} service Αθήνα, ${brand.seriesLabel}`} />
      </Helmet>

      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-laptop" className="hover:text-primary transition-colors">Επισκευή Laptop</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium">{brand.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-wrap items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {brand.tag && <Badge className="bg-primary text-black text-[10px] font-bold">{brand.tag}</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground leading-tight">Επισκευή {brand.name}</h1>
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
              { href: "#section-prices",   label: "Τιμές" },
              { href: "#section-screen",   label: "Οθόνη" },
              { href: "#section-battery",  label: "Μπαταρία" },
              { href: "#section-keyboard", label: "Πληκτρολόγιο" },
              { href: "#section-upgrade",  label: "RAM/SSD" },
              { href: "#section-thermal",  label: "Thermal Paste" },
              { href: "#section-form",     label: "Αίτημα" },
              { href: "#section-faq",      label: "FAQ" },
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
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Τιμοκατάλογος Επισκευής {brand.name}</h2>
              <div className="space-y-3">
                <PriceRow icon={Monitor}   label="Αλλαγή Οθόνης"           price={brand.screenPriceFrom}   note={`LCD/IPS/OLED · ${brand.seriesLabel}`} highlight onBook={() => openRepairModal(brand.screenPriceFrom)} />
                <PriceRow icon={Battery}   label="Αλλαγή Μπαταρίας"        price={brand.batteryPriceFrom}  note="Γνήσια ή premium ποιότητας" onBook={() => openRepairModal(brand.batteryPriceFrom)} />
                <PriceRow icon={Keyboard}  label="Αλλαγή Πληκτρολογίου"    price={brand.keyboardPriceFrom} note={brand.slug === "apple-macbook" ? "Αντικατάσταση top-case (περιλαμβάνει πληκτρολόγιο + trackpad)" : "Αντικατάσταση πληκτρολογίου"} onBook={() => openRepairModal(brand.keyboardPriceFrom)} />
                <PriceRow icon={Zap}       label="Θύρα Φόρτισης"            price={brand.portPriceFrom}     note="DC Jack ή USB-C — επισκευή/αντικατάσταση" onBook={() => openRepairModal(brand.portPriceFrom)} />
                <PriceRow icon={Cpu}       label="Thermal Paste & Καθαρισμός" price={brand.thermalPrice} suffix="" note="Θερμοαγώγιμη πάστα + καθαρισμός ανεμιστήρων" onBook={() => openRepairModal(brand.thermalPrice)} />
                {brand.upgradeLabor > 0 && (
                  <PriceRow icon={HardDrive} label="Αναβάθμιση RAM / SSD"  price={brand.upgradeLabor} note="Εργασία αναβάθμισης (ανταλλακτικό extra)" onBook={() => openRepairModal(brand.upgradeLabor)} />
                )}
              </div>
              <PriceDisclaimer className="mt-3" />
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[{ icon: Shield, label: "Εγγύηση", sub: "Γραπτή εγγύηση" }, { icon: Clock, label: "Αυθημερόν", sub: "Οι περισσότερες" }, { icon: Star, label: "Τεχνικοί", sub: "Εξειδικευμένοι" }].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl border border-white/8 bg-white/2">
                    <b.icon className="w-5 h-5 text-primary mb-1.5" />
                    <p className="text-xs font-bold text-foreground">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Screen */}
            <section id="section-screen">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Οθόνης {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Η οθόνη είναι το πιο ευπαθές τμήμα του laptop. Ρωγμές, κηλίδες, flicker ή ολοκληρωτική βλάβη — η αντικατάσταση γίνεται με <strong className="text-foreground">γνήσιο ή συμβατό panel</strong> της ίδιας ανάλυσης και τεχνολογίας (LCD/IPS/OLED).
              </p>
              <ul className="list-none space-y-1.5 mb-4">
                {["Δωρεάν διάγνωση & εντοπισμός κατάλληλου panel", "Αντικατάσταση με panel ίδιας ανάλυσης & τεχνολογίας", "Δοκιμή φωτεινότητας, χρωμάτων & αδειών pixel", "Γραπτή εγγύηση εργασίας & ανταλλακτικού"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Αλλαγή Οθόνης {brand.name}</p>
                  <p className="text-xs text-muted-foreground">{brand.seriesLabel}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{brand.screenPriceFrom}+</span>
                  <Button onClick={() => openRepairModal(brand.screenPriceFrom)} className={REPAIR_CTA_GRADIENT}
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-screen">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
              <RepairPriceBreakdownCard totalInclVat={brand.screenPriceFrom} className="mt-3" />
            </section>

            {/* Battery */}
            <section id="section-battery">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Μπαταρίας {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αν το {brand.name} σας κλείνει ξαφνικά, δεν κρατάει 1-2 ώρες ή η μπαταρία φουσκώσει, η αντικατάσταση γίνεται με <strong className="text-foreground">γνήσια ή πιστοποιημένη μπαταρία</strong> υψηλής χωρητικότητας.
              </p>
              <ul className="list-none space-y-1.5 mb-4">
                {["Δωρεάν μέτρηση υγείας μπαταρίας", "Αντικατάσταση με γνήσια ή premium μπαταρία", "Βαθμονόμηση & δοκιμή κύκλων φόρτισης", "Γραπτή εγγύηση 12 μηνών"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Αλλαγή Μπαταρίας {brand.name}</p>
                  <p className="text-xs text-muted-foreground">Γνήσια ή premium ποιότητας</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{brand.batteryPriceFrom}+</span>
                  <Button onClick={() => openRepairModal(brand.batteryPriceFrom)} className={REPAIR_CTA_GRADIENT}
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-battery">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
              <RepairPriceBreakdownCard totalInclVat={brand.batteryPriceFrom} className="mt-3" />
            </section>

            {/* Keyboard */}
            <section id="section-keyboard">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Πληκτρολογίου {brand.name}</h2>
              {brand.slug === "apple-macbook" ? (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Σε MacBook, το πληκτρολόγιο αποτελεί <strong className="text-foreground">ενιαία μονάδα top-case</strong> με το trackpad και το πλαίσιο. Η αντικατάσταση γίνεται ολόκληρο το top-case assembly, γι' αυτό και το κόστος ξεκινά από <strong className="text-foreground">€{brand.keyboardPriceFrom}</strong>.
                  </p>
                  <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-xs text-amber-300 mb-3">
                    Το top-case περιλαμβάνει: πληκτρολόγιο, trackpad, καλωδιώσεις & μπαταρία (σε ορισμένα μοντέλα). Η τελική τιμή εξαρτάται από το μοντέλο MacBook.
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Σπασμένα, κολλημένα ή μη ανταποκρινόμενα πλήκτρα; Αντικαθιστούμε το πληκτρολόγιο με <strong className="text-foreground">συμβατό ανταλλακτικό</strong> που διατηρεί layout, backlight και γλωσσική ρύθμιση.
                </p>
              )}
              <ul className="list-none space-y-1.5">
                {(brand.slug === "apple-macbook"
                  ? ["Αντικατάσταση ολόκληρου top-case assembly", "Διατήρηση trackpad & Force Touch (όπου υπάρχει)", "Δοκιμή κάθε πλήκτρου μετά την τοποθέτηση", "Γραπτή εγγύηση εργασίας & ανταλλακτικού"]
                  : ["Αντικατάσταση με συμβατό πληκτρολόγιο ίδιου layout", "Διατήρηση backlight (αν υπάρχει στο αρχικό)", "Δοκιμή κάθε πλήκτρου μετά την τοποθέτηση", "Γραπτή εγγύηση εργασίας & ανταλλακτικού"]
                ).map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* RAM/SSD Upgrade */}
            <section id="section-upgrade">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αναβάθμιση RAM & SSD {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Ένας παλαιότερος {brand.name} μπορεί να αισθάνεται σαν καινούριος με αναβάθμιση RAM και SSD. Ελέγχουμε συμβατότητα, τοποθετούμε το νέο υλικό και μεταφέρουμε τα δεδομένα σας.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {[
                  { title: "Αναβάθμιση RAM", items: ["Έλεγχος συμβατότητας (DDR4/DDR5)", "Επέκταση ή αντικατάσταση modules", "Δοκιμή stability (MemTest)", "Εγγύηση εργασίας"] },
                  { title: "Αναβάθμιση SSD", items: ["SATA ή NVMe M.2 — έλεγχος θυρών", "Μεταφορά δεδομένων (cloning)", "Βελτιστοποίηση OS μετά το clone", "Εγγύηση εργασίας"] },
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
              {brand.upgradeLabor > 0 && (
                <p className="text-xs text-muted-foreground">
                  Εργασία αναβάθμισης: <strong className="text-foreground">€{brand.upgradeLabor}</strong> (εκτός κόστους ανταλλακτικού).
                  {brand.slug === "apple-macbook" && " Σημείωση: MacBook M1/M2/M3 έχουν unified memory — δεν αναβαθμίζονται."}
                </p>
              )}
              {brand.slug === "apple-macbook" && (
                <div className="mt-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-xs text-amber-300">
                  Τα MacBook με Apple Silicon (M1/M2/M3/M4) έχουν unified memory ενσωματωμένη στο chip — RAM/SSD δεν αναβαθμίζονται. Ισχύει μόνο για Intel MacBook.
                </div>
              )}
            </section>

            {/* Thermal paste */}
            <section id="section-thermal">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Thermal Paste & Καθαρισμός {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αν ο {brand.name} σας υπερθερμαίνεται, ο ανεμιστήρας δουλεύει συνέχεια ή παρουσιάζει thermal throttling, ο καθαρισμός και η αλλαγή thermal paste λύνουν το πρόβλημα στο 90% των περιπτώσεων.
              </p>
              <ul className="list-none space-y-1.5">
                {["Αποσυναρμολόγηση & καθαρισμός από σκόνη", "Αφαίρεση παλιάς θερμοαγώγιμης πάστας", `Τοποθέτηση premium thermal paste (€${brand.thermalPrice})`, "Δοκιμή θερμοκρασιών υπό φορτίο", "Έλεγχος ανεμιστήρα & thermal pads"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* Repair request */}
            <section id="section-form" className="p-6 rounded-2xl border border-white/10 bg-card">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">Αίτημα Επισκευής — {brand.name}</h2>
              <p className="text-sm text-muted-foreground mb-5">Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας εντός 30 λεπτών.</p>
              <Button onClick={() => openRepairModal(brand.screenPriceFrom)} className={`${REPAIR_CTA_WIDE} shadow-[0_0_24px_rgba(0,210,200,0.25)]`}
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

            {/* Other brands */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">Άλλες Μάρκες Laptop</p>
              <div className="flex flex-wrap gap-2">
                {otherBrands.map((b) => (
                  <Link key={b.slug} href={`/episkevi-laptop/${b.slug}`}>
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
                  { q: `Πόσο κοστίζει η αλλαγή οθόνης ${brand.name};`, a: `Η αλλαγή οθόνης ${brand.name} ξεκινά από €${brand.screenPriceFrom} και εξαρτάται από το μοντέλο (ανάλυση, μέγεθος, τεχνολογία panel). Κάνουμε δωρεάν αξιολόγηση πριν.` },
                  { q: `Πόσο κοστίζει η αλλαγή μπαταρίας ${brand.name};`, a: `Η αλλαγή μπαταρίας ${brand.name} ξεκινά από €${brand.batteryPriceFrom} ανάλογα με το μοντέλο. Συμπεριλαμβάνεται γνήσια ή premium μπαταρία και γραπτή εγγύηση.` },
                  { q: "Πόσο χρόνο κάνει η επισκευή;", a: "Αλλαγή οθόνης: 2-4 ώρες. Μπαταρία/Πληκτρολόγιο: 1-3 ώρες. Thermal paste: 1-2 ώρες. Αναβάθμιση RAM/SSD: 1-2 ώρες. Σύνθετες επισκευές: 24-48 ώρες." },
                  { q: "Δίνετε εγγύηση;", a: "Ναι, κάθε επισκευή καλύπτεται από γραπτή εγγύηση. Γνήσια ανταλλακτικά: 12 μήνες. Συμβατά/OEM: 6 μήνες. Εργασία: 3 μήνες." },
                  { q: "Χρειάζεται ραντεβού;", a: "Μπορείτε να έρθετε χωρίς ραντεβού για βασικές επισκευές, αλλά συνιστούμε να καλέσετε πρώτα για να εξασφαλίσετε διαθεσιμότητα ανταλλακτικού." },
                  ...(brand.slug === "apple-macbook" ? [
                    { q: "Επισκευάζετε MacBook M1/M2/M3;", a: "Ναι! Αλλαγή μπαταρίας, οθόνης, top-case (πληκτρολόγιο) και thermal paste για MacBook M1, M2, M3 και M4. Η αναβάθμιση RAM/SSD δεν είναι εφικτή στα Apple Silicon μοντέλα." },
                    { q: "Γιατί η αλλαγή πληκτρολογίου MacBook είναι τόσο ακριβή;", a: `Στο MacBook, το πληκτρολόγιο είναι ενσωματωμένο στο top-case assembly — ένα ενιαίο τμήμα που περιλαμβάνει trackpad, καλωδιώσεις και πολλές φορές τη μπαταρία. Η αντικατάσταση γίνεται ολόκληρη η μονάδα. Κόστος από €${brand.keyboardPriceFrom} ανάλογα το μοντέλο.` },
                  ] : []),
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
                    { label: "Οθόνη από",           price: `€${brand.screenPriceFrom}+`,   bold: true },
                    { label: "Μπαταρία από",         price: `€${brand.batteryPriceFrom}+` },
                    { label: "Πληκτρολόγιο από",     price: `€${brand.keyboardPriceFrom}+` },
                    { label: "Θύρα Φόρτισης από",    price: `€${brand.portPriceFrom}+` },
                    { label: "Thermal Paste",        price: `€${brand.thermalPrice}` },
                    ...(brand.upgradeLabor > 0 ? [{ label: "RAM/SSD (εργασία)", price: `€${brand.upgradeLabor}+` }] : []),
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-bold ${row.bold ? "text-primary" : "text-foreground"}`}>{row.price}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => openRepairModal(brand.screenPriceFrom)} className={`${REPAIR_CTA_FULL} mb-2 shadow-[0_0_20px_rgba(0,210,200,0.25)]`}
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
                <SidebarProducts subcategory="laptop" label="Μεταχειρισμένα Laptop" />
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky CTA — πάνω από το bottom app nav */}
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[130] flex gap-2 border-t border-primary/20 bg-background/95 p-3 backdrop-blur lg:hidden">
          <Button onClick={() => openRepairModal(brand.screenPriceFrom)} className={REPAIR_CTA_FLEX}
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
        defaultDeviceName={`${brand.name} laptop`}
        defaultTotalInclVat={modalDefaultTotal}
        temperedGlassOffer={false}
      />
    </div>
  );
}
