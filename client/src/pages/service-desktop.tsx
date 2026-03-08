import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Shield, Clock, Wrench, ChevronRight, Phone,
  Monitor, HardDrive, Cpu, Zap, ArrowRight, MemoryStick, Gamepad2,
  RefreshCw, Bug,
} from "lucide-react";
import { Link } from "wouter";
import { DESKTOP_BRANDS } from "@/data/desktop-brands";

const COMMON_REPAIRS = [
  { icon: MemoryStick, label: "Αναβάθμιση RAM",       desc: "DDR3 / DDR4 / DDR5 — ταχύτητα & απόδοση" },
  { icon: HardDrive,   label: "Αναβάθμιση SSD/HDD",   desc: "NVMe M.2 · SATA — cloning δεδομένων" },
  { icon: Zap,         label: "Τροφοδοτικό (PSU)",     desc: "Αντικατάσταση — 80+ Gold/Bronze" },
  { icon: Cpu,         label: "Thermal Paste CPU/GPU",  desc: "Καθαρισμός, αντικατάσταση πάστας" },
  { icon: RefreshCw,   label: "Εγκατάσταση OS",        desc: "Windows 10/11 · macOS · Linux" },
  { icon: Bug,         label: "Αφαίρεση Ιών",           desc: "Malware removal, προστασία" },
  { icon: Monitor,     label: "Αλλαγή Οθόνης iMac",   desc: "iMac 21.5\" · 24\" — display replacement" },
  { icon: Gamepad2,    label: "Επισκευή GPU",           desc: "Reballing, re-soldering, gaming" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή & Αναβάθμιση Desktop — Dell, HP, Lenovo, iMac, Custom PC",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
    "telephone": "+306981882005",
    "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
  },
  "description": "Επισκευή & αναβάθμιση desktop υπολογιστών στην Αθήνα. Dell, HP, Lenovo, Apple iMac, Custom/Gaming PC. Αναβάθμιση RAM/SSD, τροφοδοτικό, thermal paste, εγκατάσταση Windows, αφαίρεση ιών. Γραπτή εγγύηση.",
  "serviceType": "Επισκευή Desktop",
  "areaServed": "Αθήνα",
};

export default function ServiceDesktop() {
  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή & Αναβάθμιση Υπολογιστή — Dell, HP, Lenovo, iMac | HiTech Doctor Αθήνα"
        description="Επισκευή & αναβάθμιση desktop υπολογιστών στην Αθήνα. Dell, HP, Lenovo, iMac, Custom PC. RAM/SSD, τροφοδοτικό, εγκατάσταση Windows, αφαίρεση ιών. Γραπτή εγγύηση."
        url="https://hitechdoctor.com/services/episkeui-desktop"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="επισκευή υπολογιστή Αθήνα, αναβάθμιση PC, επισκευή iMac, αναβάθμιση RAM SSD, εγκατάσταση Windows, αφαίρεση ιών, gaming PC Αθήνα, επισκευή Dell HP Lenovo" />
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-desktop" />
      </Helmet>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Επισκευή Υπολογιστή</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">HiTech Doctor Αθήνα</p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-tight">
                    Επισκευή & Αναβάθμιση Υπολογιστή
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mb-5">
                Εξειδικευμένη επισκευή desktop υπολογιστών στην Αθήνα για <strong className="text-foreground">Dell, HP, Lenovo, Apple iMac και Custom/Gaming PC</strong>.
                Αναβάθμιση RAM & SSD, αντικατάσταση τροφοδοτικού, thermal paste CPU/GPU, εγκατάσταση Windows/macOS, αφαίρεση ιών.
                <strong className="text-foreground"> Γραπτή εγγύηση</strong>, δωρεάν διάγνωση.
              </p>
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { icon: Shield,       text: "Γραπτή Εγγύηση" },
                  { icon: Clock,        text: "Γρήγορη Εξυπηρέτηση" },
                  { icon: Wrench,       text: "Δωρεάν Διάγνωση" },
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
                <Link href="/services">
                  <Button variant="outline" className="h-10 px-5 font-semibold text-sm border-white/15 hover:border-primary/40">
                    Όλες οι Υπηρεσίες <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick services */}
            <div className="w-full lg:w-72 shrink-0 grid grid-cols-2 gap-2.5">
              {COMMON_REPAIRS.map((r) => (
                <div key={r.label} className="p-3 rounded-xl border border-white/10 bg-card hover:border-primary/20 transition-colors">
                  <r.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs font-bold text-foreground leading-tight">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand cards */}
        <section className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-display font-bold text-foreground">Επισκευή ανά Μάρκα</h2>
            <span className="text-xs text-muted-foreground">{DESKTOP_BRANDS.length} κατηγορίες</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESKTOP_BRANDS.map((brand) => (
              <Link key={brand.slug} href={`/episkevi-desktop/${brand.slug}`}>
                <article
                  className={`group relative flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${brand.accentClass} hover:border-opacity-60`}
                  data-testid={`card-brand-${brand.slug}`}
                >
                  {brand.tag && (
                    <Badge className="absolute top-4 right-4 bg-primary text-black text-[9px] font-bold px-1.5 py-0.5">
                      {brand.tag}
                    </Badge>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors pr-12">
                      {brand.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">{brand.seriesLabel}</p>
                  </div>

                  {/* Key prices */}
                  <div className="grid grid-cols-3 gap-2">
                    {brand.screenPriceFrom ? (
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Οθόνη από</p>
                        <p className="text-sm font-extrabold text-primary">€{brand.screenPriceFrom}</p>
                      </div>
                    ) : (
                      <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Τροφοδοτικό</p>
                        <p className="text-sm font-extrabold text-primary">€{brand.psuFrom}+</p>
                      </div>
                    )}
                    <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[9px] text-muted-foreground mb-0.5">RAM/SSD</p>
                      <p className="text-sm font-extrabold text-primary">€{brand.ramUpgradeFrom}+</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[9px] text-muted-foreground mb-0.5">OS Εγκ/ση</p>
                      <p className="text-sm font-extrabold text-primary">€{brand.osInstallFrom}</p>
                    </div>
                  </div>

                  {brand.notes && (
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{brand.notes}</p>
                  )}

                  <Button size="sm" className="mt-auto w-full h-8 text-xs font-semibold border-0 group-hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                    data-testid={`button-brand-${brand.slug}`}>
                    Δείτε Τιμές <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section className="border-t border-white/8 bg-card/40">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">Γιατί να Επιλέξετε Εμάς;</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Shield,       title: "Γνήσια Ανταλλακτικά", desc: "OEM και premium ανταλλακτικά για κάθε μάρκα υπολογιστή. Χωρίς no-name εξαρτήματα." },
                { icon: Clock,        title: "Γρήγορη Εξυπηρέτηση", desc: "Αναβαθμίσεις RAM/SSD: αυθημερόν. Επισκευές λογισμικού (Windows): 1-2 ώρες." },
                { icon: CheckCircle2, title: "Γραπτή Εγγύηση",      desc: "Κάθε εργασία καλύπτεται από γραπτή εγγύηση για πλήρη σιγουριά." },
                { icon: Wrench,       title: "Δωρεάν Διάγνωση",     desc: "Πλήρης τεχνικός έλεγχος hardware & software χωρίς χρέωση — πληρώνετε μόνο αν επισκευαστεί." },
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
