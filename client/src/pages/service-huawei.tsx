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
import { SiHuawei } from "react-icons/si";
import { Link } from "wouter";
import { useState } from "react";
import { HUAWEI_SERIES } from "@/data/huawei-devices";

const COMMON_REPAIRS = [
  { icon: Monitor, label: "Αλλαγή Οθόνης",    desc: "OLED / LCD γνήσια ή premium ποιότητας" },
  { icon: Battery, label: "Αλλαγή Μπαταρίας",  desc: "Ανακτήστε 100% αυτονομία" },
  { icon: Layers,  label: "Πίσω Κάλυμμα",      desc: "Αντικατάσταση πίσω γυαλιού/πλαστικού" },
  { icon: Zap,     label: "Θύρα USB-C",         desc: "Επισκευή φόρτισης & δεδομένων" },
  { icon: Camera,  label: "Επισκευή Κάμερας",   desc: "Μπροστά / πίσω / Leica οπτική" },
  { icon: Wrench,  label: "Επισκευή Πλακέτας",  desc: "Μικροεπισκευές, BGA, reballing" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή Huawei — P, Mate, Nova & Y Series",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
    "telephone": "+306981882005",
    "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
  },
  "description": "Επισκευή Huawei στην Αθήνα. P Series, Mate Series, Nova Series, Y Series. Αλλαγή οθόνης OLED, μπαταρίας, θύρας USB-C. Γνήσια ανταλλακτικά, γραπτή εγγύηση, αποτέλεσμα 30 λεπτά.",
  "serviceType": "Επισκευή Huawei",
  "areaServed": "Αθήνα",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Επισκευές Huawei",
    "itemListElement": HUAWEI_SERIES.flatMap((s) =>
      s.models.map((m) => ({
        "@type": "Offer",
        "name": `Επισκευή ${m.name}`,
        "description": `Αλλαγή οθόνης ${m.screen} ${m.name}`,
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

export default function ServiceHuawei() {
  const [activeSeries, setActiveSeries] = useState<string>("all");

  const visibleSeries =
    activeSeries === "all"
      ? HUAWEI_SERIES
      : HUAWEI_SERIES.filter((s) => s.id === activeSeries);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή Huawei — P, Mate, Nova & Y Series | HiTech Doctor Αθήνα"
        description="Επισκευή Huawei P60 Pro, P50, Mate 60 Pro, Nova 13 Pro στην Αθήνα. Αλλαγή οθόνης OLED, μπαταρίας, USB-C. Γνήσια ανταλλακτικά, εγγύηση, αποτέλεσμα 30 λεπτά."
        url="https://hitechdoctor.com/services/episkeui-huawei"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="επισκευή Huawei, αλλαγή οθόνης Huawei, αλλαγή μπαταρίας Huawei, επισκευή Huawei Αθήνα, service Huawei P30 P40 P50 Mate Nova" />
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-huawei" />
      </Helmet>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />

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
            <span className="text-primary font-medium">Επισκευή Huawei</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                  <SiHuawei className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">HiTech Doctor Αθήνα</p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-tight">
                    Επισκευή Huawei
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mb-5">
                Εξειδικευμένη επισκευή <strong className="text-foreground">Huawei P Series, Mate Series, Nova Series και Y Series</strong> στην Αθήνα.
                Αλλαγή οθόνης OLED/LCD, μπαταρίας, θύρας USB-C και επισκευή πλακέτας.
                Γνήσια ή premium ανταλλακτικά, <strong className="text-foreground">γραπτή εγγύηση</strong>, αποτέλεσμα σε 30–60 λεπτά.
              </p>
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { icon: Shield, text: "Γραπτή Εγγύηση" },
                  { icon: Clock,  text: "30–60 λεπτά" },
                  { icon: Wrench, text: "Δωρεάν Διάγνωση" },
                  { icon: CheckCircle2, text: "Πιστοποιημένοι Τεχνικοί" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-white/10 rounded-full px-3 py-1.5">
                    <b.icon className="w-3.5 h-3.5 text-primary" />{b.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <a href="tel:+306981882005">
                  <Button className="h-10 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-hero-call">
                    <Phone className="w-4 h-4 mr-2" />6981 882 005
                  </Button>
                </a>
                <Link href="/services/episkeui-kiniton">
                  <Button variant="outline" className="h-10 px-5 font-semibold text-sm border-white/15 hover:border-primary/40">
                    Όλα τα Κινητά <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick services */}
            <div className="w-full lg:w-72 shrink-0 grid grid-cols-2 gap-2.5">
              {COMMON_REPAIRS.map((r) => (
                <div key={r.label} className="p-3 rounded-xl border border-white/10 bg-card hover:border-red-500/20 transition-colors">
                  <r.icon className="w-5 h-5 text-red-400 mb-2" />
                  <p className="text-xs font-bold text-foreground leading-tight">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Series filter */}
        <div className="sticky top-16 z-30 border-b border-white/8 bg-background/90 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
              <button
                onClick={() => setActiveSeries("all")}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeSeries === "all"
                    ? "bg-primary text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                data-testid="filter-all"
              >
                Όλα
              </button>
              {HUAWEI_SERIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSeries(s.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeSeries === s.id
                      ? "bg-primary text-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid={`filter-${s.id}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model cards */}
        <section className="container mx-auto px-4 py-8 max-w-6xl">
          {visibleSeries.map((series) => (
            <div key={series.id} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${series.badgeClass}`}>{series.label}</span>
                <span className="text-xs text-muted-foreground">{series.models.length} μοντέλα</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {series.models.map((model) => (
                  <Link key={model.slug} href={`/episkevi-huawei/${model.slug}`}>
                    <article
                      className={`group relative flex flex-col gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${series.accentClass} hover:border-opacity-60`}
                      data-testid={`card-model-${model.slug}`}
                    >
                      {model.tag && (
                        <Badge className="absolute top-3 right-3 bg-primary text-black text-[9px] font-bold px-1.5 py-0.5">
                          {model.tag}
                        </Badge>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors pr-8">
                          {model.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{model.screen}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">{model.screenPriceOEM ? "Οθόνη από" : "Οθόνη"}</p>
                          <p className="text-sm font-extrabold text-primary">€{model.screenPriceOEM ?? model.screenPrice}</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Μπαταρία</p>
                          <p className="text-sm font-extrabold text-primary">€{model.batteryPrice}</p>
                        </div>
                      </div>

                      <Button size="sm" className="mt-auto w-full h-8 text-xs font-semibold border-0 group-hover:opacity-90 transition-all"
                        style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                        data-testid={`button-model-${model.slug}`}>
                        Δείτε Τιμές <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Why choose us */}
        <section className="border-t border-white/8 bg-card/40">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">Γιατί να Επιλέξετε Εμάς;</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Shield,       title: "Γνήσια Ανταλλακτικά", desc: "Χρησιμοποιούμε γνήσια ή premium ανταλλακτικά Α+ ποιότητας για κάθε μοντέλο Huawei." },
                { icon: Clock,        title: "30–60 Λεπτά",         desc: "Οι περισσότερες επισκευές ολοκληρώνονται ενώ περιμένετε στο κατάστημα." },
                { icon: CheckCircle2, title: "Γραπτή Εγγύηση",      desc: "Κάθε επισκευή καλύπτεται από γραπτή εγγύηση για πλήρη σιγουριά." },
                { icon: Wrench,       title: "Δωρεάν Διάγνωση",     desc: "Τεχνικός έλεγχος χωρίς χρέωση — πληρώνετε μόνο αν προχωρήσετε σε επισκευή." },
              ].map((b) => (
                <div key={b.title} className="p-5 rounded-2xl border border-white/10 bg-card">
                  <b.icon className="w-7 h-7 text-primary mb-3" />
                  <p className="font-display font-bold text-sm text-foreground mb-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
