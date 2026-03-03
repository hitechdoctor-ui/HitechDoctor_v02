import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Shield, Clock, Wrench, ChevronRight, Phone,
  Zap, Wifi, Camera, Battery, Monitor, ArrowRight,
} from "lucide-react";
import { SiApple } from "react-icons/si";
import { Link } from "wouter";
import { useState } from "react";

// ── iPhone model data ────────────────────────────────────────────────────────
const IPHONE_SERIES = [
  {
    id: "17",
    label: "iPhone 17",
    color: "#94a3b8",
    accentClass: "border-slate-500/30 bg-slate-500/8",
    badgeClass: "bg-slate-500/15 border-slate-500/30 text-slate-300",
    models: [
      { name: "iPhone 17 Pro Max", screen: "6.9″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€280", batteryPrice: "€99", tag: "NEW" },
      { name: "iPhone 17 Pro", screen: "6.3″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€260", batteryPrice: "€89", tag: "NEW" },
      { name: "iPhone 17 Plus", screen: "6.9″ OLED 60Hz", port: "USB-C", screenPrice: "€180", batteryPrice: "€89", tag: "NEW" },
      { name: "iPhone 17", screen: "6.1″ OLED 60Hz", port: "USB-C", screenPrice: "€160", batteryPrice: "€79", tag: "NEW" },
    ],
  },
  {
    id: "16",
    label: "iPhone 16",
    color: "#60a5fa",
    accentClass: "border-blue-500/30 bg-blue-500/8",
    badgeClass: "bg-blue-500/15 border-blue-500/30 text-blue-300",
    models: [
      { name: "iPhone 16 Pro Max", screen: "6.9″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€250", batteryPrice: "€89", tag: "" },
      { name: "iPhone 16 Pro", screen: "6.3″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€230", batteryPrice: "€79", tag: "" },
      { name: "iPhone 16 Plus", screen: "6.7″ OLED 60Hz", port: "USB-C", screenPrice: "€165", batteryPrice: "€79", tag: "" },
      { name: "iPhone 16", screen: "6.1″ OLED 60Hz", port: "USB-C", screenPrice: "€145", batteryPrice: "€69", tag: "" },
    ],
  },
  {
    id: "15",
    label: "iPhone 15",
    color: "#34d399",
    accentClass: "border-emerald-500/30 bg-emerald-500/8",
    badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    models: [
      { name: "iPhone 15 Pro Max", screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€220", batteryPrice: "€79", tag: "" },
      { name: "iPhone 15 Pro", screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "USB-C", screenPrice: "€200", batteryPrice: "€69", tag: "" },
      { name: "iPhone 15 Plus", screen: "6.7″ OLED 60Hz", port: "USB-C", screenPrice: "€140", batteryPrice: "€69", tag: "" },
      { name: "iPhone 15", screen: "6.1″ OLED 60Hz", port: "USB-C", screenPrice: "€120", batteryPrice: "€59", tag: "" },
    ],
  },
  {
    id: "14",
    label: "iPhone 14",
    color: "#f472b6",
    accentClass: "border-pink-500/30 bg-pink-500/8",
    badgeClass: "bg-pink-500/15 border-pink-500/30 text-pink-300",
    models: [
      { name: "iPhone 14 Pro Max", screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenPrice: "€190", batteryPrice: "€69", tag: "" },
      { name: "iPhone 14 Pro", screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenPrice: "€175", batteryPrice: "€59", tag: "" },
      { name: "iPhone 14 Plus", screen: "6.7″ OLED 60Hz", port: "Lightning", screenPrice: "€120", batteryPrice: "€59", tag: "" },
      { name: "iPhone 14", screen: "6.1″ OLED 60Hz", port: "Lightning", screenPrice: "€100", batteryPrice: "€49", tag: "" },
    ],
  },
  {
    id: "13",
    label: "iPhone 13",
    color: "#a78bfa",
    accentClass: "border-violet-500/30 bg-violet-500/8",
    badgeClass: "bg-violet-500/15 border-violet-500/30 text-violet-300",
    models: [
      { name: "iPhone 13 Pro Max", screen: "6.7″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenPrice: "€150", batteryPrice: "€59", tag: "" },
      { name: "iPhone 13 Pro", screen: "6.1″ LTPO OLED ProMotion 120Hz", port: "Lightning", screenPrice: "€135", batteryPrice: "€49", tag: "" },
      { name: "iPhone 13", screen: "6.1″ OLED 60Hz", port: "Lightning", screenPrice: "€90", batteryPrice: "€39", tag: "" },
      { name: "iPhone 13 Mini", screen: "5.4″ OLED 60Hz", port: "Lightning", screenPrice: "€85", batteryPrice: "€39", tag: "" },
    ],
  },
  {
    id: "12",
    label: "iPhone 12",
    color: "#fb923c",
    accentClass: "border-orange-500/30 bg-orange-500/8",
    badgeClass: "bg-orange-500/15 border-orange-500/30 text-orange-300",
    models: [
      { name: "iPhone 12 Pro Max", screen: "6.7″ OLED 60Hz", port: "Lightning", screenPrice: "€120", batteryPrice: "€55", tag: "" },
      { name: "iPhone 12 Pro", screen: "6.1″ OLED 60Hz", port: "Lightning", screenPrice: "€110", batteryPrice: "€49", tag: "" },
      { name: "iPhone 12", screen: "6.1″ OLED 60Hz", port: "Lightning", screenPrice: "€80", batteryPrice: "€39", tag: "" },
      { name: "iPhone 12 Mini", screen: "5.4″ OLED 60Hz", port: "Lightning", screenPrice: "€75", batteryPrice: "€39", tag: "" },
    ],
  },
  {
    id: "11",
    label: "iPhone 11",
    color: "#facc15",
    accentClass: "border-yellow-500/30 bg-yellow-500/8",
    badgeClass: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
    models: [
      { name: "iPhone 11 Pro Max", screen: "6.5″ OLED 60Hz", port: "Lightning", screenPrice: "€90", batteryPrice: "€45", tag: "" },
      { name: "iPhone 11 Pro", screen: "5.8″ OLED 60Hz", port: "Lightning", screenPrice: "€80", batteryPrice: "€40", tag: "" },
      { name: "iPhone 11", screen: "6.1″ LCD 60Hz", port: "Lightning", screenPrice: "€55", batteryPrice: "€35", tag: "" },
    ],
  },
  {
    id: "x",
    label: "iPhone X / XS / XR",
    color: "#22d3ee",
    accentClass: "border-cyan-500/30 bg-cyan-500/8",
    badgeClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    models: [
      { name: "iPhone XS Max", screen: "6.5″ OLED 60Hz", port: "Lightning", screenPrice: "€80", batteryPrice: "€45", tag: "" },
      { name: "iPhone XS", screen: "5.8″ OLED 60Hz", port: "Lightning", screenPrice: "€75", batteryPrice: "€40", tag: "" },
      { name: "iPhone XR", screen: "6.1″ LCD 60Hz", port: "Lightning", screenPrice: "€55", batteryPrice: "€35", tag: "" },
      { name: "iPhone X", screen: "5.8″ OLED 60Hz", port: "Lightning", screenPrice: "€70", batteryPrice: "€40", tag: "" },
    ],
  },
  {
    id: "se",
    label: "iPhone SE",
    color: "#4ade80",
    accentClass: "border-green-500/30 bg-green-500/8",
    badgeClass: "bg-green-500/15 border-green-500/30 text-green-300",
    models: [
      { name: "iPhone SE (3η Γενιά)", screen: "4.7″ LCD 60Hz", port: "Lightning", screenPrice: "€50", batteryPrice: "€35", tag: "" },
      { name: "iPhone SE (2η Γενιά)", screen: "4.7″ LCD 60Hz", port: "Lightning", screenPrice: "€45", batteryPrice: "€30", tag: "" },
      { name: "iPhone SE (1η Γενιά)", screen: "4.0″ LCD 60Hz", port: "Lightning", screenPrice: "€35", batteryPrice: "€25", tag: "" },
    ],
  },
  {
    id: "8",
    label: "iPhone 8 / 7",
    color: "#e2e8f0",
    accentClass: "border-gray-500/30 bg-gray-500/8",
    badgeClass: "bg-gray-500/15 border-gray-500/30 text-gray-400",
    models: [
      { name: "iPhone 8 Plus", screen: "5.5″ LCD 60Hz", port: "Lightning", screenPrice: "€50", batteryPrice: "€35", tag: "" },
      { name: "iPhone 8", screen: "4.7″ LCD 60Hz", port: "Lightning", screenPrice: "€45", batteryPrice: "€30", tag: "" },
      { name: "iPhone 7 Plus", screen: "5.5″ LCD 60Hz", port: "Lightning", screenPrice: "€40", batteryPrice: "€30", tag: "" },
      { name: "iPhone 7", screen: "4.7″ LCD 60Hz", port: "Lightning", screenPrice: "€35", batteryPrice: "€25", tag: "" },
    ],
  },
];

const COMMON_REPAIRS = [
  { icon: Monitor, label: "Αλλαγή Οθόνης", desc: "OLED/LCD γνήσια ή premium ποιότητας" },
  { icon: Battery, label: "Αλλαγή Μπαταρίας", desc: "Ανακτήστε 100% αυτονομία" },
  { icon: Camera, label: "Επισκευή Κάμερας", desc: "Μπροστά / πίσω / LiDAR" },
  { icon: Zap, label: "Επισκευή Θύρας", desc: "Lightning / USB-C φόρτισης" },
  { icon: Wifi, label: "Επισκευή μετά Βρεγμένου", desc: "Καθαρισμός πλακέτας, αποκατάσταση" },
  { icon: Wrench, label: "Επισκευή Πλακέτας", desc: "Μικροεπισκευές, BGA, reballing" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή iPhone — Όλα τα Μοντέλα",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
    "address": { "@type": "PostalAddress", "addressLocality": "Θεσσαλονίκη", "addressCountry": "GR" },
    "telephone": "+30-000-000-0000",
  },
  "description": "Επισκευή iPhone 7, 8, X, XS, XR, 11, 12, 13, 14, 15, 16 και 17. Αλλαγή οθόνης, μπαταρίας, κάμερας, θύρας Lightning/USB-C. Γνήσια ανταλλακτικά, γραπτή εγγύηση, αποτέλεσμα από 30 λεπτά.",
  "serviceType": "Επισκευή iPhone",
  "areaServed": "Θεσσαλονίκη",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Επισκευές iPhone",
    "itemListElement": IPHONE_SERIES.flatMap((s) =>
      s.models.map((m) => ({
        "@type": "Offer",
        "name": `Επισκευή ${m.name}`,
        "description": `Αλλαγή οθόνης ${m.screen}, αλλαγή μπαταρίας και άλλες επισκευές ${m.name}`,
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": m.batteryPrice.replace("€", ""),
          "priceCurrency": "EUR",
        },
      }))
    ),
  },
};

