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
  Droplets,
  Camera,
  ChevronRight,
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

const quickRepairDevices = [
  { icon: Smartphone, label: "iPhone", href: "/services/episkeui-iphone", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/25" },
  { icon: Smartphone, label: "Samsung", href: "/services/episkeui-samsung", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/25" },
  { icon: Laptop, label: "Laptop", href: "/services/episkeui-laptop", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
  { icon: Tablet, label: "Tablet", href: "/services/episkeui-tablet", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
  { icon: Monitor, label: "Desktop", href: "/services/episkeui-desktop", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
];

const serviceCards = [
  { icon: ScanLine, label: "Αλλαγή Οθόνης", href: "/services/episkeui-kiniton", color: "text-primary", bg: "bg-primary/10 border-primary/25" },
  { icon: Battery, label: "Αλλαγή Μπαταρίας", href: "/services#allagi-batarias", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
  { icon: Droplets, label: "Βρεγμένο Κινητό", href: "/services/episkeui-kiniton", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/25" },
  { icon: Camera, label: "Επισκευή Κάμερας", href: "/services/episkeui-kiniton", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
  { icon: HardDrive, label: "Ανάκτηση Δεδομένων", href: "/services#anaktisi-dedomenon", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/25" },
  { icon: Wrench, label: "Διαγνωστικός Έλεγχος", href: "/services#diagnostiko", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
];

/** LCP: μικρότερο αρχείο σε mobile, μεγαλύτερο σε desktop — ίδιο photo id */
const HERO_IMG_MOBILE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=75&w=720";
const HERO_IMG_DESKTOP =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=900";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Seo
        title="Αρχική"
        description="Ο τεχνολογικός σας γιατρός. Επισκευές κινητών, tablet, laptop, IT Support και αγορά αξεσουάρ στο Αθήνα."
        url="https://hitechdoctor.com"
      />
      <Helmet>
        <meta name="keywords" content="επισκευή κινητών Αθήνα, IT support, επισκευή laptop, επισκευή tablet, ανάκτηση δεδομένων, HiTech Doctor" />
        <link rel="canonical" href="https://hitechdoctor.com" />
        <link rel="preload" as="image" href={HERO_IMG_MOBILE} fetchPriority="high" />
      </Helmet>

      {/* Light ambient (no busy circuit pattern behind hero text) */}
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
        {/* ── Promo hero: καθαρό banner, υψηλή αναγνωσιμότητα — χωρίς βίντεο / χαοτικό φόντο πίσω από CTAs ── */}
        <section className="container mx-auto px-4 pt-8 pb-10 lg:pt-12 lg:pb-14" aria-label="HiTech Doctor">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-3xl">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-background/95 to-background"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(0,210,200,0.14),transparent_55%)]"
              aria-hidden
            />

            <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
              <div className="order-1 flex w-full max-w-xl flex-col gap-5">
                <Badge
                  variant="outline"
                  className="w-fit border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  HiTech Doctor — Αθήνα
                </Badge>

                <div>
                  <h1 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Επαγγελματικές επισκευές &amp; τεχνική υποστήριξη
                  </h1>
                  <p className="mt-3 text-base font-medium text-primary/95 sm:text-lg">
                    Κινητά, tablet, laptop &amp; desktop — γρήγορα, με γραπτή εγγύηση.
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Στο HiTech Doctor συνδυάζουμε εξειδίκευση σε επισκευές Apple &amp; Android με IT support και ένα προσεγμένο eShop αξεσουάρ. Ένα σημείο για όλες τις ανάγκες της συσκευής σας.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/services">
                    <Button
                      size="lg"
                      className="h-12 min-w-[200px] px-8 text-base font-semibold shadow-[0_0_28px_rgba(0,210,200,0.28)] border-0"
                      style={{
                        background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                      }}
                      data-testid="button-hero-services"
                    >
                      Οι υπηρεσίες μας
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link
                    href="/eshop"
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary/25 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    data-testid="button-hero-eshop"
                  >
                    eShop
                  </Link>
                </div>

                <button
                  type="button"
                  className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  onClick={() => requestOpenRepairChat()}
                  data-testid="button-hero-ai-chat"
                >
                  <Bot className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Ρώτα τον AI βοηθό
                </button>

                <div className="flex flex-wrap gap-3 pt-1">
                  {["Γρήγορη επισκευή", "Γραπτή εγγύηση", "Γνήσια ανταλλακτικά"].map((b) => (
                    <span key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-2 w-full lg:order-2">
                <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:ml-auto lg:mr-0">
                  <div className="relative aspect-[4/3] max-h-[min(42vh,280px)] w-full sm:max-h-[min(44vh,320px)] lg:max-h-[340px]">
                    <img
                      src={HERO_IMG_MOBILE}
                      srcSet={`${HERO_IMG_MOBILE} 720w, ${HERO_IMG_DESKTOP} 900w`}
                      sizes="(max-width: 1023px) min(100vw, 36rem), 520px"
                      alt="Επαγγελματική επισκευή τεχνολογίας — εργαστήριο HiTech Doctor"
                      className="h-full w-full object-cover"
                      width={900}
                      height={675}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/88 to-background/35" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-background/95 px-3 py-2 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-auto">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                        <Wrench className="h-4 w-4 text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">Express επισκευή</p>
                        <p className="text-[11px] text-muted-foreground">Αποτέλεσμα σε ώρες</p>
                      </div>
                    </div>
                  </div>
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

        {/* ── AI Doctor Card ── */}
        <section className="container mx-auto px-4 pt-10 pb-2" aria-label="AI Διάγνωση Βλάβης">
          <button
            type="button"
            onClick={() => requestOpenRepairChat()}
            className="w-full group relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, hsl(185 100% 12% / 0.9) 0%, hsl(240 30% 8% / 0.95) 100%)",
              boxShadow: "0 0 0 1px rgba(0,210,200,0.2), 0 8px 40px rgba(0,210,200,0.12)",
            }}
            data-testid="card-ai-diagnosis"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-20 -translate-y-1/2 translate-x-1/4"
              style={{ background: "radial-gradient(circle, rgba(0,210,200,0.6) 0%, transparent 70%)" }} />
            <div className="relative flex items-center gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.4)" }}>
                <Bot className="w-8 h-8 text-white" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Doctor</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                  Διάγνωση Βλάβης με AI
                </h2>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">
                  Περίγραψε το πρόβλημα — λαμβάνεις εκτίμηση κόστους & χρόνου επισκευής σε δευτερόλεπτα.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden />
            </div>
          </button>
        </section>

        {/* ── Quick Repair — Device Picker ── */}
        <section className="container mx-auto px-4 pt-8 pb-2" aria-label="Άμεση Επισκευή">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Άμεση Επισκευή</h2>
            <Link href="/services">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                Όλες <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {quickRepairDevices.map((d) => (
              <Link key={d.label} href={d.href}>
                <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border cursor-pointer min-w-[80px] hover:-translate-y-0.5 transition-transform ${d.bg}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${d.bg}`}>
                    <d.icon className={`w-7 h-7 ${d.color}`} aria-hidden />
                  </div>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">{d.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Service Cards ── */}
        <section className="container mx-auto px-4 pt-6 pb-2" aria-label="Κατηγορίες Επισκευών">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Τι Επισκευάζουμε</h2>
            <Link href="/services">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                Όλες <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {serviceCards.map((s) => (
              <Link key={s.label} href={s.href}>
                <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${s.bg}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} aria-hidden />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{s.label}</span>
                </div>
              </Link>
            ))}
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
          className="relative overflow-hidden border-y border-primary/10 py-16"
          aria-label="Call to action"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(0,0,0,0) 55%, rgba(0,130,180,0.06) 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-background/80" aria-hidden />
          <div className="container relative mx-auto px-4 text-center">
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
