import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Wifi,
  HardDrive,
  Battery,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wrench,
  ScanLine,
  Cpu,
  Bot,
} from "lucide-react";
import { Link } from "wouter";
import { requestOpenRepairChat } from "@/lib/repair-chat-events";

const HomeBelowFold = lazy(() => import("./home-below-fold"));
const homeServices = [
  { icon: Smartphone, title: "Επισκευή Κινητών", href: "/services/episkeui-kiniton" },
  { icon: Tablet, title: "Επισκευή Tablet", href: "/services#episkeui-tablet" },
  { icon: Laptop, title: "Επισκευή Laptop", href: "/services#episkeui-laptop" },
  { icon: Monitor, title: "Επισκευή Desktop", href: "/services#episkeui-desktop" },
  { icon: Cpu, title: "IT Support", href: "/services#it-support" },
  { icon: Wifi, title: "Δίκτυα & Wi-Fi", href: "/services#dixtia-wifi" },
  { icon: HardDrive, title: "Ανάκτηση Δεδομένων", href: "/services#anaktisi-dedomenon" },
  { icon: Battery, title: "Αλλαγή Μπαταρίας", href: "/services#allagi-batarias" },
  { icon: Shield, title: "Αντιική Προστασία", href: "/services#prostasia-iosmon" },
  { icon: ScanLine, title: "Διαγνωστικός Έλεγχος", href: "/services#diagnostiko" },
];

const highlights = [
  { icon: Clock, label: "Express επισκευή", desc: "Αποτέλεσμα σε λίγες ώρες" },
  { icon: Shield, label: "Γραπτή εγγύηση", desc: "Σε κάθε εργασία μας" },
  { icon: CheckCircle2, label: "Γνήσια ανταλλακτικά", desc: "Πιστοποιημένα υλικά" },
  { icon: Zap, label: "Δωρεάν αξιολόγηση", desc: "Χωρίς υποχρεώσεις" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "HiTech Doctor",
  "url": "https://hitechdoctor.com",
  "description": "Εξειδικευμένες επισκευές κινητών, tablet, laptop. IT Support, ανάκτηση δεδομένων και εγκατάσταση δικτύων.",
  "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
  "@id": "https://hitechdoctor.com",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background circuit-bg relative overflow-hidden">
      <Seo
        title="Αρχική"
        description="Ο τεχνολογικός σας γιατρός. Επισκευές κινητών, tablet, laptop, IT Support και αγορά αξεσουάρ στο Αθήνα."
        url="https://hitechdoctor.com"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="επισκευή κινητών Αθήνα, IT support, επισκευή laptop, επισκευή tablet, ανάκτηση δεδομένων, HiTech Doctor" />
        <link rel="canonical" href="https://hitechdoctor.com" />
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&amp;fit=crop&amp;q=80&amp;w=900"
          fetchPriority="high"
        />
      </Helmet>

      {/* Background ambient glows */}
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,130,180,0.08) 0%, transparent 70%)" }}
      />

      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 pt-10 pb-24 lg:pt-16 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center" aria-label="Hero section">
          <div className="flex flex-col items-start gap-6 z-10">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold tracking-wide"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Αξιόπιστες Υπηρεσίες Τεχνολογίας
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight text-foreground">
              Επαναφέρουμε
              <br />
              <span className="gradient-text">την Τεχνολογία</span>
              <br />
              σας στη ζωή.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Στο HiTech Doctor αναλαμβάνουμε επισκευές smartphone, tablet και Η/Υ — γρήγορα, υπεύθυνα και οικονομικά. Βρείτε επίσης κορυφαία αξεσουάρ στο eShop μας.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/services">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold border-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                    boxShadow: "0 0 28px rgba(0,210,200,0.35)",
                  }}
                  data-testid="button-hero-services"
                >
                  Οι Υπηρεσίες μας
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/eshop">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/25 text-primary" data-testid="button-hero-eshop">
                  eShop
                </Button>
              </Link>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold border-primary/25 text-primary gap-2"
                onClick={() => requestOpenRepairChat()}
                data-testid="button-hero-ai-chat"
              >
                <Bot className="w-5 h-5 shrink-0" aria-hidden />
                AI Βοηθός
              </Button>
            </div>

            {/* Quick trust badges */}
            <div className="flex flex-wrap gap-3 mt-2">
              {["Γρήγορη επισκευή", "Γραπτή εγγύηση", "Γνήσια ανταλλακτικά"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative z-10 hidden lg:block">
            <div className="relative w-full max-w-[560px] mx-auto rounded-3xl tech-glow pcb-border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=900"
                alt="Επισκευή τεχνολογίας — μητρική πλακέτα ASUS"
                className="w-full aspect-[4/3] object-cover"
                width={900}
                height={675}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/20 to-transparent" />
              {/* Floating stat */}
              <div className="absolute bottom-5 left-5 glass-panel rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Express Επισκευή</p>
                  <p className="text-xs text-muted-foreground">Αποτέλεσμα σε ώρες</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Highlights bar ── */}
        <section className="border-y border-primary/10 py-8" aria-label="Βασικά πλεονεκτήματα" style={{ background: "rgba(0,210,200,0.03)" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 icon-glow">
                    <h.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.label}</p>
                    <p className="text-xs text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="container mx-auto px-4 py-20" aria-label="Κατάλογος υπηρεσιών">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
              Οι Υπηρεσίες Μας
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Παρέχουμε ολοκληρωμένες λύσεις για κάθε πρόβλημα — από το smartphone σου έως τη δικτυακή υποδομή της επιχείρησής σου.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeServices.map((s) => (
              <Link key={s.title} href={s.href}>
                <div
                  className="group bg-card pcb-border rounded-2xl p-5 flex flex-col items-center text-center gap-3 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(0,210,200,0.12)] transition-all duration-300"
                  data-testid={`card-service-${s.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center icon-glow group-hover:bg-primary/20 transition-colors">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-tight">{s.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity -mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section
          className="py-16 border-y border-primary/10 relative overflow-hidden"
          aria-label="Call to action"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.05) 0%, rgba(0,0,0,0) 60%, rgba(0,130,180,0.05) 100%)" }}
        >
          <div className="absolute inset-0 circuit-bg opacity-60 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">uBreak i Fix</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Φέρε τη συσκευή σου ή επικοινώνησε μαζί μας για δωρεάν αξιολόγηση — χωρίς δεσμεύσεις.
            </p>
            <Link href="/services">
              <Button
                size="lg"
                className="h-12 px-10 font-semibold border-0"
                style={{
                  background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                  boxShadow: "0 0 24px rgba(0,210,200,0.3)",
                }}
                data-testid="button-cta-services"
              >
                Δες τις Υπηρεσίες
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="min-h-[24rem] border-t border-white/6" aria-hidden>
              <span className="sr-only">Φόρτωση περιεχομένου…</span>
            </div>
          }
        >
          <HomeBelowFold />
        </Suspense>
      </main>
    </div>
  );
}
