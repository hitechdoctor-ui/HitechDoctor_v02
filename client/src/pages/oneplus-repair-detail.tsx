import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { findOnePlusBySlug, findOnePlusSeriesForModel, ONEPLUS_SERIES } from "@/data/oneplus-devices";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  CheckCircle2, Monitor, Battery, Zap, ChevronRight, Phone,
  Shield, Star, Clock, Wrench, ShoppingCart, ArrowRight,
} from "lucide-react";

const repairScreenImg = "/images/repair-screen.webp";
const repairBatteryImg = "/images/repair-battery.webp";
const repairPortImg = "/images/repair-port.webp";

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
  icon: typeof Monitor;
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
          <p className={`text-2xl font-extrabold ${highlight ? "text-primary" : "text-foreground"}`}>€{price}</p>
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

interface ScreenTierCardProps {
  label: string;
  sublabel: string;
  price: number;
  features: string[];
  selected: boolean;
  onClick: () => void;
  recommended?: boolean;
  testId?: string;
}

function ScreenTierCard({ label, sublabel, price, features, selected, onClick, recommended, testId }: ScreenTierCardProps) {
  return (
    <button type="button" onClick={onClick} data-testid={testId}
      className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all cursor-pointer ${
        selected ? "border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,210,200,0.15)]" : "border-white/10 bg-card hover:border-white/25"
      }`}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-black uppercase tracking-wider">Συνιστάται</span>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className={`text-sm font-display font-bold ${selected ? "text-primary" : "text-foreground"}`}>{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
        </div>
        <p className={`text-xl font-extrabold shrink-0 ${selected ? "text-primary" : "text-foreground"}`}>€{price}</p>
      </div>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CheckCircle2 className={`w-3 h-3 shrink-0 ${selected ? "text-primary" : "text-muted-foreground/50"}`} />{f}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default function OnePlusRepairDetail() {
  const [, params] = useRoute("/episkevi-oneplus/:slug");
  const modelSlug = params?.slug ?? "";
  const model = findOnePlusBySlug(modelSlug);
  const series = findOnePlusSeriesForModel(modelSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScreenTier, setSelectedScreenTier] = useState<"genuine" | "oem">("genuine");

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Μοντέλο δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Το μοντέλο δεν υπάρχει στη βάση μας.</p>
          <Link href="/services/episkeui-oneplus">
            <Button style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}>
              ← Επιστροφή στα μοντέλα OnePlus
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const hasOEM = model.screenPriceOEM !== undefined;
  const activeScreenPrice = (selectedScreenTier === "oem" && hasOEM) ? model.screenPriceOEM! : model.screenPrice;

  const pageTitle = `Επισκευή ${model.name} — Τιμές Αλλαγής Οθόνης & Μπαταρίας | HiTech Doctor Αθήνα`;
  const pageDesc = hasOEM
    ? `Επισκευή ${model.name} στην Αθήνα. Αλλαγή οθόνης από €${model.screenPriceOEM} (OEM) ή €${model.screenPrice} (Γνήσια), μπαταρία €${model.batteryPrice}. Εγγύηση, αποτέλεσμα 30 λεπτά.`
    : `Επισκευή ${model.name} στην Αθήνα. Αλλαγή οθόνης €${model.screenPrice}, μπαταρία €${model.batteryPrice}. Γνήσια ανταλλακτικά, εγγύηση, αποτέλεσμα 30 λεπτά.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-oneplus/${model.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Επισκευή ${model.name}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "HiTech Doctor",
      "url": "https://hitechdoctor.com",
      "telephone": "+306981882005",
      "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
    },
    "description": pageDesc,
    "serviceType": `Επισκευή ${model.name}`,
    "areaServed": "Αθήνα",
    "offers": [
      { "@type": "Offer", "name": `Αλλαγή Οθόνης ${model.name}${hasOEM ? " (Γνήσια)" : ""}`, "price": model.screenPrice, "priceCurrency": "EUR" },
      ...(hasOEM ? [{ "@type": "Offer", "name": `Αλλαγή Οθόνης ${model.name} (OEM)`, "price": model.screenPriceOEM, "priceCurrency": "EUR" }] : []),
      { "@type": "Offer", "name": `Αλλαγή Μπαταρίας ${model.name}`, "price": model.batteryPrice, "priceCurrency": "EUR" },
      { "@type": "Offer", "name": `Επισκευή Θύρας USB-C ${model.name}`, "price": model.portPrice, "priceCurrency": "EUR" },
    ],
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
      { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Επισκευή OnePlus", "item": "https://hitechdoctor.com/services/episkeui-oneplus" },
      { "@type": "ListItem", "position": 4, "name": model.name, "item": canonicalUrl },
    ],
  };

  const otherModels = ONEPLUS_SERIES.flatMap((s) => s.models).filter((m) => m.slug !== model.slug).slice(0, 10);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo title={pageTitle} description={pageDesc} url={canonicalUrl} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={`επισκευή ${model.name}, αλλαγή οθόνης ${model.name}, αλλαγή μπαταρίας ${model.name}, ${model.name} service Αθήνα`} />
      </Helmet>

      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)" }} />

      <Navbar />

      <main className="container mx-auto px-4 pt-6 pb-28 max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-oneplus" className="hover:text-primary transition-colors">Επισκευή OnePlus</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium">{model.name}</span>
        </nav>

        {/* Hero */}
        <div className="flex flex-wrap items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {model.tag && <Badge className="bg-primary text-black text-[10px] font-bold">{model.tag}</Badge>}
              {series && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${series.badgeClass}`}>{series.label}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground leading-tight">Επισκευή {model.name}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">{model.screen} · Αθήνα, Ελλάδα</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[{ icon: Shield, text: "Γραπτή Εγγύηση" }, { icon: Clock, text: "Από 30 λεπτά" }, { icon: Wrench, text: "Δωρεάν Διάγνωση" }].map((b) => (
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
              { href: "#section-prices",  label: "Τιμές" },
              { href: "#section-screen",  label: "Οθόνη" },
              { href: "#section-battery", label: "Μπαταρία" },
              { href: "#section-port",    label: "Θύρα USB-C" },
              { href: "#section-form",    label: "Αίτημα" },
              { href: "#section-faq",     label: "FAQ" },
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
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Τιμοκατάλογος Επισκευής</h2>
              <div className="space-y-3">
                <PriceRow
                  icon={Monitor}
                  label={hasOEM ? "Αλλαγή Οθόνης — Γνήσια" : "Αλλαγή Οθόνης"}
                  price={model.screenPrice}
                  note={`Γνήσιο panel · ${model.screen}`}
                  highlight
                  onBook={() => setModalOpen(true)}
                />
                {hasOEM && (
                  <PriceRow
                    icon={Monitor}
                    label="Αλλαγή Οθόνης — OEM"
                    price={model.screenPriceOEM!}
                    note="OEM υψηλής ποιότητας · οικονομική επιλογή"
                    onBook={() => setModalOpen(true)}
                  />
                )}
                <PriceRow icon={Battery} label="Αλλαγή Μπαταρίας" price={model.batteryPrice} note="Γνήσια ή premium ποιότητας" onBook={() => setModalOpen(true)} />
                <PriceRow icon={Zap}     label="Επισκευή Θύρας USB-C" price={model.portPrice} note="Αντικατάσταση ή καθαρισμός θύρας φόρτισης" onBook={() => setModalOpen(true)} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[{ icon: Shield, label: "Εγγύηση", sub: "Γραπτή εγγύηση" }, { icon: Clock, label: "30 λεπτά", sub: "Γρήγορη" }, { icon: Star, label: "Τεχνικοί", sub: "Εξειδικευμένοι" }].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl border border-white/8 bg-white/2">
                    <b.icon className="w-5 h-5 text-primary mb-1.5" />
                    <p className="text-xs font-bold text-foreground">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Screen section */}
            <section id="section-screen">
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-5 border border-white/8">
                <img src={repairScreenImg} alt={`Αλλαγή οθόνης ${model.name}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-display font-bold text-xl">Αλλαγή Οθόνης</p>
                  <p className="text-white/70 text-sm">{model.name}</p>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Οθόνης {model.name} στην Αθήνα</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {hasOEM
                  ? <>Επιλέξτε ποιότητα ανταλλακτικού για την <strong className="text-foreground">Αλλαγή Οθόνης {model.name}</strong>:</>
                  : <>Αλλαγή <strong className="text-foreground">Γνήσιας Οθόνης {model.name}</strong> ({model.screen}):</>
                }
              </p>

              {hasOEM ? (
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <ScreenTierCard
                    label="Γνήσια Οθόνη"
                    sublabel="Original panel υψηλής ποιότητας"
                    price={model.screenPrice}
                    recommended
                    selected={selectedScreenTier === "genuine"}
                    onClick={() => setSelectedScreenTier("genuine")}
                    testId="tier-screen-genuine"
                    features={["Γνήσιο panel", "Πλήρης εγγύηση 12 μηνών", "Ίδια ποιότητα με το εργοστάσιο", "Πλήρης λειτουργικότητα touch"]}
                  />
                  <ScreenTierCard
                    label="OEM Οθόνη"
                    sublabel="Συμβατό panel υψηλής ποιότητας"
                    price={model.screenPriceOEM!}
                    selected={selectedScreenTier === "oem"}
                    onClick={() => setSelectedScreenTier("oem")}
                    testId="tier-screen-oem"
                    features={["OEM panel Α+ ποιότητας", "Εγγύηση 6 μηνών", "Πολύ καλή ποιότητα εικόνας", "Πλήρης λειτουργικότητα touch"]}
                  />
                </div>
              ) : (
                <div className="mb-5">
                  <ScreenTierCard
                    label="Γνήσια Οθόνη"
                    sublabel={`Original panel — ${model.screen}`}
                    price={model.screenPrice}
                    recommended
                    selected
                    onClick={() => {}}
                    testId="tier-screen-genuine"
                    features={["Γνήσιο panel υψηλής ποιότητας", "Πλήρης εγγύηση 12 μηνών", "Ίδια ποιότητα εικόνας & αφής", "Πλήρης λειτουργικότητα touch"]}
                  />
                </div>
              )}

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {hasOEM && selectedScreenTier === "oem" ? "OEM Οθόνη" : "Γνήσια Οθόνη"} — {model.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{model.screen}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{activeScreenPrice}</span>
                  <Button onClick={() => setModalOpen(true)} className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-screen">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>

              <ul className="list-none space-y-1.5 mt-4">
                {["Δωρεάν τεχνικός έλεγχος & διάγνωση πριν την επισκευή", "Αφαίρεση κατεστραμμένης οθόνης με εξειδικευμένα εργαλεία", "Τοποθέτηση νέου panel με βαθμονόμηση αφής", "Δοκιμή χρωμάτων, touch, φωτεινότητας & αισθητήρων", "Γραπτή εγγύηση για κάθε επισκευή"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Battery section */}
            <section id="section-battery">
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-5 border border-white/8">
                <img src={repairBatteryImg} alt={`Αλλαγή μπαταρίας ${model.name}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-display font-bold text-xl">Αλλαγή Μπαταρίας</p>
                  <p className="text-white/70 text-sm">{model.name}</p>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Αλλαγή Μπαταρίας {model.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Αν το {model.name} σας δεν κρατάει μισή μέρα, κλείνει ξαφνικά ή η μπαταρία φουσκώσει, η αντικατάσταση γίνεται σε 30–60 λεπτά.
              </p>
              <ul className="list-none space-y-1.5 mb-4">
                {["Δωρεάν μέτρηση υγείας μπαταρίας", "Αντικατάσταση με premium κύτταρο μπαταρίας", "Βαθμονόμηση & δοκιμή κύκλων φόρτισης", "Γραπτή εγγύηση 12 μηνών"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Αλλαγή Μπαταρίας {model.name}</p>
                  <p className="text-xs text-muted-foreground">Γνήσια ή premium ποιότητας</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{model.batteryPrice}</span>
                  <Button onClick={() => setModalOpen(true)} className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-battery">
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
            </section>

            {/* Port section */}
            <section id="section-port">
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-5 border border-white/8">
                <img src={repairPortImg} alt={`Θύρα USB-C ${model.name}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-display font-bold text-xl">Θύρα USB-C</p>
                  <p className="text-white/70 text-sm">{model.name}</p>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Επισκευή Θύρας USB-C {model.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Πριν αντικαταστήσουμε τη θύρα USB-C του {model.name}, κάνουμε δωρεάν καθαρισμό και διάγνωση — συχνά αρκεί μόνο αυτό.
              </p>
              <ul className="list-none space-y-1.5">
                {["Δωρεάν καθαρισμός & διάγνωση θύρας", "Αντικατάσταση module USB-C αν απαιτείται", "Δοκιμή φόρτισης & μεταφοράς δεδομένων", "Γραπτή εγγύηση εργασίας & ανταλλακτικού"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Repair request form */}
            <section id="section-form" className="p-6 rounded-2xl border border-white/10 bg-card">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">Αίτημα Επισκευής — {model.name}</h2>
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

            {/* Other models */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">Άλλα Μοντέλα OnePlus</p>
              <div className="flex flex-wrap gap-2">
                {otherModels.map((m) => (
                  <Link key={m.slug} href={`/episkevi-oneplus/${m.slug}`}>
                    <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-card hover:border-primary/40 hover:text-primary text-muted-foreground transition-all cursor-pointer">{m.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <section id="section-faq">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Συχνές Ερωτήσεις</h2>
              <div className="space-y-3">
                {[
                  ...(hasOEM ? [{
                    q: `Ποια η διαφορά Γνήσιας και OEM οθόνης για ${model.name};`,
                    a: `Η γνήσια οθόνη (€${model.screenPrice}) είναι original panel με πλήρη εγγύηση 12 μηνών. Η OEM (€${model.screenPriceOEM}) είναι συμβατό panel Α+ ποιότητας με εγγύηση 6 μηνών — ιδανική οικονομική επιλογή.`,
                  }] : []),
                  {
                    q: `Πόσο κοστίζει η αλλαγή οθόνης ${model.name};`,
                    a: hasOEM
                      ? `€${model.screenPriceOEM} (OEM) ή €${model.screenPrice} (Γνήσια) με ΦΠΑ. Η τιμή περιλαμβάνει ανταλλακτικό και εργασία.`
                      : `€${model.screenPrice} με ΦΠΑ. Η τιμή περιλαμβάνει ανταλλακτικό και εργασία.`,
                  },
                  { q: "Πόσο διαρκεί η επισκευή;", a: "Οι περισσότερες επισκευές (οθόνη, μπαταρία, θύρα) ολοκληρώνονται σε 30–60 λεπτά ενώ περιμένετε." },
                  { q: "Δίνετε εγγύηση;", a: "Ναι, κάθε επισκευή καλύπτεται από γραπτή εγγύηση — 12 μήνες για γνήσια, 6 μήνες για OEM ανταλλακτικά." },
                  { q: "Χρειάζεται ραντεβού;", a: "Μπορείτε να έρθετε χωρίς ραντεβού, αλλά συνιστούμε να καλέσετε για να βεβαιωθείτε ότι το ανταλλακτικό είναι διαθέσιμο." },
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{hasOEM ? "Οθόνη Γνήσια" : "Οθόνη"}</span>
                    <span className="font-bold text-primary">€{model.screenPrice}</span>
                  </div>
                  {hasOEM && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Οθόνη OEM</span>
                      <span className="font-bold text-foreground">€{model.screenPriceOEM}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Μπαταρία</span>
                    <span className="font-bold text-foreground">€{model.batteryPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Θύρα USB-C</span>
                    <span className="font-bold text-foreground">€{model.portPrice}</span>
                  </div>
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
                <SidebarProducts subcategory="cases" label="Θήκες & Αξεσουάρ" />
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
      <RepairRequestModal open={modalOpen} onOpenChange={setModalOpen} defaultDeviceName={model.name} />
    </div>
  );
}
