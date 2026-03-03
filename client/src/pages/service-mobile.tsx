import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Clock, Shield, Smartphone, ChevronRight, Phone, Wrench } from "lucide-react";
import { SiApple, SiSamsung, SiXiaomi, SiHuawei, SiOneplus } from "react-icons/si";
import { Link } from "wouter";

const brands = [
  {
    id: "iphone",
    name: "iPhone",
    brand: "Apple",
    Icon: SiApple,
    tagline: "Εξειδικευμένες επισκευές για κάθε μοντέλο iPhone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Επισκευή iPhone Apple οθόνη μπαταρία Θεσσαλονίκη",
    repairs: [
      "Αλλαγή οθόνης (OLED/LCD)",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή κάμερας",
      "Επισκευή θύρας Lightning / USB-C",
      "Επισκευή μετά από βρέξιμο",
      "Επισκευή πλακέτας",
      "Ξεκλείδωμα / iCloud unlock",
    ],
    models: "iPhone 7, 8, X, XS, XR, 11, 12, 13, 14, 15 Pro Max & όλα",
    priceFrom: "€25",
    timeFrom: "30 λεπτά",
    color: "from-slate-600/30 to-slate-500/20",
    glowColor: "rgba(148,163,184,0.15)",
    borderColor: "border-slate-500/25",
  },
  {
    id: "samsung",
    name: "Samsung",
    brand: "Samsung",
    Icon: SiSamsung,
    tagline: "Επισκευές για Galaxy S, A, M, Note & Z series",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Επισκευή Samsung Galaxy οθόνη μπαταρία Θεσσαλονίκη",
    repairs: [
      "Αλλαγή οθόνης AMOLED",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή κάμερας",
      "Επισκευή θύρας USB-C",
      "Επισκευή μετά από βρέξιμο",
      "Επισκευή πλακέτας",
      "Αλλαγή πίσω γυαλιού",
    ],
    models: "Galaxy S24, S23, S22, A55, A35, A15, Note 20, Z Fold & άλλα",
    priceFrom: "€20",
    timeFrom: "30 λεπτά",
    color: "from-blue-600/25 to-blue-500/15",
    glowColor: "rgba(59,130,246,0.15)",
    borderColor: "border-blue-500/25",
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    brand: "Xiaomi",
    Icon: SiXiaomi,
    tagline: "Επισκευές για Xiaomi, Redmi & POCO",
    image: "https://images.unsplash.com/photo-1614941030558-2e6a34f5d001?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Επισκευή Xiaomi Redmi οθόνη μπαταρία Θεσσαλονίκη",
    repairs: [
      "Αλλαγή οθόνης",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή κάμερας",
      "Επισκευή θύρας USB-C",
      "Επισκευή μετά από βρέξιμο",
      "Επισκευή πλακέτας",
      "Αλλαγή πίσω καλύμματος",
    ],
    models: "Xiaomi 14, 13, 12, Redmi Note 13, 12, POCO X6, F6 & άλλα",
    priceFrom: "€20",
    timeFrom: "30 λεπτά",
    color: "from-orange-600/25 to-orange-500/15",
    glowColor: "rgba(249,115,22,0.12)",
    borderColor: "border-orange-500/25",
  },
  {
    id: "huawei",
    name: "Huawei",
    brand: "Huawei",
    Icon: SiHuawei,
    tagline: "Επισκευές για Huawei & Honor",
    image: "https://images.unsplash.com/photo-1544866092-1677b2928e6f?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Επισκευή Huawei Honor οθόνη μπαταρία Θεσσαλονίκη",
    repairs: [
      "Αλλαγή οθόνης",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή κάμερας Leica",
      "Επισκευή θύρας USB-C",
      "Επισκευή μετά από βρέξιμο",
      "Επισκευή πλακέτας",
      "Αλλαγή πίσω γυαλιού",
    ],
    models: "P60, P50, Mate 50, Nova 11, Honor 90, Honor Magic & άλλα",
    priceFrom: "€20",
    timeFrom: "30 λεπτά",
    color: "from-red-600/25 to-red-500/15",
    glowColor: "rgba(239,68,68,0.12)",
    borderColor: "border-red-500/25",
  },
  {
    id: "oneplus",
    name: "OnePlus",
    brand: "OnePlus",
    Icon: SiOneplus,
    tagline: "Επισκευές για OnePlus — Never Settle",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=800",
    imageAlt: "Επισκευή OnePlus οθόνη μπαταρία Θεσσαλονίκη",
    repairs: [
      "Αλλαγή οθόνης AMOLED",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή κάμερας",
      "Επισκευή θύρας USB-C",
      "Επισκευή μετά από βρέξιμο",
      "Επισκευή πλακέτας",
      "Αλλαγή πίσω καλύμματος",
    ],
    models: "OnePlus 12, 11, 10 Pro, Nord CE 4, Nord 4 & άλλα",
    priceFrom: "€25",
    timeFrom: "30 λεπτά",
    color: "from-red-700/25 to-rose-600/15",
    glowColor: "rgba(220,38,38,0.12)",
    borderColor: "border-red-600/25",
  },
];

