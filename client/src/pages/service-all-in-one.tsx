import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Seo } from "@/components/seo";
import { TikTokEmbed } from "@/components/tiktok-embed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Building2,
  ChevronRight,
  Phone,
  ArrowRight,
  Shield,
  Clock,
  Wrench,
  CircuitBoard,
  Zap,
  HardDrive,
  MemoryStick,
  Thermometer,
  Stethoscope,
  Handshake,
  FileText,
  CheckCircle2,
} from "lucide-react";

const CANONICAL = "https://hitechdoctor.com/services/episkeui-all-in-one";
const TIKTOK_URL = "https://vm.tiktok.com/ZN86rgNj4/";

const DELL_AIO_MODELS = [
  { series: "OptiPlex 7480 AIO", note: "27\" · Intel 10η/11η γενιά · επαγγελματική σειρά" },
  { series: "OptiPlex 5480 AIO", note: "23.8\" · compact AIO για γραφείο & POS" },
  { series: "OptiPlex 3000 AIO", note: "Νεότερη σειρά · DDR4/DDR5 · NVMe ready" },
  { series: "OptiPlex 5270 / 7470", note: "Legacy enterprise · εξακολουθούν σε χρήση" },
];

const OTHER_BRANDS = [
  "HP EliteOne / ProOne AIO",
  "Lenovo ThinkCentre AIO",
  "Apple iMac 21.5\" & 27\"",
  "Fujitsu Esprimo AIO",
  "ASUS ExpertCenter AIO",
];

const REPAIR_SERVICES = [
  {
    icon: CircuitBoard,
    title: "Επισκευή Μητρικής Πλακέτας & Τροφοδοσίας",
    desc: "Διάγνωση βραχυκυκλωμάτων, αντικατάσταση PSU module, repair power board σε integrated AIO chassis.",
  },
  {
    icon: Monitor,
    title: "Αλλαγή / Επισκευή Οθόνης & Touch Panel",
    desc: "Panel replacement, digitizer & touch layer — iMac, Dell AIO, HP EliteOne με εξειδικευμένα εργαλεία.",
  },
  {
    icon: HardDrive,
    title: "Αναβάθμιση SSD & RAM (Speed Boost)",
    desc: "NVMe M.2 / SATA SSD, DDR4/DDR5 RAM — άμεση βελτίωση απόδοσης χωρίς αλλαγή μηχανήματος.",
  },
  {
    icon: Thermometer,
    title: "Συντήρηση / Καθαρισμός Ψύξης & Thermal Paste",
    desc: "Αποσυναρμολόγηση AIO, καθαρισμός heatsink/fan, νέα thermal paste — μείωση θορύβου & υπερθέρμανσης.",
  },
  {
    icon: Stethoscope,
    title: "Διάγνωση & Παραλαβή με Προτεραιότητα",
    desc: "Express B2B queue για επιχειρήσεις — on-site pickup, τιμολόγιο, αναφορά κατάστασης μετά τη διάγνωση.",
  },
];

const B2B_PERKS = [
  "Τιμολόγιο & εταιρική τιμολόγηση",
  "Προτεραιότητα στη ροή εργαστηρίου",
  "Πολλαπλές συσκευές / fleet service",
  "Γραπτή εγγύηση εργασίας",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Επισκευή All-in-One PC — B2B & Επαγγελματίες",
  url: CANONICAL,
  description:
    "Εξειδικευμένη επισκευή & αναβάθμιση All-in-One PC για επιχειρήσεις. Dell OptiPlex AIO, HP EliteOne, Lenovo, Apple iMac. Τιμολόγιο, προτεραιότητα service.",
  provider: {
    "@type": "LocalBusiness",
    name: "HiTech Doctor",
    telephone: "+306981882005",
    url: "https://hitechdoctor.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Μοσχάτο",
      addressRegion: "Αττική",
      addressCountry: "GR",
    },
  },
  areaServed: ["Αθήνα", "Αττική", "Ελλάδα"],
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Επιχειρήσεις & επαγγελματίες",
  },
};

