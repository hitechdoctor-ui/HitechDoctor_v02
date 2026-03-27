import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { findTabletBrandBySlug, TABLET_BRANDS } from "@/data/tablet-brands";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  CheckCircle2, MonitorSmartphone, Battery, Zap, Layers, Shield,
  ChevronRight, Phone, Star, Clock, Wrench, ShoppingCart, ArrowRight,
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
        <Button size="sm" variant="outline" className="w-full h-8 text-xs border-primary/30 text-primary hover:bg-primary/10" data-testid="button-sidebar-eshop">
          <ShoppingCart className="w-3 h-3 mr-1.5" />Δείτε Όλα στο eShop
        </Button>
      </Link>
    </div>
  );
}

interface PriceRowProps {
  icon: typeof MonitorSmartphone;
  label: string;
  price: number;
  note?: string;
  highlight?: boolean;
  onBook?: () => void;
}

function PriceRow({ icon: Icon, label, price, note, highlight, onBook }: PriceRowProps) {
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
            €{price}<span className="text-base font-semibold text-muted-foreground">+</span>
          </p>
          <p className="text-[10px] text-muted-foreground">συμπ. ΦΠΑ</p>
        </div>
        {onBook && (
          <Button onClick={onBook} size="sm" className="h-9 px-4 font-semibold border-0 text-xs shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            data-testid={`button-book-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            Ραντεβού
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TabletRepairDetail() {
  const [, params] = useRoute("/episkevi-tablet/:slug");
  const brandSlug = params?.slug ?? "";
  const brand = findTabletBrandBySlug(brandSlug);
  const [modalOpen, setModalOpen] = useState(false);

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Μάρκα δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Η μάρκα δεν υπάρχει στη βάση μας.</p>
          <Link href="/services/episkeui-tablet">
            <Button style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}>
              ← Επιστροφή στις μάρκες Tablet
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `Επισκευή ${brand.name} — Τιμές Αλλαγής Οθόνης & Μπαταρίας | HiTech Doctor Αθήνα`;
  const pageDesc = `Επισκευή ${brand.name} στην Αθήνα (${brand.seriesLabel}). Αλλαγή οθόνης από €${brand.screenPriceFrom}, μπαταρία από €${brand.batteryPriceFrom}, θύρα φόρτισης από €${brand.portPriceFrom}. Γνήσια ανταλλακτικά, εγγύηση.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-tablet/${brand.slug}`;

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
      { "@type": "Offer", "name": `Επισκευή Θύρας Φόρτισης ${brand.name}`, "price": brand.portPriceFrom, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Αντικατάσταση Back Glass ${brand.name}`, "price": brand.backGlassPriceFrom, "priceCurrency": "EUR" },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
      { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Επισκευή Tablet", "item": "https://hitechdoctor.com/services/episkeui-tablet" },
      { "@type": "ListItem", "position": 4, "name": brand.name, "item": canonicalUrl },
    ],
  };

  const otherBrands = TABLET_BRANDS.filter((b) => b.slug !== brand.slug);

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

      <main className="container mx-auto px-4 pt-6 pb-28 max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-tablet" className="hover:text-primary transition-colors">Επισκευή Tablet</Link>
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
              { href: "#section-port",     label: "Θύρα Φόρτισης" },
              { href: "#section-back",     label: "Back Glass" },
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
                <PriceRow icon={MonitorSmartphone} label="Αλλαγή Οθόνης"        price={brand.screenPriceFrom}   note={`Touch + Display · ${brand.seriesLabel}`} highlight onBook={() => setModalOpen(true)} />
                <PriceRow icon={Battery}           label="Αλλαγή Μπαταρίας"     price={brand.batteryPriceFrom}  note="Γνήσια ή premium ποιότητας" onBook={() => setModalOpen(true)} />
                <PriceRow icon={Zap}               label="Θύρα Φόρτισης"        price={brand.portPriceFrom}     note={brand.slug === "apple-ipad" ? "Lightning ή USB-C" : "USB-C — επισκευή/αντικατάσταση"} onBook={() => setModalOpen(true)} />
                <PriceRow icon={Layers}            label="Back Glass / Καπάκι"  price={brand.backGlassPriceFrom} note="Αντικατάσταση πλάτης & πλαισίου" onBook={() => setModalOpen(true)} />
              </div>
              <PriceDisclaimer className="mt-3" />
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[{ icon: Shield, label: "Εγγύηση", sub: "Γραπτή εγγύηση" }, { icon: Clock, label: "1-2 Ώρες", sub: "Αλλαγή οθόνης" }, { icon: Star, label: "Τεχνικοί", sub: "Εξειδικευμένοι" }].map((b) => (
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
                Ρωγμή, σπασμένο τζάμι ή νεκρά pixels; Αντικαθιστούμε την οθόνη (touch + display ή μόνο glass όπου εφικτό) με <strong className="text-foreground">γνήσιο ή premium ανταλλακτικό</strong> της ίδιας ανάλυσης και τεχνολογίας.
              </p>
              <ul className="list-none space-y-1.5 mb-4">
                {[
                  "Δωρεάν διάγνωση & εντοπισμός βλάβης",
                  "Αντικατάσταση touch + display ή μόνο glass",
                  "Δοκιμή αφής, φωτεινότητας & χρωμάτων μετά",
                  "Γραπτή εγγύηση εργασίας & ανταλλακτικού",
                  ...(brand.slug === "apple-ipad" ? ["Συμβατό για iPad mini, iPad Air, iPad, iPad Pro"] : []),
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Αλλαγή Οθόνης {brand.name}</p>
                  <p className="text-xs text-muted-foreground">{brand.seriesLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{brand.screenPriceFrom}+</span>
                  <Button onClick={() => setModalOpen(true)} className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-screen">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
            </section>

            {/* Battery */}
            <section id="section-battery">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Μπαταρίας {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αν το {brand.name} σας δεν κρατάει φόρτιση, κλείνει ξαφνικά ή η μπαταρία έχει φουσκώσει, η αντικατάσταση γίνεται με <strong className="text-foreground">γνήσια ή πιστοποιημένη μπαταρία</strong> για πλήρη αυτονομία.
              </p>
              <ul className="list-none space-y-1.5 mb-4">
                {["Δωρεάν μέτρηση health μπαταρίας", "Αντικατάσταση με γνήσια ή premium μπαταρία", "Βαθμονόμηση & δοκιμή κύκλων φόρτισης", "Γραπτή εγγύηση 12 μηνών"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Αλλαγή Μπαταρίας {brand.name}</p>
                  <p className="text-xs text-muted-foreground">Γνήσια ή premium ποιότητας</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{brand.batteryPriceFrom}+</span>
                  <Button onClick={() => setModalOpen(true)} className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-battery">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
            </section>

            {/* Charging port */}
            <section id="section-port">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Επισκευή Θύρας Φόρτισης {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αν το {brand.name} δεν φορτίζει ή ο σύνδεσμος είναι χαλαρός, επισκευάζουμε ή αντικαθιστούμε τη θύρα{brand.slug === "apple-ipad" ? " Lightning ή USB-C" : " USB-C"} με νέο ανταλλακτικό.
              </p>
              <ul className="list-none space-y-1.5">
                {[
                  "Διάγνωση — hardware vs software πρόβλημα",
                  `Αντικατάσταση${brand.slug === "apple-ipad" ? " Lightning / USB-C" : " USB-C"} connector`,
                  "Δοκιμή φόρτισης μετά την επισκευή",
                  "Γραπτή εγγύηση εργασίας & ανταλλακτικού",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </section>

            {/* Back glass */}
            <section id="section-back">
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Back Glass & Καπάκι {brand.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Σπασμένη πλάτη ή φθαρμένο πλαίσιο; Αντικαθιστούμε το back glass / καπάκι του {brand.name} σας με ανταλλακτικό ίδιου χρώματος και ποιότητας. Αισθητική και λειτουργική αποκατάσταση.
              </p>
              <ul className="list-none space-y-1.5">
                {["Αντικατάσταση back glass / καπακιού", "Διαθέσιμο σε χρώματα του αρχικού", "Δοκιμή waterproofing (όπου υπάρχει)", "Γραπτή εγγύηση εργασίας"].map((i) => (
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
              <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto h-11 px-8 font-semibold border-0 text-base"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.25)" }}
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
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">Άλλες Μάρκες Tablet</p>
              <div className="flex flex-wrap gap-2">
                {otherBrands.map((b) => (
                  <Link key={b.slug} href={`/episkevi-tablet/${b.slug}`}>
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
                  { q: `Πόσο κοστίζει η αλλαγή οθόνης ${brand.name};`, a: `Η αλλαγή οθόνης ${brand.name} ξεκινά από €${brand.screenPriceFrom} και εξαρτάται από το μοντέλο (mini, Air, Pro, μέγεθος). Κάνουμε δωρεάν αξιολόγηση πριν την επισκευή.` },
                  { q: `Πόσο κοστίζει η αλλαγή μπαταρίας ${brand.name};`, a: `Η αλλαγή μπαταρίας ${brand.name} ξεκινά από €${brand.batteryPriceFrom}. Συμπεριλαμβάνεται γνήσια ή premium μπαταρία, βαθμονόμηση και γραπτή εγγύηση.` },
                  { q: "Πόσο χρόνο κάνει η επισκευή;", a: "Αλλαγή οθόνης: 1-2 ώρες. Μπαταρία: 1-2 ώρες. Θύρα φόρτισης: 1 ώρα. Back glass: 1-2 ώρες. Επισκευή πλακέτας: 24-48 ώρες." },
                  { q: "Δίνετε εγγύηση;", a: "Ναι, κάθε επισκευή καλύπτεται από γραπτή εγγύηση. Γνήσια ανταλλακτικά: 12 μήνες. Συμβατά/OEM: 6 μήνες. Εργασία: 3 μήνες." },
                  { q: "Χρειάζεται ραντεβού;", a: "Μπορείτε να έρθετε χωρίς ραντεβού, αλλά συνιστούμε να καλέσετε πρώτα για να εξασφαλίσετε διαθεσιμότητα ανταλλακτικού." },
                  ...(brand.slug === "apple-ipad" ? [{ q: "Επισκευάζετε iPad Pro με Face ID;", a: "Ναι! Επισκευάζουμε οθόνη, μπαταρία και θύρα USB-C σε iPad Pro (Face ID). Η αντικατάσταση ολόκληρης της οθόνης διατηρεί το Face ID (δεν το επηρεάζει)." }] : []),
                  ...(brand.slug === "samsung-galaxy-tab" ? [{ q: "Επισκευάζετε Samsung Galaxy Tab S;", a: "Ναι! Επισκευάζουμε όλη τη σειρά Tab S (S6, S7, S8, S9, S10). Αλλαγή AMOLED οθόνης, μπαταρίας, S Pen connector." }] : []),
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
                    { label: "Θύρα Φόρτισης από",   price: `€${brand.portPriceFrom}+` },
                    { label: "Back Glass από",       price: `€${brand.backGlassPriceFrom}+` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-bold ${row.bold ? "text-primary" : "text-foreground"}`}>{row.price}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setModalOpen(true)} className="w-full h-11 font-semibold border-0 mb-2"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 20px rgba(0,210,200,0.25)" }}
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
                <SidebarProducts subcategory="tablet" label="Αξεσουάρ Tablet" />
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-primary/20 bg-background/95 backdrop-blur p-3 flex gap-2">
          <Button onClick={() => setModalOpen(true)} className="flex-1 h-11 font-semibold border-0 text-sm"
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            data-testid="button-mobile-book">
            <Wrench className="w-4 h-4 mr-2" />Αίτημα Επισκευής
          </Button>
          <a href="tel:+306981882005" className="shrink-0">
            <Button variant="outline" className="h-11 px-4 border-primary/30 text-primary" data-testid="button-mobile-call">
              <Phone className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </main>

      <Footer />
      <RepairRequestModal open={modalOpen} onOpenChange={setModalOpen} defaultDeviceName={`${brand.name}`} />
    </div>
  );
}
