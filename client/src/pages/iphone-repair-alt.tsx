import { useState, useEffect, useRef, Fragment } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Monitor, Battery, Zap, ChevronRight, Phone,
  Shield, Clock, Wrench, Star, ArrowRight, CalendarCheck,
} from "lucide-react";
import { findModelBySlug, IPHONE_SERIES } from "@/data/iphone-devices";

const repairScreenImg  = "/images/repair-screen.webp";
const repairBatteryImg = "/images/repair-battery.webp";
const repairPortImg    = "/images/repair-port.webp";

const TRUST_BADGES = [
  { icon: Shield, label: "Γραπτή Εγγύηση" },
  { icon: Clock,  label: "Από 30 λεπτά"  },
  { icon: Wrench, label: "Δωρεάν Διάγνωση" },
  { icon: Star,   label: "4.9★ στο Google" },
];

const ANCHOR_LINKS = [
  { id: "othoni",    label: "Αλλαγή Οθόνης",    icon: Monitor  },
  { id: "mpataria",  label: "Αλλαγή Μπαταρίας",  icon: Battery  },
  { id: "thyra",     label: "Θύρα Φόρτισης",     icon: Zap      },
  { id: "rantevou",  label: "Ραντεβού",           icon: CalendarCheck },
];

function TierCard({ tier, selected, onSelect }: {
  tier: { label: string; sublabel: string; price: number; features: string[]; badge?: string; recommended?: boolean };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,210,200,0.15)] ring-1 ring-primary/40"
          : tier.recommended
          ? "border-primary/40 bg-primary/4 hover:border-primary/60"
          : "border-white/10 bg-card hover:border-white/20"
      }`}
      data-testid={`tier-${tier.label.toLowerCase()}`}
    >
      {tier.badge && (
        <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">
          {tier.badge}
        </span>
      )}
      {tier.recommended && !tier.badge && (
        <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/80 text-black">
          Συνιστάται
        </span>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-display font-bold text-sm text-foreground">{tier.label}</p>
          <p className="text-[11px] text-muted-foreground">{tier.sublabel}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
          selected ? "border-primary bg-primary" : "border-white/20"
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-black" />}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-primary mb-2">€{tier.price}</p>
      <ul className="space-y-1">
        {tier.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

function SectionHeader({ id, icon: Icon, title, subtitle, img, alt }: {
  id: string; icon: typeof Monitor; title: string; subtitle: string; img: string; alt: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-xl text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-5 border border-white/8">
        <img src={img} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-white font-bold text-base">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function IPhoneRepairAlt() {
  const [, params] = useRoute("/episkevi-v2-iphone/:slug");
  const modelSlug = params?.slug ?? "";
  const model = findModelBySlug(modelSlug);

  const [selectedScreenTier,  setSelectedScreenTier]  = useState(1);
  const [selectedBatteryTier, setSelectedBatteryTier] = useState(1);
  const [activeAnchor, setActiveAnchor] = useState("othoni");
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorSticky, setAnchorSticky] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (anchorRef.current) {
        setAnchorSticky(anchorRef.current.getBoundingClientRect().top <= 0);
      }
      const ids = ["othoni", "mpataria", "thyra", "rantevou"];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveAnchor(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Μοντέλο δεν βρέθηκε</h1>
          <Link href="/services/episkeui-iphone">
            <Button className="bg-primary text-black">← Επιστροφή στα μοντέλα iPhone</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `Επισκευή ${model.name} — Τιμές Αλλαγής Οθόνης, Μπαταρίας & Θύρας | HiTech Doctor Αθήνα`;
  const pageDesc  = `Επισκευή ${model.name} στην Αθήνα. Αλλαγή οθόνης από €${model.screenTiers[2].price}, μπαταρία €${model.batteryTiers[2].price}, θύρα φόρτισης €${model.chargingPortPrice}. Γνήσια & premium ανταλλακτικά, εγγύηση, αποτέλεσμα 30 λεπτά.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-iphone/${model.slug}`;

  const screenPrice  = model.screenTiers[selectedScreenTier].price;
  const batteryPrice = model.batteryTiers[selectedBatteryTier].price;
  const portPrice    = model.chargingPortPrice;

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
    "offers": [
      ...model.screenTiers.map((t) => ({
        "@type": "Offer",
        "name": `Αλλαγή Οθόνης ${model.name} — ${t.label}`,
        "price": t.price,
        "priceCurrency": "EUR",
      })),
      ...model.batteryTiers.map((t) => ({
        "@type": "Offer",
        "name": `Αλλαγή Μπαταρίας ${model.name} — ${t.label}`,
        "price": t.price,
        "priceCurrency": "EUR",
      })),
      {
        "@type": "Offer",
        "name": `Αλλαγή Θύρας Φόρτισης ${model.name}`,
        "price": model.chargingPortPrice,
        "priceCurrency": "EUR",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo title={pageTitle} description={pageDesc} url={canonicalUrl} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 pt-6 pb-20 max-w-6xl">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-iphone" className="hover:text-primary transition-colors">Επισκευή iPhone</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium">{model.name}</span>
        </nav>

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl border border-white/8 bg-card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {model.tag && (
                  <Badge className="bg-primary text-black text-[10px] font-bold">{model.tag}</Badge>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  model.port === "USB-C"
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}>{model.port}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground">
                Επισκευή {model.name}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">{model.screen} · Αθήνα</p>
              <div className="flex flex-wrap gap-4 mt-4">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <b.icon className="w-3.5 h-3.5 text-primary" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
            {/* Quick price summary in hero */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Οθόνη", price: `από €${model.screenTiers[2].price}` },
                { label: "Μπαταρία", price: `από €${model.batteryTiers[2].price}` },
                { label: "Θύρα", price: `€${model.chargingPortPrice}` },
              ].map((item) => (
                <div key={item.label} className="text-center min-w-[72px] rounded-xl border border-white/10 bg-background/50 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-sm font-extrabold text-primary">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sticky Anchor Navigation ── */}
        <div ref={anchorRef} className="relative">
          <div className={`${anchorSticky ? "fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-white/10 shadow-lg" : ""}`}>
            <div className={`${anchorSticky ? "container mx-auto px-4 max-w-6xl" : ""}`}>
              <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
                {ANCHOR_LINKS.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    onClick={(e) => { e.preventDefault(); document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeAnchor === a.id
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                    }`}
                    data-testid={`anchor-${a.id}`}
                  >
                    <a.icon className="w-3.5 h-3.5" />
                    {a.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {anchorSticky && <div className="h-10" />}
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 mt-6">

          {/* ─── Left column: all services stacked ─── */}
          <div className="lg:col-span-2 space-y-12">

            {/* ══ Section 1: Αλλαγή Οθόνης ══ */}
            <section>
              <SectionHeader
                id="othoni"
                icon={Monitor}
                title="Αλλαγή Οθόνης"
                subtitle={`${model.name} · Επιλέξτε ποιότητα ανταλλακτικού`}
                img={repairScreenImg}
                alt={`Αλλαγή οθόνης ${model.name}`}
              />

              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {model.screenTiers.map((tier, i) => (
                  <TierCard
                    key={tier.label}
                    tier={tier}
                    selected={selectedScreenTier === i}
                    onSelect={() => setSelectedScreenTier(i)}
                  />
                ))}
              </div>

              {/* CTA bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {model.screenTiers[selectedScreenTier].label} — Αλλαγή Οθόνης {model.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{model.screenTiers[selectedScreenTier].sublabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{screenPrice}</span>
                  <Button
                    onClick={() => setModalOpen(true)}
                    className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-screen"
                  >
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
            </section>

            {/* ══ Section 2: Αλλαγή Μπαταρίας ══ */}
            <section>
              <SectionHeader
                id="mpataria"
                icon={Battery}
                title="Αλλαγή Μπαταρίας"
                subtitle={`${model.name} · Επιλέξτε ποιότητα μπαταρίας`}
                img={repairBatteryImg}
                alt={`Αλλαγή μπαταρίας ${model.name}`}
              />

              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {model.batteryTiers.map((tier, i) => (
                  <TierCard
                    key={tier.label}
                    tier={tier}
                    selected={selectedBatteryTier === i}
                    onSelect={() => setSelectedBatteryTier(i)}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {model.batteryTiers[selectedBatteryTier].label} — Αλλαγή Μπαταρίας {model.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{model.batteryTiers[selectedBatteryTier].sublabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">€{batteryPrice}</span>
                  <Button
                    onClick={() => setModalOpen(true)}
                    className="h-9 px-5 font-semibold border-0 text-sm"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-battery"
                  >
                    Κλείσε Ραντεβού
                  </Button>
                </div>
              </div>
            </section>

            {/* ══ Section 3: Θύρα Φόρτισης ══ */}
            <section>
              <SectionHeader
                id="thyra"
                icon={Zap}
                title="Αλλαγή Θύρας Φόρτισης"
                subtitle={`${model.name} · ${model.port} connector — Σταθερή τιμή`}
                img={repairPortImg}
                alt={`Αλλαγή θύρας φόρτισης ${model.name}`}
              />

              <div className="rounded-2xl border border-white/10 bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-base text-foreground mb-1">
                      Αντικατάσταση {model.port} connector
                    </h3>
                    <ul className="space-y-1.5 mt-2">
                      {[
                        `Αντικατάσταση ${model.port} connector`,
                        "Δοκιμή φόρτισης & data μεταφοράς",
                        "Καθαρισμός εσωτερικής λοβίτσας",
                        "Εγγύηση 6 μηνών εργασίας",
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-extrabold text-primary">€{portPrice}</p>
                    <p className="text-[10px] text-muted-foreground">συμπ. εργατικά</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/8">
                  <Button
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto h-10 px-8 font-semibold border-0"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid="button-book-port"
                  >
                    Κλείσε Ραντεβού — €{portPrice}
                  </Button>
                </div>
              </div>
            </section>

            {/* ══ Related Models ══ */}
            <section>
              <h2 className="font-display font-bold text-base text-foreground mb-3">Άλλα μοντέλα iPhone</h2>
              <div className="flex flex-wrap gap-2">
                {IPHONE_SERIES.flatMap((s) => s.models)
                  .filter((m) => m.slug !== model.slug)
                  .slice(0, 10)
                  .map((m) => (
                    <Link key={m.slug} href={`/episkevi-iphone/${m.slug}`}>
                      <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-card hover:border-primary/40 hover:text-primary text-muted-foreground transition-all cursor-pointer inline-block">
                        {m.name}
                      </span>
                    </Link>
                  ))}
              </div>
            </section>

          </div>

          {/* ─── Right: sticky sidebar ─── */}
          <aside className="hidden lg:block">
            <div id="rantevou" className="sticky top-20 space-y-4 scroll-mt-24">

              {/* Price Summary Card */}
              <div className="rounded-2xl border border-white/10 bg-card p-5">
                <h3 className="font-display font-bold text-sm text-foreground mb-4">Σύνοψη Τιμών</h3>
                <div className="space-y-3">
                  {[
                    { label: "Αλλαγή Οθόνης",     price: screenPrice,  qual: model.screenTiers[selectedScreenTier].label  },
                    { label: "Αλλαγή Μπαταρίας",   price: batteryPrice, qual: model.batteryTiers[selectedBatteryTier].label },
                    { label: "Θύρα Φόρτισης",      price: portPrice,    qual: "Σταθερή τιμή" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{row.label}</p>
                        <p className="text-[10px] text-muted-foreground">{row.qual}</p>
                      </div>
                      <span className="text-base font-extrabold text-primary shrink-0">€{row.price}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full h-11 mt-5 font-bold border-0"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                  data-testid="button-sidebar-book"
                >
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  Κλείσε Ραντεβού
                </Button>
                <a
                  href="tel:+306981882005"
                  className="flex items-center justify-center gap-2 mt-2 h-10 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                  data-testid="button-sidebar-call"
                >
                  <Phone className="w-4 h-4" />
                  698 188 2005
                </a>
              </div>

              {/* Trust card */}
              <div className="rounded-2xl border border-white/8 bg-card/50 p-4">
                <p className="text-xs font-bold text-foreground mb-3">Γιατί HiTech Doctor;</p>
                <ul className="space-y-2">
                  {[
                    "Γνήσια & premium ανταλλακτικά",
                    "Εγγύηση εργασίας γραπτώς",
                    "Αποτέλεσμα σε 30–60 λεπτά",
                    "Δωρεάν διάγνωση",
                    "Κέντρο Αθήνας — εύκολη πρόσβαση",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rating card */}
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
                <div className="text-3xl font-extrabold text-yellow-400 leading-none">4.9</div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">200+ αξιολογήσεις Google</p>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* ── Mobile sticky CTA ── */}
        <div id="rantevou-mobile" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-white/10 flex gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            className="flex-1 h-11 font-bold border-0"
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            data-testid="button-mobile-book"
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Κλείσε Ραντεβού
          </Button>
          <a
            href="tel:+306981882005"
            className="flex items-center justify-center w-11 h-11 rounded-xl border border-primary/30 text-primary"
            data-testid="button-mobile-call"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>

      </main>

      <Footer />
      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName={model.name}
      />
    </div>
  );
}