export default function ServiceAllInOne() {
  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή All-in-One Υπολογιστών (B2B & Επαγγελματίες)"
        description="Εξειδικευμένο service All-in-One PC για επιχειρήσεις. Dell OptiPlex AIO, HP, Lenovo, iMac. Επισκευή οθόνης, μητρικής, αναβάθμιση SSD/RAM, τιμολόγιο."
        url={CANONICAL}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="keywords"
          content="επισκευή all in one, Dell OptiPlex AIO, HP EliteOne επισκευή, επισκευή iMac επιχείρηση, B2B service PC, αναβάθμιση AIO SSD"
        />
        <link rel="canonical" href={CANONICAL} />
      </Helmet>

      <div
        className="pointer-events-none fixed left-0 top-0 h-[560px] w-[560px] -translate-x-1/3 -translate-y-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 h-[480px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.05) 0%, transparent 70%)" }}
      />

      <Navbar />

      <main>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pb-0 pt-4">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary">
              Αρχική
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href="/services" className="transition-colors hover:text-primary">
              Υπηρεσίες
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="font-medium text-indigo-400">All-in-One PC (B2B)</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-card/80 to-background p-6 sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <Badge
                  variant="outline"
                  className="mb-4 border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-indigo-300"
                >
                  <Building2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Εταιρική Υποστήριξη & Τιμολόγιο
                </Badge>
                <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
                  Επισκευή & Αναβάθμιση{" "}
                  <span className="text-indigo-400">All-in-One PC</span>
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Εξειδικευμένο Service για{" "}
                  <strong className="text-foreground">Επαγγελματίες & Επιχειρήσεις</strong> — Dell OptiPlex
                  AIO, HP EliteOne, Lenovo ThinkCentre AIO, Apple iMac και όλα τα επαγγελματικά All-in-One
                  συστήματα της αγοράς.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { icon: Shield, text: "Γραπτή Εγγύηση" },
                    { icon: Clock, text: "B2B Προτεραιότητα" },
                    { icon: FileText, text: "Τιμολόγιο" },
                    { icon: Wrench, text: "Δωρεάν Διάγνωση" },
                  ].map(({ icon: Icon, text }) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-400" aria-hidden />
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full shrink-0 rounded-xl border border-indigo-500/25 bg-indigo-950/30 p-5 lg:max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300/90">
                  Γρήγορη επικοινωνία B2B
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fleet πολλαπλών AIO; Καλέστε για προσφορά & παραλαβή από την επιχείρησή σας.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a href="tel:+306981882005">
                    <Button
                      className="h-11 w-full border-0 font-semibold"
                      style={{
                        background: "linear-gradient(135deg, hsl(239 84% 55%), hsl(185 100% 42%))",
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" aria-hidden />
                      6981 882 005
                    </Button>
                  </a>
                  <Link href="/epikoinonia">
                    <Button variant="outline" className="h-11 w-full border-indigo-500/30 font-semibold hover:border-indigo-400/50">
                      <Handshake className="mr-2 h-4 w-4" aria-hidden />
                      Αίτημα Προσφοράς
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dell models */}
        <section className="container mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Βασικά Μοντέλα & Συμβατότητα
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Εξειδίκευση στη σειρά{" "}
              <strong className="text-foreground">Dell OptiPlex All-in-One</strong> — με πλήρη υποστήριξη
              και για HP, Lenovo, Fujitsu, ASUS και Apple iMac.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DELL_AIO_MODELS.map((m) => (
              <div
                key={m.series}
                className="rounded-xl border border-indigo-500/15 bg-card/60 p-4 transition-colors hover:border-indigo-400/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                    <Monitor className="h-5 w-5 text-indigo-400" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{m.series}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-card/40 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Επίσης υποστηρίζουμε
            </p>
            <ul className="flex flex-wrap gap-2">
              {OTHER_BRANDS.map((brand) => (
                <li key={brand}>
                  <Badge variant="secondary" className="border border-white/10 bg-background/80 font-normal">
                    {brand}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Repair services */}
        <section className="border-y border-white/5 bg-card/30 py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Υπηρεσίες Επισκευής</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Πλήρες service All-in-One — από hardware repair έως performance upgrade.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REPAIR_SERVICES.map(({ icon: Icon, title, desc }) => (
                <article
                  key={title}
                  className="rounded-xl border border-white/10 bg-background/60 p-5 transition-colors hover:border-indigo-500/25"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Icon className="h-5 w-5 text-indigo-400" aria-hidden />
                  </div>
                  <h3 className="font-semibold leading-snug text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* B2B perks */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Γιατί B2B με το HiTech Doctor;</h2>
              <ul className="mt-5 space-y-3">
                {B2B_PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <MemoryStick className="h-8 w-8 text-indigo-400/60" aria-hidden />
                <Zap className="h-8 w-8 text-indigo-400/60" aria-hidden />
                <HardDrive className="h-8 w-8 text-indigo-400/60" aria-hidden />
              </div>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6">
              <h3 className="font-display text-lg font-bold text-foreground">Enterprise All-in-One Fleet;</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Γραφεία, κλινικές, σχολές και retail chains με δεκάδες AIO — οργανώνουμε μαζική παραλαβή,
                ενιαία τιμολόγηση και priority turnaround στο εργαστήριό μας στο Μοσχάτο.
              </p>
              <Link href="/epikoinonia" className="mt-4 inline-block">
                <Button variant="outline" className="border-indigo-500/30">
                  Ζητήστε εταιρική προσφορά <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* TikTok */}
        <section className="border-t border-white/5 bg-card/20 py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-pink-500/30 bg-pink-500/10 text-pink-300">
                TikTok · Εργαστήριο
              </Badge>
              <h2 className="font-display text-2xl font-bold text-foreground">Δείτε την επισκευή live</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Δείτε το βίντεο από το εργαστήριό μας κατά τη διάρκεια επισκευής All-in-One PC!
              </p>
            </div>
            <div className="mt-8 flex justify-center px-2">
              <TikTokEmbed url={TIKTOK_URL} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/50 to-background p-8 text-center sm:p-10">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ζητήστε προσφορά για την επιχείρησή σας
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Καλέστε για άμεση εκτίμηση ή στείλτε αίτημα — απαντάμε εντός εργάσιμων ωρών με κοστολόγηση
              και χρόνο παράδοσης.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href="tel:+306981882005">
                <Button
                  size="lg"
                  className="h-12 border-0 px-8 font-semibold"
                  style={{
                    background: "linear-gradient(135deg, hsl(239 84% 55%), hsl(185 100% 42%))",
                  }}
                >
                  <Phone className="mr-2 h-4 w-4" aria-hidden />
                  Κλήση τώρα
                </Button>
              </a>
              <Link href="/epikoinonia">
                <Button size="lg" variant="outline" className="h-12 border-indigo-500/30 px-8 font-semibold">
                  Φόρμα επικοινωνίας
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