export default function ServiceIphone() {
  const [activeSeries, setActiveSeries] = useState<string>("all");

  const visibleSeries =
    activeSeries === "all"
      ? IPHONE_SERIES
      : IPHONE_SERIES.filter((s) => s.id === activeSeries);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή iPhone — Όλα τα Μοντέλα iPhone 7–17 Pro Max | HiTech Doctor Θεσσαλονίκη"
        description="Επισκευή iPhone σε όλα τα μοντέλα: iPhone 7, 8, X, XR, XS, 11, 12, 13, 14, 15, 16, 17. Αλλαγή οθόνης από €35, μπαταρία από €25. Γνήσια ανταλλακτικά, γραπτή εγγύηση, εξυπηρέτηση από 30 λεπτά."
        url="https://hitechdoctor.com/services/episkeui-iphone"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="keywords"
          content="επισκευή iPhone, αλλαγή οθόνης iPhone, αλλαγή μπαταρία iPhone, επισκευή iPhone Θεσσαλονίκη, επισκευή iPhone 15 Pro Max, επισκευή iPhone 14, επισκευή iPhone 13, service iPhone"
        />
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-iphone" />
      </Helmet>

      {/* Ambient glow */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(148,163,184,0.08) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services/episkeui-kiniton" className="hover:text-primary transition-colors">Επισκευή Κινητών</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Επισκευή iPhone</span>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="container mx-auto px-4 pt-8 pb-10 text-center">
          <Badge
            variant="outline"
            className="mb-5 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold"
          >
            <SiApple className="w-3.5 h-3.5 mr-1.5" />
            Εξειδικευμένο Apple Service
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-5 leading-tight text-foreground">
            Επισκευή{" "}
            <span className="gradient-text">iPhone</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Επισκευάζουμε κάθε μοντέλο iPhone — από το 7 έως το 17 Pro Max — με γνήσια ή
            premium ανταλλακτικά. Αποτέλεσμα από 30 λεπτά, με γραπτή εγγύηση καλής λειτουργίας.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Shield, text: "Γραπτή Εγγύηση" },
              { icon: Clock, text: "Από 30 λεπτά" },
              { icon: CheckCircle2, text: "Γνήσια Ανταλλακτικά" },
              { icon: SiApple, text: "Apple Εξειδίκευση" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card pcb-border text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* ── Common Repairs ── */}
        <section className="container mx-auto px-4 pb-10">
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Τι Επισκευάζουμε
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMMON_REPAIRS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card pcb-border rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <p className="text-xs font-bold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Series Filter ── */}
        <section className="container mx-auto px-4 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveSeries("all")}
              data-testid="filter-all"
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                activeSeries === "all"
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-muted-foreground hover:border-white/20"
              }`}
            >
              Όλα
            </button>
            {IPHONE_SERIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSeries(s.id)}
                data-testid={`filter-series-${s.id}`}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  activeSeries === s.id
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Model Grid ── */}
        <section className="container mx-auto px-4 pb-20">
          {visibleSeries.map((series) => (
            <div key={series.id} className="mb-10">
              {/* Series header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: series.color, boxShadow: `0 0 8px ${series.color}` }}
                />
                <h2 className="text-lg font-display font-bold text-foreground">{series.label}</h2>
                <div className="h-px flex-1 bg-white/8" />
                <Badge variant="outline" className={`text-[10px] font-semibold ${series.badgeClass}`}>
                  {series.models.length} μοντέλα
                </Badge>
              </div>

              {/* Model cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {series.models.map((model) => (
                  <article
                    key={model.name}
                    data-testid={`card-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`group relative bg-card pcb-border rounded-xl p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200 hover:border-white/20 ${series.accentClass}`}
                  >
                    {/* Tag NEW */}
                    {model.tag && (
                      <span className="absolute top-3 right-3 text-[9px] font-extrabold tracking-widest text-primary bg-primary/15 border border-primary/30 px-1.5 py-0.5 rounded-full">
                        {model.tag}
                      </span>
                    )}

                    {/* Model name */}
                    <div>
                      <h3 className="font-display font-bold text-sm text-foreground leading-tight pr-8">
                        {model.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{model.screen}</p>
                    </div>

                    {/* Port badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        model.port === "USB-C"
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}>
                        {model.port}
                      </span>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Οθόνη</p>
                        <p className="text-sm font-extrabold text-primary">{model.screenPrice}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Μπαταρία</p>
                        <p className="text-sm font-extrabold text-primary">{model.batteryPrice}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <a href="tel:+30-000-000-0000" className="mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-white/10 hover:border-primary/40 hover:bg-primary/10 text-xs h-8 group-hover:border-primary/30 transition-all"
                        data-testid={`button-repair-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Phone className="w-3 h-3 mr-1.5" />
                        Κράτηση Ραντεβού
                      </Button>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── CTA Strip ── */}
        <section
          className="py-14 border-t border-primary/10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.05) 0%, transparent 60%, rgba(148,163,184,0.05) 100%)" }}
        >
          <div className="absolute inset-0 circuit-bg opacity-50 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Δε βρήκες το μοντέλο σου;
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm">
              Επικοινώνησε μαζί μας — επισκευάζουμε κάθε μοντέλο iPhone με δωρεάν διάγνωση.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="tel:+30-000-000-0000">
                <Button
                  size="lg"
                  className="h-11 px-7 font-semibold border-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                    boxShadow: "0 0 24px rgba(0,210,200,0.3)",
                  }}
                  data-testid="button-cta-call"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Τηλεφωνική Επικοινωνία
                </Button>
              </a>
              <Link href="/services/episkeui-kiniton">
                <Button size="lg" variant="outline" className="h-11 px-7 border-primary/30 text-primary" data-testid="button-back-mobile">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Επισκευή Κινητών
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