const whyPoints = [
  { icon: CheckCircle2, text: "Γνήσια ή πιστοποιημένα ανταλλακτικά" },
  { icon: Shield, text: "Γραπτή εγγύηση σε κάθε επισκευή" },
  { icon: Clock, text: "Αποτέλεσμα από 30 λεπτά" },
  { icon: Wrench, text: "Πιστοποιημένοι τεχνικοί" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή Κινητών Τηλεφώνων",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
  },
  "description": "Εξειδικευμένες επισκευές κινητών τηλεφώνων iPhone, Samsung, Xiaomi, Huawei και OnePlus. Αλλαγή οθόνης, μπαταρίας και επισκευή πλακέτας με γνήσια ανταλλακτικά και γραπτή εγγύηση.",
  "serviceType": "Επισκευή Κινητών",
  "areaServed": "Θεσσαλονίκη",
  "offers": brands.map((b) => ({
    "@type": "Offer",
    "name": `Επισκευή ${b.name}`,
    "description": b.tagline,
    "priceCurrency": "EUR",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "minPrice": b.priceFrom.replace("€", ""),
      "priceCurrency": "EUR",
    },
  })),
};

export default function ServiceMobile() {
  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή Κινητών — iPhone, Samsung, Xiaomi, Huawei, OnePlus"
        description="Επισκευή κινητών τηλεφώνων iPhone, Samsung, Xiaomi, Huawei και OnePlus. Αλλαγή οθόνης, μπαταρίας, κάμερας. Γρήγορη εξυπηρέτηση από 30 λεπτά με γραπτή εγγύηση. HiTech Doctor."
        url="https://hitechdoctor.com/services/episkeui-kiniton"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="keywords"
          content="επισκευή κινητών, επισκευή iPhone, επισκευή Samsung, επισκευή Xiaomi, επισκευή Huawei, επισκευή OnePlus, αλλαγή οθόνης κινητό, αλλαγή μπαταρία κινητό, επισκευή κινητών Θεσσαλονίκη"
        />
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-kiniton" />
      </Helmet>

      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,130,180,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Επισκευή Κινητών</span>
          </nav>
        </div>

        {/* ── Hero ── */}
        <section className="container mx-auto px-4 pt-8 pb-14 text-center">
          <Badge
            variant="outline"
            className="mb-5 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold"
          >
            <Smartphone className="w-3.5 h-3.5 mr-1.5" />
            Επισκευή Κινητών Τηλεφώνων
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-5 leading-tight text-foreground">
            Επισκευή{" "}
            <span className="gradient-text">Κινητών</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Επισκευάζουμε κινητά iPhone, Samsung, Xiaomi, Huawei και OnePlus με γνήσια ανταλλακτικά.
            Αποτέλεσμα από 30 λεπτά — με γραπτή εγγύηση καλής λειτουργίας.
          </p>

          {/* Why us — quick strip */}
          <div className="flex flex-wrap gap-3 justify-center">
            {whyPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card pcb-border text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* ── Brand cards ── */}
        <section className="container mx-auto px-4 pb-20" aria-label="Επισκευή ανά μάρκα κινητού">
          {/* Mobile: 2 columns | tablet: 2 columns | desktop: 3 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {brands.map((brand) => (
              <article
                key={brand.id}
                id={brand.id}
                className="group relative bg-card pcb-border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${brand.glowColor}, 0 8px 32px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Image */}
                <div className="relative h-40 sm:h-52 overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-65"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                  {/* Brand Icon + Name */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-background/80 border border-white/10 flex items-center justify-center backdrop-blur-sm"
                    >
                      <brand.Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-foreground bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-white/10">
                      {brand.name}
                    </span>
                  </div>

                  {/* Price badge */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/40 backdrop-blur-sm">
                    <span className="text-primary text-xs font-bold">Από {brand.priceFrom}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-display font-bold text-foreground leading-tight mb-1">
                      Επισκευή {brand.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">{brand.tagline}</p>
                  </div>

                  {/* Repairs list */}
                  <ul className="space-y-1.5 flex-1">
                    {brand.repairs.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>

                  {/* Models */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-primary font-semibold">Μοντέλα:</span> {brand.models}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Εξυπηρέτηση από {brand.timeFrom}</span>
                  </div>
                </div>
              </article>
            ))}

            {/* "Άλλη μάρκα;" filler card — fills the 6th slot on desktop */}
            <article className="bg-card/50 pcb-border rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-3 border-dashed">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center icon-glow">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display font-bold text-foreground text-base">Άλλη Μάρκα;</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Επισκευάζουμε και άλλες μάρκες. Επικοινώνησε μαζί μας για πληροφορίες.
              </p>
              <a href="tel:+30-000-000-0000">
                <Button size="sm" variant="outline" className="border-primary/30 text-primary mt-1" data-testid="button-other-brand-phone">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Επικοινωνία
                </Button>
              </a>
            </article>
          </div>
        </section>

        {/* ── Back to services + CTA ── */}
        <section
          className="py-14 border-t border-primary/10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.05) 0%, transparent 60%, rgba(0,130,180,0.05) 100%)" }}
        >
          <div className="absolute inset-0 circuit-bg opacity-50 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Χρειάζεσαι Επισκευή;
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm">
              Φέρε το κινητό σου ή επικοινώνησε μαζί μας για δωρεάν εκτίμηση — χωρίς δεσμεύσεις.
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
              <Link href="/services">
                <Button size="lg" variant="outline" className="h-11 px-7 border-primary/30 text-primary" data-testid="button-back-services">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Όλες οι Υπηρεσίες
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
