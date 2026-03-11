import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fragment } from "react";
import { WebsiteInquiryModal } from "@/components/website-inquiry-modal";
import {
  Globe, Code2, Smartphone, Zap, Search, ShoppingCart,
  ArrowRight, ExternalLink, CheckCircle2, Star, Palette,
  Monitor, Phone, Mail, ChevronRight, Layers, Shield, Gauge,
  Lock, Server,
} from "lucide-react";
import screenshotHydrofix from "@assets/Screenshot_2026-03-11_at_13.11.57_1773227593503.png";
import screenshotRegalo        from "@assets/Screenshot_2026-03-11_at_13.18.39_1773228083914.png";
import screenshotLouloudotopos from "@assets/Screenshot_2026-03-11_at_13.26.17_1773228953996.png";
import screenshotBsNaomi       from "@assets/Screenshot_2026-03-11_at_13.36.28_1773229053688.png";
import screenshotTheatreHood   from "@assets/Screenshot_2026-03-11_at_13.38.01_1773229141428.png";
import screenshotAthEcs        from "@assets/Screenshot_2026-03-11_at_13.39.32_1773229234685.png";
import screenshotNikosapost    from "@assets/Screenshot_2026-03-11_at_13.41.03_1773229304723.png";
import screenshotMetamorfosi   from "@assets/Screenshot_2026-03-11_at_13.43.59_1773229485038.png";

// ── Skills / stack ────────────────────────────────────────────────────────────
const STACK = [
  { name: "React / Next.js",    color: "text-sky-400",     desc: "SPA & SSR apps" },
  { name: "TypeScript",         color: "text-blue-400",    desc: "Type-safe code" },
  { name: "Tailwind CSS",       color: "text-primary",     desc: "Modern styling" },
  { name: "Node.js / Express",  color: "text-emerald-400", desc: "Backend APIs" },
  { name: "PostgreSQL",         color: "text-violet-400",  desc: "Databases" },
  { name: "Stripe / PayPal",    color: "text-amber-400",   desc: "Payments" },
  { name: "SEO & Performance",  color: "text-orange-400",  desc: "Core Web Vitals" },
  { name: "Figma / Design",     color: "text-pink-400",    desc: "UI/UX design" },
];

// ── What's included ───────────────────────────────────────────────────────────
const SERVICES_LIST = [
  { icon: Globe,        title: "Εταιρική Ιστοσελίδα",   desc: "Παρουσίαση επιχείρησης με SEO, φόρμες επικοινωνίας, Google Maps" },
  { icon: ShoppingCart, title: "E-Commerce Shop",        desc: "Πλήρες e-shop με καλάθι, πληρωμές, διαχείριση αποθέματος" },
  { icon: Smartphone,   title: "Mobile-First Design",    desc: "100% responsive σε κινητά, tablet και desktop" },
  { icon: Search,       title: "SEO Βελτιστοποίηση",    desc: "Schema markup, meta tags, sitemap, Google Search Console" },
  { icon: Zap,          title: "Υψηλή Ταχύτητα",        desc: "Lighthouse score 90+, CDN, lazy loading, image optimization" },
  { icon: Layers,       title: "CMS Διαχείριση",         desc: "Εύκολη ενημέρωση περιεχομένου χωρίς τεχνικές γνώσεις" },
];

