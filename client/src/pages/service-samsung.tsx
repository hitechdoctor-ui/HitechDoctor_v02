import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Shield, Clock, Wrench, ChevronRight, Phone,
  Zap, Camera, Battery, Monitor, ArrowRight, Layers,
} from "lucide-react";
import { SiSamsung } from "react-icons/si";
import { Link } from "wouter";
import { useState } from "react";
import { SAMSUNG_SERIES } from "@/data/samsung-devices";

const COMMON_REPAIRS = [
  { icon: Monitor, label: "Αλλαγή Οθόνης",    desc: "AMOLED γνήσια ή premium ποιότητας" },
  { icon: Battery, label: "Αλλαγή Μπαταρίας",  desc: "Ανακτήστε 100% αυτονομία" },
  { icon: Layers,  label: "Πίσω Κάλυμμα",      desc: "Αντικατάσταση πίσω γυαλιού/πλαστικού" },
  { icon: Zap,     label: "Θύρα USB-C",         desc: "Επισκευή φόρτισης & δεδομένων" },
  { icon: Camera,  label: "Επισκευή Κάμερας",   desc: "Μπροστά / πίσω / Ultra Wide" },
  { icon: Wrench,  label: "Επισκευή Πλακέτας",  desc: "Μικροεπισκευές, BGA, reballing" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή Samsung Galaxy — Όλα τα Μοντέλα",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
    "telephone": "+306981882005",
    "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
  },
  "description": "Επισκευή Samsung Galaxy A, S και Z Series. Αλλαγή οθόνης, μπαταρίας, πίσω καλύμματος, θύρας USB-C. Γνήσια ανταλλακτικά, γραπτή εγγύηση, αποτέλεσμα από 30 λεπτά.",
  "serviceType": "Επισκευή Samsung",
  "areaServed": "Αθήνα",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Επισκευές Samsung Galaxy",
    "itemListElement": SAMSUNG_SERIES.flatMap((s) =>
      s.models.map((m) => ({
        "@type": "Offer",
        "name": `Επισκευή ${m.name}`,
        "description": `Αλλαγή οθόνης ${m.screen}, αλλαγή μπαταρίας και άλλες επισκευές ${m.name}`,
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": m.batteryPrice,
          "priceCurrency": "EUR",
        },
      }))
    ),
  },
};

export default function ServiceSamsung() {
  const [activeSeries, setActiveSeries] = useState<string>("all");

  const visibleSeries =
    activeSeries === "all"
      ? SAMSUNG_SERIES
      : SAMSUNG_SERIES.filter((s) => s.id === activeSeries);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή Samsung Galaxy — A, S & Z Series | HiTech Doctor Αθήνα"
        description="Επισκευή Samsung Galaxy A15 έως S25 Ultra & Z Fold/Flip. Αλλαγή οθόνης AMOLED, μπαταρία, πίσω κάλυμμα, θύρα USB-C. Γνήσια ανταλλακτικά, γραπτή εγγύηση, αποτέλεσμα 30 λεπτά."
        url="https://hitechdoctor.com/services/episkeui-samsung"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="keywords"
          content="επισκευή Samsung, αλλαγή οθόνης Samsung Galaxy, αλλαγή μπαταρίας Samsung, επισκευή Samsung Αθήνα, επισκευή Galaxy S25, επισκευή Galaxy A55, service Samsung"
        />
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-samsung" />
      </Helmet>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(30,64,175,0.08) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services/episkeui-kiniton" className="hover:text-primary transition-colors">Επισκευή Κινητών</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Επισκευή Samsung</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 pt-8 pb-10 text-center">
          <Badge
            variant="outline"
            className="mb-5 border-blue-500/30 bg-blue-500/10 text-blue-400 px-4 py-1.5 text-sm font-semibold"
          >
            <SiSamsung className="w-4 h-4 mr-1.5" />
            Εξειδικευμένο Samsung Service
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-5 leading-tight text-foreground">
            Επισκευή{" "}
            <span className="gradient-text">Samsung Galaxy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Επισκευάζουμε κάθε μοντέλο Samsung Galaxy — από το A15 έως το S25 Ultra & Z Fold — με γνήσια ή premium ανταλλακτικά.
            Αποτέλεσμα από 30 λεπτά, με γραπτή εγγύηση καλής λειτουργίας.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Shield, text: "Γραπτή Εγγύηση" },
              { icon: Clock, text: "Από 30 λεπτά" },
              { icon: CheckCircle2, text: "Γνήσια Ανταλλακτικά" },
              { icon: SiSamsung, text: "Samsung Εξειδίκευση" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card pcb-border text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* Common Repairs */}
        <section className="container mx-auto px-4 pb-10">
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Τι Επισκευάζουμε
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMMON_REPAIRS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card pcb-border rounded-xl p-3 flex flex-col items-center gap-2 text-center hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-bold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Series Filter */}
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
            {SAMSUNG_SERIES.map((s) => (
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

        {/* Model Grid */}
        <section className="container mx-auto px-4 pb-20">
          {visibleSeries.map((series) => (
            <div key={series.id} className="mb-10">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {series.models.map((model) => (
                  <article
                    key={model.slug}
                    data-testid={`card-model-${model.slug}`}
                    className={`group relative bg-card pcb-border rounded-xl p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200 hover:border-white/20 ${series.accentClass}`}
                  >
                    {model.tag && (
                      <span className="absolute top-3 right-3 text-[9px] font-extrabold tracking-widest text-primary bg-primary/15 border border-primary/30 px-1.5 py-0.5 rounded-full">
                        {model.tag}
                      </span>
                    )}

                    <div>
                      <h3 className="font-display font-bold text-sm text-foreground leading-tight pr-8">
                        {model.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{model.screen}</p>
                    </div>

                    {model.foldable && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                          Foldable
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Οθόνη</p>
                        <p className="text-sm font-extrabold text-primary">€{model.screenPrice}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Μπαταρία</p>
                        <p className="text-sm font-extrabold text-primary">€{model.batteryPrice}</p>
                      </div>
                    </div>

                    <Link href={`/episkevi-samsung/${model.slug}`}>
                      <Button
                        size="sm"
                        className="mt-auto w-full h-8 text-xs font-semibold border-0 group-hover:opacity-90 transition-all"
                        style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                        data-testid={`button-repair-${model.slug}`}
                      >
                        <ArrowRight className="w-3 h-3 mr-1.5" />
                        Δείτε Τιμές & Πληροφορίες
                      </Button>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA Strip */}
        <section
          className="py-14 border-t border-primary/10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(30,64,175,0.05) 0%, transparent 60%, rgba(139,92,246,0.05) 100%)" }}
        >
          <div className="absolute inset-0 circuit-bg opacity-50 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Δε βρήκες το μοντέλο σου;
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm">
              Επικοινώνησε μαζί μας — επισκευάζουμε κάθε μοντέλο Samsung με δωρεάν διάγνωση.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="tel:+306981882005">
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

        <ReviewsSection />
      </main>

      <Footer />
    </div>
  );
}
