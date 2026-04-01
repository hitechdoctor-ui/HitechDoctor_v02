import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  CheckCircle2, Shield, Clock, Wrench, ChevronRight, Phone,
  Watch, Battery, Info, AlertTriangle, ArrowRight, Star, XCircle,
} from "lucide-react";
import { APPLE_WATCH_MODELS } from "@/data/apple-watch-models";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Επισκευή Apple Watch — Αντικατάσταση Touch & Μπαταρία",
  "provider": {
    "@type": "LocalBusiness",
    "name": "HiTech Doctor",
    "url": "https://hitechdoctor.com",
    "telephone": "+306981882005",
    "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
  },
  "description": "Επισκευή Apple Watch στην Αθήνα. Αντικατάσταση touch (εξωτερικό τζάμι) από €80 και αλλαγή μπαταρίας από €40. Series 3 έως Ultra 2. Γραπτή εγγύηση.",
  "serviceType": "Επισκευή Apple Watch",
  "areaServed": "Αθήνα",
  "offers": APPLE_WATCH_MODELS.map((m) => ({
    "@type": "Offer",
    "name": `Αντικατάσταση Touch ${m.name}`,
    "price": m.touchPriceFrom,
    "priceCurrency": "EUR",
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
    { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
    { "@type": "ListItem", "position": 3, "name": "Επισκευή Apple Watch", "item": "https://hitechdoctor.com/services/episkeui-apple-watch" },
  ],
};

export default function ServiceAppleWatch() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Επισκευή Apple Watch Αθήνα — Αντικατάσταση Touch & Μπαταρία από €40 | HiTech Doctor"
        description="Επισκευή Apple Watch στην Αθήνα. Αντικατάσταση touch (εξωτερικό τζάμι) από €80 και αλλαγή μπαταρίας από €40. Series 3 έως Ultra 2. Γραπτή εγγύηση."
        url="https://hitechdoctor.com/services/episkeui-apple-watch"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <link rel="canonical" href="https://hitechdoctor.com/services/episkeui-apple-watch" />
        <meta name="keywords" content="επισκευή apple watch αθήνα, αλλαγή touch apple watch, αλλαγή μπαταρία apple watch, αντικατάσταση τζάμι apple watch, apple watch series 9 10 ultra επισκευή" />
      </Helmet>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.06) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">Επισκευή Apple Watch</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Watch className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">HiTech Doctor Αθήνα</p>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-tight">
                    Επισκευή Apple Watch
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mb-4">
                Εξειδικευμένη επισκευή Apple Watch στην Αθήνα — από <strong className="text-foreground">Series 3 έως Ultra 2</strong>.
                Αντικατάσταση <strong className="text-foreground">touch (εξωτερικό τζάμι)</strong> και <strong className="text-foreground">αλλαγή μπαταρίας</strong> με γραπτή εγγύηση.
              </p>

              {/* Important notice */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 mb-5">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-300 mb-1">Σημαντική ενημέρωση για τις επισκευές μας</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 text-xs text-amber-200/80">
                        <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                        Πραγματοποιούμε <strong className="text-amber-200">αντικατάσταση touch</strong> (εξωτερικό γυάλινο τζάμι)
                      </li>
                      <li className="flex items-center gap-2 text-xs text-amber-200/80">
                        <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                        <strong className="text-amber-200">Δεν</strong> πραγματοποιούμε αντικατάσταση εσωτερικής OLED/LCD οθόνης
                      </li>
                      <li className="flex items-center gap-2 text-xs text-amber-200/80">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        Οι τιμές είναι <strong className="text-amber-200">ενδεικτικές — ξεκινούν από</strong> το αναφερόμενο ποσό. Η τελική τιμή εξαρτάται από το μοντέλο και την κατάσταση της συσκευής.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

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
                <Button onClick={() => setModalOpen(true)} className="h-10 px-5 font-semibold border-0 text-sm"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                  data-testid="button-hero-book">
                  <Wrench className="w-4 h-4 mr-2" />Αίτημα Επισκευής
                </Button>
                <a href="tel:+306981882005">
                  <Button variant="outline" className="h-10 px-5 font-semibold text-sm border-white/15 hover:border-primary/40"
                    data-testid="button-hero-call">
                    <Phone className="w-4 h-4 mr-2" />6981 882 005
                  </Button>
                </a>
              </div>
            </div>

            {/* Service summary cards */}
            <div className="w-full lg:w-64 shrink-0 space-y-3">
              <div className="p-5 rounded-2xl border border-primary/30 bg-primary/8 shadow-[0_0_20px_rgba(0,210,200,0.08)]">
                <Watch className="w-6 h-6 text-primary mb-3" />
                <p className="text-sm font-bold text-foreground mb-1">Αντικατάσταση Touch</p>
                <p className="text-xs text-muted-foreground mb-3">Εξωτερικό γυάλινο τζάμι — όχι OLED panel</p>
                <p className="text-3xl font-extrabold text-primary">
                  από €80
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">ενδεικτική τιμή εκκίνησης · συμπ. ΦΠΑ</p>
              </div>
              <div className="p-5 rounded-2xl border border-white/10 bg-card">
                <Battery className="w-6 h-6 text-primary mb-3" />
                <p className="text-sm font-bold text-foreground mb-1">Αλλαγή Μπαταρίας</p>
                <p className="text-xs text-muted-foreground mb-3">Premium αντικατάσταση μπαταρίας Apple Watch</p>
                <p className="text-3xl font-extrabold text-foreground">
                  από €40
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">ενδεικτική τιμή εκκίνησης · συμπ. ΦΠΑ</p>
              </div>
            </div>
          </div>
        </section>

        {/* Price table */}
        <section className="container mx-auto px-4 pb-12 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-display font-bold text-foreground">Τιμοκατάλογος ανά Μοντέλο</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Ταξινόμηση από το νεότερο / πιο ακριβό μοντέλο προς το παλαιότερο.
            Οι τιμές είναι <strong className="text-foreground">ενδεικτικές και αποτελούν το κατώτατο όριο</strong> — η τελική τιμή επιβεβαιώνεται μετά την αξιολόγηση.
          </p>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Μοντέλο</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Έτος</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Μέγεθος</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary">Touch από</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Μπαταρία από</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {APPLE_WATCH_MODELS.map((model, i) => (
                  <tr key={model.slug}
                    className={`border-b border-white/5 transition-colors hover:bg-white/3 ${i === 0 ? "bg-primary/5" : ""}`}
                    data-testid={`row-watch-${model.slug}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Watch className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{model.name}</p>
                          <p className="text-[10px] text-muted-foreground">{model.note}</p>
                        </div>
                        {model.tag && (
                          <Badge className="ml-1 text-[9px] font-bold px-1.5 py-0.5 bg-primary text-black shrink-0">{model.tag}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-muted-foreground">{model.year}</td>
                    <td className="px-4 py-4 text-center text-sm text-muted-foreground">{model.sizes}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-extrabold text-primary">€{model.touchPriceFrom}</span>
                      <span className="text-xs text-muted-foreground">+</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-bold text-foreground">€{model.batteryPriceFrom}</span>
                      <span className="text-xs text-muted-foreground">+</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button onClick={() => setModalOpen(true)} size="sm"
                        className="h-8 px-4 text-xs font-semibold border-0"
                        style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                        data-testid={`button-book-${model.slug}`}>
                        Ραντεβού
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {APPLE_WATCH_MODELS.map((model) => (
              <div key={model.slug}
                className="p-4 rounded-xl border border-white/10 bg-card"
                data-testid={`card-watch-mobile-${model.slug}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{model.name}</p>
                      {model.tag && <Badge className="text-[9px] font-bold px-1.5 py-0.5 bg-primary text-black">{model.tag}</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{model.year} · {model.sizes}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg border border-primary/20 bg-primary/8 text-center">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Touch από</p>
                    <p className="text-xl font-extrabold text-primary">€{model.touchPriceFrom}<span className="text-sm">+</span></p>
                  </div>
                  <div className="p-2 rounded-lg border border-white/10 bg-white/3 text-center">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Μπαταρία από</p>
                    <p className="text-xl font-extrabold text-foreground">€{model.batteryPriceFrom}<span className="text-sm">+</span></p>
                  </div>
                </div>
                <Button onClick={() => setModalOpen(true)} size="sm" className="w-full h-9 text-xs font-semibold border-0"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                  data-testid={`button-book-mobile-${model.slug}`}>
                  <Wrench className="w-3.5 h-3.5 mr-1.5" />Κλείσε Ραντεβού
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg border border-white/8 bg-white/3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Οι τιμές <strong className="text-foreground">ξεκινούν από</strong> το αναγραφόμενο ποσό και <strong className="text-foreground">δεν είναι τελικές</strong>.
              Η τελική τιμή επιβεβαιώνεται μετά την αξιολόγηση της συσκευής από τον τεχνικό. Δωρεάν έλεγχος χωρίς δέσμευση επισκευής.
            </p>
          </div>
        </section>

        {/* Touch vs Screen explanation */}
        <section className="border-t border-white/8 bg-card/40">
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Touch vs Οθόνη — Ποια είναι η διαφορά;</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Πολλοί πελάτες μπερδεύουν το εξωτερικό τζάμι (touch) με την εσωτερική OLED οθόνη.
              Είναι σημαντικό να καταλάβετε τη διαφορά πριν από την επισκευή.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-primary/25 bg-primary/8">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <p className="font-display font-bold text-base text-foreground">Αντικατάσταση Touch — Κάνουμε</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Το <strong className="text-foreground">εξωτερικό γυάλινο τζάμι</strong> (digitizer/touch glass) είναι το διαφανές τμήμα που καλύπτει την οθόνη.
                  Σπάει συχνά από πτώσεις. Η αντικατάστασή του είναι εφικτή και αποκαθιστά την αφή και την εμφάνιση.
                </p>
                <ul className="space-y-1.5">
                  {["Σπασμένο εξωτερικό τζάμι", "Χαρακιές στο γυαλί", "Δυσλειτουργία αφής από σπασμένο τζάμι", "Η οθόνη λειτουργεί κανονικά"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />{i}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-2 rounded-lg bg-primary/15 text-center">
                  <p className="text-xl font-extrabold text-primary">από €80<span className="text-sm font-normal text-muted-foreground ml-1">(ενδεικτικά)</span></p>
                </div>
              </div>
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="font-display font-bold text-base text-foreground">Αντικατάσταση OLED — Δεν κάνουμε</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Η <strong className="text-foreground">εσωτερική OLED/LCD οθόνη</strong> (display panel) βρίσκεται κάτω από το τζάμι.
                  Αν έχετε κηλίδες, νεκρά pixels ή μαύρη οθόνη, πρόκειται για βλάβη panel — επισκευή που δεν πραγματοποιούμε.
                </p>
                <ul className="space-y-1.5">
                  {["Κηλίδες ή χρωματισμοί στην οθόνη", "Νεκρά pixels", "Μαύρη οθόνη (backlight/panel)", "Οθόνη που δεν ανάβει καθόλου"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0" />{i}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-xs text-red-300 font-semibold">Δεν παρέχουμε αυτή την υπηρεσία</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Battery section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Αλλαγή Μπαταρίας Apple Watch</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            Η μπαταρία του Apple Watch υποβαθμίζεται με τον καιρό. Αν το ρολόι σας δεν κρατάει όλη μέρα,
            η αλλαγή μπαταρίας είναι η πιο οικονομική λύση — <strong className="text-foreground">από €40</strong> (τιμή εκκίνησης).
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Battery,      title: "Premium Μπαταρία",   desc: "Αντικατάσταση με μπαταρία ίδιας χωρητικότητας — διάρκεια εφάμιλλη της γνήσιας." },
              { icon: Shield,       title: "Γραπτή Εγγύηση",     desc: "Εγγύηση επί της μπαταρίας και της εργασίας — γραπτώς." },
              { icon: Clock,        title: "Σχετικά Γρήγορα",    desc: "Η αλλαγή μπαταρίας Apple Watch απαιτεί αποσυναρμολόγηση — παράδοση εντός ημέρας ή 24ωρών." },
            ].map((b) => (
              <div key={b.title} className="p-4 rounded-xl border border-white/10 bg-card">
                <b.icon className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm font-bold text-foreground mb-1">{b.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/8 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Η τιμή αλλαγής μπαταρίας <strong className="text-amber-200">ξεκινά από €40</strong> και η τελική τιμή εξαρτάται από το μοντέλο Apple Watch.
              Τα Ultra μοντέλα και νεότερα Series έχουν υψηλότερο κόστος λόγω πολυπλοκότητας αποσυναρμολόγησης.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/8 bg-card/40">
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">Συχνές Ερωτήσεις</h2>
            <div className="space-y-3 max-w-3xl">
              {[
                { q: "Κάνετε αντικατάσταση της οθόνης Apple Watch;", a: "Όχι — πραγματοποιούμε αποκλειστικά αντικατάσταση του εξωτερικού γυάλινου τζαμιού (touch/digitizer) και αλλαγή μπαταρίας. Δεν αντικαθιστούμε εσωτερική OLED/LCD οθόνη (display panel)." },
                { q: "Ποια είναι η τιμή αντικατάστασης touch Apple Watch;", a: "Η αντικατάσταση touch ξεκινά από €80 — αυτή είναι η ελάχιστη, ενδεικτική τιμή εκκίνησης, ΟΧΙ η τελική. Η τελική τιμή εξαρτάται από το μοντέλο και επιβεβαιώνεται μετά την αξιολόγηση." },
                { q: "Πόσο κοστίζει η αλλαγή μπαταρίας Apple Watch;", a: "Η αλλαγή μπαταρίας ξεκινά από €40 (ελάχιστη ενδεικτική τιμή). Για νεότερα μοντέλα (Ultra, Series 9/10) η τιμή είναι υψηλότερη λόγω πολυπλοκότερης αποσυναρμολόγησης." },
                { q: "Πόσο χρόνο κάνει η επισκευή;", a: "Αντικατάσταση touch: συνήθως εντός ημέρας. Αλλαγή μπαταρίας: εντός ημέρας ή έως 24 ώρες. Η αποσυναρμολόγηση Apple Watch απαιτεί χρόνο για σωστή εκτέλεση." },
                { q: "Επισκευάζετε όλα τα μοντέλα Apple Watch;", a: "Ναι — από Series 3 (2017) έως Ultra 2 (2024). Για κάθε μοντέλο έχουμε διαφορετική τιμολόγηση. Δείτε τον τιμοκατάλογο παραπάνω." },
                { q: "Δίνετε εγγύηση;", a: "Ναι, κάθε επισκευή καλύπτεται από γραπτή εγγύηση εργασίας και ανταλλακτικού." },
              ].map(({ q, a }) => (
                <details key={q} className="group bg-card pcb-border rounded-xl p-4 cursor-pointer" data-testid={`faq-${q.substring(0, 20).replace(/\s+/g, "-").toLowerCase()}`}>
                  <summary className="flex items-center justify-between font-display font-bold text-sm text-foreground select-none list-none">
                    {q}<ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                  </summary>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 text-center">
            <Watch className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Έτοιμοι να Επισκευάσετε το Apple Watch σας;</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
              Στείλτε μας αίτημα ή καλέστε μας για δωρεάν αξιολόγηση.
              <strong className="text-foreground"> Πληρώνετε μόνο αν συμφωνήσετε με την τελική τιμή.</strong>
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => setModalOpen(true)} className="h-11 px-8 font-semibold border-0 text-base"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.25)" }}
                data-testid="button-cta-book">
                <Wrench className="w-4 h-4 mr-2" />Αίτημα Επισκευής
              </Button>
              <a href="tel:+306981882005">
                <Button variant="outline" className="h-11 px-8 font-semibold text-base border-white/15 hover:border-primary/40"
                  data-testid="button-cta-call">
                  <Phone className="w-4 h-4 mr-2" />6981 882 005
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="border-t border-white/8 bg-card/40">
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="grid sm:grid-cols-4 gap-5">
              {[
                { icon: Shield,       title: "Γραπτή Εγγύηση",      desc: "Εγγύηση εργασίας & ανταλλακτικού σε κάθε επισκευή." },
                { icon: Clock,        title: "Γρήγορη Εξυπηρέτηση", desc: "Εκτίμηση και παράδοση εντός ημέρας για τις περισσότερες περιπτώσεις." },
                { icon: Star,         title: "Εξειδίκευση",          desc: "Πιστοποιημένοι τεχνικοί με εμπειρία σε Apple Watch." },
                { icon: CheckCircle2, title: "Διαφάνεια",            desc: "Πληρώνετε μόνο αφού συμφωνήσετε στην τελική τιμή." },
              ].map((b) => (
                <div key={b.title} className="p-4 rounded-2xl border border-white/10 bg-card">
                  <b.icon className="w-6 h-6 text-primary mb-2.5" />
                  <p className="text-sm font-bold text-foreground mb-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection />
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-primary/20 bg-background/95 backdrop-blur p-3 flex gap-2">
        <Button onClick={() => setModalOpen(true)} className="flex-1 h-11 font-semibold border-0 text-sm"
          style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
          data-testid="button-mobile-book">
          <Wrench className="w-4 h-4 mr-2" />Αίτημα Επισκευής
        </Button>
        <a href="tel:+306981882005" className="shrink-0" aria-label="Κλήση στο 6981 882 005">
          <Button variant="outline" className="h-11 px-4 border-primary/30 text-primary" data-testid="button-mobile-call">
            <Phone className="w-4 h-4" aria-hidden />
          </Button>
        </a>
      </div>

      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName="Apple Watch"
        temperedGlassOffer={false}
      />
    </div>
  );
}