// ── Pricing tiers ─────────────────────────────────────────────────────────────
const PRICING = [
  {
    name: "Starter",
    price: "€490",
    priceColor: "from-sky-400 to-cyan-300",
    period: "εφάπαξ",
    desc: "Για μικρές επιχειρήσεις και επαγγελματίες",
    features: [
      "Έως 5 σελίδες",
      "Mobile responsive",
      "Φόρμα επικοινωνίας",
      "Google Maps",
      "Βασικό SEO",
      "1 μήνας δωρεάν support",
    ],
    highlight: false,
    accent: "border-white/15",
    btnStyle: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" },
  },
  {
    name: "Business",
    price: "€990",
    priceColor: "from-primary to-emerald-400",
    period: "εφάπαξ",
    desc: "Για επιχειρήσεις που θέλουν να ξεχωρίσουν",
    features: [
      "Έως 15 σελίδες",
      "Custom design",
      "Blog / News section",
      "Advanced SEO",
      "Google Analytics 4",
      "Speed optimization",
      "3 μήνες support",
    ],
    highlight: true,
    accent: "border-primary/40",
    btnStyle: { background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 20px rgba(0,210,200,0.3)" },
  },
  {
    name: "E-Shop",
    price: "€1.490+",
    priceColor: "from-violet-400 to-purple-300",
    period: "εφάπαξ",
    desc: "Ολοκληρωμένο e-commerce solution",
    features: [
      "Απεριόριστα προϊόντα",
      "Πληρωμές Stripe/PayPal",
      "Διαχείριση αποθέματος",
      "Order tracking",
      "Admin dashboard",
      "Mobile app-ready",
      "6 μήνες support",
    ],
    highlight: false,
    accent: "border-white/15",
    btnStyle: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" },
  },
];

export default function WebDesigner() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Web Designer Αθήνα — Κατασκευή Ιστοσελίδων & E-Shop | HiTech Doctor"
        description="Κατασκευή επαγγελματικών ιστοσελίδων και e-shops στην Αθήνα. React, Next.js, SEO, Tailwind CSS. Portfolio demo — δείτε τις δουλειές μας."
        keywords="web designer αθηνα, κατασκευη ιστοσελιδας, κατασκευη eshop, react next.js, seo αθηνα, web development"
        url="https://hitechdoctor.com/web-designer"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Κατασκευή Ιστοσελίδων & E-Commerce",
          "provider": { "@type": "LocalBusiness", "name": "HiTech Doctor", "telephone": "+306981882005" },
          "areaServed": "Αθήνα",
          "description": "Web design, κατασκευή ιστοσελίδων, e-shop, SEO",
        })}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-16 lg:py-24"
        style={{ background: "linear-gradient(145deg, #080d1a 0%, #0d1530 40%, #090e1c 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-25 pointer-events-none" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,210,200,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />

        <div className="container mx-auto px-4 max-w-6xl relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/sxetika-me-mas" className="hover:text-primary transition-colors">Info</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">Web Designer</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-5 bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-3 py-1">
              <Globe className="w-3 h-3 mr-1.5" />
              Κατασκευή Ιστοσελίδων · Αθήνα
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-5">
              Δημιουργούμε{" "}
              <span style={{ background: "linear-gradient(135deg, hsl(185 100% 50%), hsl(260 80% 70%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Digital Εμπειρίες
              </span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Σχεδιάζουμε και αναπτύσσουμε επαγγελματικές ιστοσελίδες, e-shops και web applications
              με σύγχρονες τεχνολογίες. Από την ιδέα ως την on-line παρουσία — με πλήρη SEO βελτιστοποίηση.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:info@hitechdoctor.com">
                <Button
                  className="h-12 px-8 font-bold border-0 text-base"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                  data-testid="button-webdesign-contact"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Ζητήστε Προσφορά
                </Button>
              </a>
              <a href="tel:6981882005">
                <Button variant="outline" className="h-12 px-6 border-white/20 hover:border-primary/40 gap-2">
                  <Phone className="w-4 h-4" />
                  698 188 2005
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Ετήσιο Πακέτο (Annual Subscription) ─────────────────────── */}
        <div>
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-2">Ειδική Προσφορά 2026</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ετήσιο Πακέτο Παρουσίας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ό,τι χρειάζεται μια σύγχρονη ιστοσελίδα — domain, server, SSL, backup, updates — σε <strong className="text-foreground">μία ετήσια συνδρομή</strong>.
            </p>
          </div>

          <div
            className="relative rounded-3xl border border-amber-500/40 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #1a1200 0%, #120d00 50%, #0e0900 100%)", boxShadow: "0 0 50px rgba(251,191,36,0.08)" }}
            data-testid="card-annual-package"
          >
            {/* Offer ribbon */}
            <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
              <div className="absolute top-5 right-[-28px] bg-amber-500 text-black text-[9px] font-extrabold uppercase tracking-widest px-8 py-1 rotate-45">
                ΠΡΟΣΦΟΡΑ
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: price + offer */}
              <div className="p-8 border-r border-amber-500/15">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-400/70 font-bold uppercase tracking-widest">Ολοκληρωμένη Λύση</p>
                    <h3 className="text-base font-extrabold text-white">Απλή Ιστοσελίδα + Φιλοξενία</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-6xl font-extrabold"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                      €150
                    </span>
                    <span className="text-base text-amber-300/70 font-bold">/χρόνο</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground/50 line-through">€500/χρόνο</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                      -70%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Τιμή κατασκευής ιστοσελίδας συμπεριλαμβάνεται στη συνδρομή. Ανανέωση κάθε χρόνο — χωρίς κρυφές χρεώσεις.
                </p>

                <button
                  onClick={() => setInquiryOpen(true)}
                  className="w-full h-12 rounded-2xl font-extrabold text-black text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 24px rgba(251,191,36,0.35)" }}
                  data-testid="button-annual-package"
                >
                  <Mail className="w-4 h-4" />
                  Ζητήστε Προσφορά
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: included features */}
              <div className="p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-5">Τι περιλαμβάνεται</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { icon: Globe,       text: "Domain .gr ή .com" },
                    { icon: Lock,        text: "SSL Certificate" },
                    { icon: Server,      text: "Hosting / Server" },
                    { icon: Shield,      text: "Daily Backups" },
                    { icon: Zap,         text: "Speed Optimization" },
                    { icon: Search,      text: "Βασικό SEO" },
                    { icon: Smartphone,  text: "Mobile Responsive" },
                    { icon: Code2,       text: "Software Updates" },
                    { icon: CheckCircle2,text: "Security Patches" },
                    { icon: Mail,        text: "Email Support" },
                    { icon: Star,        text: "GDPR Compliant" },
                    { icon: Monitor,     text: "Uptime Monitoring" },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                      <span className="text-xs text-white/80">{f.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
                  <p className="text-[10px] text-amber-300/70 leading-relaxed">
                    <strong className="text-amber-400">Χωρίς έκπληξη-χρεώσεις.</strong> Domain + Hosting + SSL + Backup + Updates — όλα σε μία ετήσια τιμή. Ανανεώνετε μόνο αν είστε ευχαριστημένοι.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Construction packages ────────────────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Τιμές</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-3">Πακέτα Κατασκευής</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Εφάπαξ κατασκευή — τιμές ανάλογα με το είδος και τις απαιτήσεις του project.
              Επικοινωνήστε για δωρεάν προσφορά.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-6 ${plan.accent} ${plan.highlight ? "shadow-[0_0_40px_rgba(0,210,200,0.15)]" : ""}`}
                style={{ background: plan.highlight ? "linear-gradient(145deg, rgba(0,210,200,0.07), rgba(0,0,0,0))" : "rgba(255,255,255,0.02)" }}
                data-testid={`card-pricing-${plan.name.toLowerCase()}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-black font-extrabold text-[9px] px-3 py-1 uppercase tracking-widest">
                      Δημοφιλές
                    </Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <span
                    className={`text-4xl font-extrabold bg-gradient-to-r ${plan.priceColor} bg-clip-text text-transparent`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1.5">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setInquiryOpen(true)}
                  className="w-full h-11 font-bold border-0"
                  style={plan.btnStyle}
                  data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                >
                  Ζητήστε Προσφορά
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Real clients section ────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Πραγματικά Έργα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Δουλειές Πελατών μας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Live sites σε λειτουργία — φτιαγμένα από εμάς με πλήρες SEO, ασφάλεια και βελτιστοποίηση ταχύτητας.
            </p>
          </div>

          {/* HydroFix card */}
          <Link href="/portfolio/hydrofix-gr" data-testid="card-real-project-hydrofix">
            <div className="group relative rounded-3xl border border-emerald-500/25 overflow-hidden cursor-pointer hover:border-emerald-400/50 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #060f0a 0%, #0a1a10 60%, #050e07 100%)" }}>
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotHydrofix}
                    alt="HydroFix.gr — Εταιρικό site υδραυλικών"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "220px", maxHeight: "280px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060f0a] md:block hidden" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-emerald-400/70 flex items-center gap-1">
                      hydrofix.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    HydroFix.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Εταιρικό site για υδραυλικές εργασίες στην Αττική. Δίγλωσσο (ΕΛ/EN), 24/7 emergency section, Google Reviews, LocalBusiness schema.
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "91/100", color: "text-emerald-400" },
                      { icon: Search, label: "SEO",          value: "98/100", color: "text-emerald-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-emerald-400" },
                      { icon: Zap,    label: "FCP",           value: "1.1s",   color: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* e-regalo.gr card */}
          <Link href="/portfolio/regalo-gr" data-testid="card-real-project-regalo" className="mt-5 block">
            <div className="group relative rounded-3xl border border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-400/45 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #110b01 0%, #1a1002 60%, #0e0901 100%)" }}>
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotRegalo}
                    alt="e-regalo.gr — eShop κοσμημάτων Μοσχάτο"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#110b01] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-amber-500/80 text-black font-extrabold text-[9px] px-2 py-1">eShop</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-amber-500/60 flex items-center gap-1">
                      e-regalo.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    e-regalo.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    eShop κοσμημάτων & αξεσουάρ στο Μοσχάτο. Elegant cream/gold design, Gallery με φίλτρα, Blog, δίγλωσσο, Google Maps.
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,      label: "Performance", value: "88/100", color: "text-amber-400" },
                      { icon: Search,     label: "SEO",          value: "96/100", color: "text-amber-400" },
                      { icon: Shield,     label: "Ασφάλεια",     value: "A+",     color: "text-amber-400" },
                      { icon: Layers,     label: "Gallery",      value: "Φίλτρα", color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* louloudotopos.com.gr card */}
          <Link href="/portfolio/louloudotopos" data-testid="card-real-project-louloudotopos" className="mt-5 block">
            <div
              className="group relative rounded-3xl border border-green-500/20 overflow-hidden cursor-pointer hover:border-green-400/45 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #010d03 0%, #031a06 60%, #010c03 100%)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotLouloudotopos}
                    alt="louloudotopos.com.gr — Παιδικός Σταθμός"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#010d03] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-green-700/80 text-green-100 font-extrabold text-[9px] px-2 py-1">Παιδικός Σταθμός</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-green-500/60 flex items-center gap-1">
                      louloudotopos.com.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-green-300 transition-colors">
                    Λουλουδότοπος
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Κέντρο προσχολικής αγωγής 33 χρόνων. Κολύμβηση, Μουσικοκινητική, Yoga, Αθλοπαιδιές — ξεχωριστή σελίδα για κάθε δραστηριότητα.
                  </p>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "87/100", color: "text-green-400" },
                      { icon: Search, label: "SEO",          value: "95/100", color: "text-green-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-green-400" },
                      { icon: Layers, label: "Παροχές",      value: "6",      color: "text-green-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-green-500/15 bg-green-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-green-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* BsNaomi.gr card */}
          <Link href="/portfolio/bsnaomi-gr" data-testid="card-real-project-bsnaomi" className="mt-5 block">
            <div
              className="group relative rounded-3xl border border-pink-500/20 overflow-hidden cursor-pointer hover:border-pink-400/45 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #0d0208 0%, #180410 60%, #0d0208 100%)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotBsNaomi}
                    alt="BsNaomi.gr — Ολοκληρωμένες Λύσεις Διαδικτύου"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0208] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-pink-600/80 text-pink-100 font-extrabold text-[9px] px-2 py-1">Accessibility 96</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-pink-500/60 flex items-center gap-1">
                      bsnaomi.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-pink-300 transition-colors">
                    BsNaomi.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Ολοκληρωμένες Λύσεις Διαδικτύου από Καλλιθέα. Minimal clean design, WCAG accessibility, GDPR φόρμα.
                  </p>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance",   value: "94/100", color: "text-pink-400" },
                      { icon: Search, label: "SEO",            value: "97/100", color: "text-pink-400" },
                      { icon: Shield, label: "Ασφάλεια",       value: "A+",     color: "text-pink-400" },
                      { icon: Layers, label: "Accessibility",  value: "96/100", color: "text-pink-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-pink-500/15 bg-pink-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-pink-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* TheatreHood.gr card */}
          <Link href="/portfolio/theatrehood-gr" data-testid="card-real-project-theatrehood" className="mt-5 block">
            <div
              className="group relative rounded-3xl border border-orange-500/20 overflow-hidden cursor-pointer hover:border-orange-400/45 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #0e0500 0%, #1a0a00 60%, #0e0500 100%)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotTheatreHood}
                    alt="theatrehood.gr — Θεατρική Σχολή"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0e0500] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-orange-700/80 text-orange-100 font-extrabold text-[9px] px-2 py-1">Θεατρική Σχολή</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-orange-500/60 flex items-center gap-1">
                      theatrehood.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    TheatreHood.gr
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Dramatic dark design για θεατρική σχολή — Εφηβική ομάδα, Εργαστήρι Ενηλίκων, Παιδικό. Event Schema για παραστάσεις.
                  </p>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "89/100", color: "text-orange-400" },
                      { icon: Search, label: "SEO",          value: "94/100", color: "text-orange-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-orange-400" },
                      { icon: Layers, label: "Event Schema", value: "2024",   color: "text-orange-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-orange-500/15 bg-orange-500/5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ath-ecs.gr card */}
          <Link href="/portfolio/ath-ecs-gr" data-testid="card-real-project-athecs" className="mt-5 block">
            <div
              className="group relative rounded-3xl border border-amber-500/25 overflow-hidden cursor-pointer hover:border-amber-400/50 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #0a0700 0%, #160f00 60%, #0a0700 100%)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotAthEcs}
                    alt="ath-ecs.gr — Athens Executive Chauffeur Service"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0700] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-amber-600/90 text-amber-100 font-extrabold text-[9px] px-2 py-1">Luxury EN/GR</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-amber-500/60 flex items-center gap-1">
                      ath-ecs.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    ATH-ECS
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    «Where Luxury Meets Precision» — Executive Chauffeur Αθήνα. Bilingual EN/GR, Fleet Mercedes S-Class, WhatsApp booking 24/7.
                  </p>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "86/100", color: "text-amber-400" },
                      { icon: Search, label: "SEO",          value: "96/100", color: "text-amber-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-amber-400" },
                      { icon: Layers, label: "Bilingual",    value: "EN/GR",  color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/6">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* nikosapost.gr card */}
          <Link href="/portfolio/nikosapost-gr" data-testid="card-real-project-nikosapost" className="mt-5 block">
            <div
              className="group relative rounded-3xl border border-orange-500/25 overflow-hidden cursor-pointer hover:border-orange-400/50 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #050a14 0%, #0a1428 60%, #050a14 100%)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotNikosapost}
                    alt="nikosapost.gr — Νίκος Αποστολόπουλος Auto Service Πειραιάς"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050a14] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="bg-orange-600/90 text-orange-100 font-extrabold text-[9px] px-2 py-1">Auto Service</Badge>
                  </div>
                </div>
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-orange-500/60 flex items-center gap-1">
                      nikosapost.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    Αποστολόπουλος Auto Service
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    «φροντίζουμε το αυτοκίνητο ώστε να κινείσαι χωρίς άγχος» — Πειραιάς. 4.9★ Google, bilingual EL/EN, FAQ Schema.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "91/100", color: "text-orange-400" },
                      { icon: Search, label: "SEO",          value: "98/100", color: "text-orange-400" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+",     color: "text-orange-400" },
                      { icon: Star,   label: "Google",       value: "4.9★ 50", color: "text-orange-400" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-orange-500/20 bg-orange-500/6">
                        <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className={`text-xs font-extrabold ${s.color}`}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-400 group-hover:gap-3 transition-all">
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* metamorfosi-moschato.gr card */}
          <Link href="/portfolio/metamorfosi-moschato-gr" data-testid="card-real-project-metamorfosi" className="mt-5 block">
            <div
              className="group relative rounded-3xl border overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "linear-gradient(145deg, #0d1929 0%, #1a2e4a 60%, #0d1929 100%)", borderColor: "rgba(192,133,106,0.25)" }}
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative overflow-hidden">
                  <img
                    src={screenshotMetamorfosi}
                    alt="metamorfosi-moschato.gr — Ιερός Ναός Μεταμορφώσεως Μοσχάτου"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ minHeight: "200px", maxHeight: "260px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d1929] md:block hidden" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px] px-2 py-1">LIVE</Badge>
                    <Badge className="font-extrabold text-[9px] px-2 py-1" style={{ background: "rgba(192,133,106,0.85)", color: "#fff" }}>Ιερός Ναός</Badge>
                  </div>
                </div>
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: "rgba(192,133,106,0.6)" }}>
                      metamorfosi-moschato.gr <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-extrabold text-white mb-2 transition-colors" style={{ color: "white" }}>
                    <span className="group-hover:text-amber-200 transition-colors">Μεταμόρφωση Μοσχάτου</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Ιερός Ναός Μεταμορφώσεως Σωτήρος — cream/navy design, serif fonts, αεροφωτογραφία hero, Place of Worship Schema.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: Gauge,  label: "Performance", value: "94/100" },
                      { icon: Search, label: "SEO",          value: "96/100" },
                      { icon: Shield, label: "Ασφάλεια",     value: "A+" },
                      { icon: Layers, label: "Design",       value: "Light" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ border: "1px solid rgba(192,133,106,0.20)", background: "rgba(192,133,106,0.06)" }}>
                        <s.icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#c0856a" }} />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          <p className="text-xs font-extrabold" style={{ color: "#c0856a" }}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: "#c0856a" }}>
                    Δείτε πλήρες Case Study
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Services included */}
        <div>
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Υπηρεσίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-3">Τι Περιλαμβάνεται</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Κάθε project παραδίδεται με πλήρη τεκμηρίωση, εκπαίδευση και post-launch support.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES_LIST.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-primary/25 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Τεχνολογίες</p>
            <h2 className="text-2xl font-display font-extrabold text-foreground">Stack που Χρησιμοποιούμε</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STACK.map((s) => (
              <div key={s.name} className="p-4 rounded-2xl border border-white/8 bg-card/40 text-center hover:border-white/20 transition-all">
                <Code2 className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                <p className="text-sm font-bold text-foreground mb-0.5">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center border border-primary/20"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(139,92,246,0.05) 100%)" }}
        >
          <Globe className="w-12 h-12 text-primary mx-auto mb-4" style={{ filter: "drop-shadow(0 0 12px rgba(0,210,200,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Ξεκινήστε το Project σας
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Επικοινωνήστε μαζί μας για μια <strong className="text-foreground">δωρεάν συνάντηση αξιολόγησης</strong>.
            Θα συζητήσουμε τις ανάγκες σας και θα σας δώσουμε αναλυτική προσφορά εντός 24 ωρών.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                data-testid="button-webdesign-cta-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-primary/30 hover:border-primary gap-2 text-primary">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
        </div>

      </main>

      <Footer />

      <WebsiteInquiryModal open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </div>
  );
}
