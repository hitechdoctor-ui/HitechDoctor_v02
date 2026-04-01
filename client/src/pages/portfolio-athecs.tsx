import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fragment } from "react";
import {
  Globe, Shield, Zap, Search, CheckCircle2, ExternalLink,
  ChevronRight, Smartphone, Lock, Server, Code2,
  BarChart3, MapPin, Clock, ArrowRight, Gauge,
  FileCode, Layers, Eye, Mail, Phone,
  Car, Star, Calendar, MessageSquare, Languages,
  UserCheck,
} from "lucide-react";
import screenshotHero    from "@assets/Screenshot_2026-03-11_at_13.39.32_1773229234685.png";
import screenshotStory   from "@assets/Screenshot_2026-03-11_at_13.39.45_1773229234685.png";
import screenshotFleet   from "@assets/Screenshot_2026-03-11_at_13.40.04_1773229234685.png";
import screenshotReserve from "@assets/Screenshot_2026-03-11_at_13.40.25_1773229234685.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 86, color: "#c9a227" },
  { label: "SEO",            score: 96, color: "#c9a227" },
  { label: "Accessibility",  score: 90, color: "#c9a227" },
  { label: "Best Practices", score: 92, color: "#c9a227" },
];

const VITALS = [
  { metric: "FCP",  value: "1.4s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.9s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.02",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "20ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.6s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "2.3s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const STATS = [
  { value: "10+",    label: "Years of Excellence" },
  { value: "5,000+", label: "Satisfied Clients" },
  { value: "25,000+",label: "Journeys Completed" },
];

const SEO_KEYWORDS = [
  "executive chauffeur athens",
  "luxury car service athens",
  "athens vip transfer",
  "ath-ecs",
  "premium chauffeur greece",
  "αθήνα executive μεταφορά",
  "Mercedes chauffeur Athens",
  "airport transfer athens luxury",
];

const PAGES = [
  { path: "/", title: "Hero — Where Luxury Meets Precision", desc: "Full-bleed luxury sunset photo, gold CTA «Reserve Your Journey» + «Explore Our Fleet», GR/EN language switcher", screenshot: screenshotHero },
  { path: "/#story", title: "Our Story", desc: "10+ Years · 5,000+ Clients · 25,000+ Journeys — founder with Mercedes E-Class, «The Art of Exceptional Service»", screenshot: screenshotStory },
  { path: "/fleet", title: "Fleet — Mercedes-Benz S-Class", desc: "Interactive fleet showcase: Mercedes S-Class Obsidian Black 2024, 4 passengers, 2 luggage — με specs και φωτογραφίες", screenshot: screenshotFleet },
  { path: "/reserve", title: "Begin Your Journey", desc: "WhatsApp reservation form: Full Name, Email, Phone, Service, Date, Time, Pickup, Destination — 24/7 availability", screenshot: screenshotReserve },
];

const TECH_STACK = [
  { name: "HTML5 / CSS3",       desc: "Ultra-premium dark black + gold palette, serif luxury typography, full-bleed photography", icon: FileCode,  color: "text-amber-400" },
  { name: "JavaScript ES6+",    desc: "Fleet interactive cards, smooth scroll, reservation form, language switcher (EN/GR)",       icon: Code2,     color: "text-yellow-300" },
  { name: "Custom Design",      desc: "Αποκλειστικό high-end design — ούτε WordPress ούτε template — κάθε pixel στη θέση του",    icon: Layers,    color: "text-amber-400" },
  { name: "WhatsApp Integration", desc: "Φόρμα κράτησης που συνδέεται απευθείας μέσω WhatsApp με την ομάδα reservations",         icon: MessageSquare, color: "text-amber-400" },
  { name: "Bilingual EN/GR",    desc: "Language switcher EN/GR στο navbar — εξυπηρέτηση τόσο ξένων επισκεπτών όσο και Ελλήνων",   icon: Languages, color: "text-amber-400" },
  { name: "SSL / HTTPS",        desc: "HTTPS enforced — κρίσιμο για luxury brand που ζητά προσωπικά στοιχεία κράτησης",           icon: Lock,      color: "text-amber-400" },
];

const SEO_FEATURES = [
  { title: "LocalBusiness + Service Schema", desc: "JSON-LD τύπου LimousineService + TaxiService: τοποθεσία Αθήνα, vehicles, ώρες (24/7) — εμφανίζεται σε Google Rich Results.", icon: MapPin },
  { title: "SEO 96/100",                    desc: "Κορυφαίο Lighthouse SEO score — bilingual meta tags σε EN + GR, heading ιεραρχία, alt texts σε όλα τα luxury vehicles.", icon: Search },
  { title: "Review Schema",                 desc: "Κριτικές πελατών ως Review Schema — εμφανίζονται με αστεράκια στα Google αποτελέσματα.", icon: Star },
  { title: "Bilingual Meta Tags",           desc: "Δύο σετ meta tags (EN + GR) και hreflang — Google δείχνει τη σωστή γλώσσα στον κάθε χρήστη.", icon: Languages },
  { title: "Core Web Vitals",               desc: "LCP 2.9s παρά τα μεγάλα luxury photos — χάρη σε WebP format και progressive loading.", icon: Gauge },
  { title: "OpenGraph Luxury",              desc: "Stunning luxury preview cards σε LinkedIn και Facebook — κρίσιμο για corporate clients.", icon: Globe },
  { title: "Fleet Schema",                  desc: "Κάθε όχημα (Mercedes S-Class, E-Class, V-Class) ως Vehicle Schema με specs — εμφανίζεται στη Google.", icon: Car },
  { title: "XML Sitemap",                   desc: "Sitemap που καλύπτει Services, Fleet, Journal, Contact — πλήρης κάλυψη από Google.", icon: FileCode },
];

const SECURITY = [
  { title: "SSL Certificate A+",        desc: "HTTPS enforced — luxury brand απαιτεί trust. Πελάτης που βλέπει «Not Secure» φεύγει αμέσως.", icon: Lock },
  { title: "WhatsApp Secure",           desc: "Η φόρμα κράτησης χρησιμοποιεί WhatsApp Business API — end-to-end encryption.", icon: MessageSquare },
  { title: "GDPR Privacy",              desc: "Privacy Policy για τα στοιχεία κράτησης — συμμόρφωση GDPR για επαγγελματικό βrand.", icon: Shield },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Custom κώδικας — μηδέν plugin vulnerabilities, γρηγορότερη φόρτωση, ασφαλέστερο.", icon: Shield },
  { title: "Security Headers",          desc: "CSP, X-Frame-Options, HSTS headers — υψηλό επίπεδο ασφάλειας.", icon: Code2 },
  { title: "Cloudflare Protection",     desc: "DDoS mitigation, bot filtering, CDN — βέλτιστη φόρτωση φωτογραφιών fleet.", icon: Server },
];

const EXTRAS = [
  { icon: Car,          title: "Fleet Showcase",       desc: "Interactive fleet cards: Mercedes S-Class, E-Class, V-Class με specs" },
  { icon: MessageSquare,title: "WhatsApp Reservation", desc: "Φόρμα → απευθείας WhatsApp, response εντός 15 λεπτών" },
  { icon: Languages,    title: "Bilingual EN/GR",      desc: "Language switcher στο navbar — ξένοι επισκέπτες & Έλληνες" },
  { icon: Clock,        title: "24/7 Available",       desc: "«Available 24 hours a day, 7 days a week» badge στη φόρμα" },
  { icon: Calendar,     title: "Booking Form",         desc: "Date, Time, Pickup Location, Destination, Service type" },
  { icon: UserCheck,    title: "Stats Counter",        desc: "10+ Years, 5,000+ Clients, 25,000+ Journeys animated" },
  { icon: Globe,        title: "Journal / Blog",       desc: "Blog section για SEO content — luxury travel tips Athens" },
  { icon: Star,         title: "Gold CTA Design",      desc: "«Reserve Your Journey» — premium gold button design" },
];

function ScoreCircle({ score, color, label }: { score: number; color: string; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold text-white">{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function VitalBadge({ status }: { status: string }) {
  if (status === "good") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Άριστο</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Καλό</span>;
}

export default function PortfolioAthEcs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: ath-ecs.gr — Κατασκευή Site Luxury Chauffeur | HiTech Doctor"
        description="Case study: ath-ecs.gr — Athens Executive Chauffeur Service. SEO 96/100, bilingual EN/GR, Fleet showcase Mercedes S-Class, WhatsApp reservation, 24/7. Luxury web design από HiTech Doctor."
        keywords="ath-ecs, executive chauffeur site athens, luxury web design, vip transfer website, bilingual site EN GR"
        url="https://hitechdoctor.com/portfolio/ath-ecs-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "ath-ecs.gr — Athens Executive Chauffeur Service",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://ath-ecs.gr",
          "description": "Luxury executive chauffeur service website — bilingual, Fleet showcase, WhatsApp reservations",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #0a0700 0%, #120e00 50%, #0a0700 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">ath-ecs.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold uppercase tracking-widest">Luxury Chauffeur</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                ath-ecs<span className="text-amber-400">.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Athens Executive Chauffeur Service</strong> —
                «Where Luxury Meets Precision». Premium chauffeur-driven transportation
                με Mercedes S-Class, 10+ χρόνια, 5,000+ πελάτες.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Ultra-luxury dark black + gold design, bilingual EN/GR, interactive fleet showcase,
                WhatsApp reservation form 24/7 και SEO 96/100.
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-amber-400">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="https://ath-ecs.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #92690a, #c9a227)", color: "#fff", boxShadow: "0 0 20px rgba(201,162,39,0.35)" }}
                    data-testid="button-athecs-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-amber-500/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-amber-500/20"
              style={{ background: "rgba(201,162,39,0.04)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300">
                  <strong>Bilingual EN/GR</strong> — hreflang tags, dual meta sets, language switcher
                </p>
              </div>
              <p className="text-center text-[10px] text-muted-foreground mt-3">Μετρήθηκε με Google Lighthouse · Desktop mode</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ultra-premium dark design με gold accents — το site αντανακλά την πολυτέλεια
              της υπηρεσίας. Κάθε element έχει σχεδιαστεί για εμπιστοσύνη και prestige.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-amber-500/25 transition-all">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground font-mono">ath-ecs.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`ath-ecs.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-white/6">
                  <span className="text-xs font-mono text-amber-500/60">{page.path || "/"}</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{page.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{page.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Core Web Vitals ────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Luxury site με βαριές high-res φωτογραφίες οχημάτων και sunsets — παραμένει
              γρήγορο χάρη σε <strong className="text-foreground">WebP format + progressive loading</strong>.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{v.metric}</span>
                  </div>
                  <VitalBadge status={v.status} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
            <BarChart3 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-300 mb-1">Luxury photography χωρίς performance penalty</p>
              <p className="text-xs text-amber-100/70 leading-relaxed">
                Full-bleed sunset photos και Mercedes close-ups σε WebP — το LCP παραμένει
                <strong className="text-amber-400"> 2.9s</strong> παρά το heavy visual design.
                Corporate clients που ψάχνουν από laptop βλέπουν στιγμιαία αποτελέσματα.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Luxury brand που χειρίζεται corporate bookings και VIP clients —
              <strong className="text-foreground"> η ασφάλεια είναι discretion</strong>.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO ────────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO <strong className="text-foreground">96/100</strong> — με bilingual hreflang και
              LimousineService Schema. Corporate clients και τουρίστες βρίσκουν το ATH-ECS.
            </p>
          </div>
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Target Keywords</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 text-xs text-amber-400 font-medium">
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech stack ─────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Custom-built — όπως ένα luxury vehicle, ούτε ένα detail παραλήφθηκε.
              Χωρίς WordPress, χωρίς templates. Precision engineering.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((t) => (
              <div key={t.name} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <t.icon className={`w-5 h-5 ${t.color} mb-3`} />
                <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Extra features ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRAS.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-500/20 transition-all">
                <f.icon className="w-4 h-4 text-amber-400 mb-2" />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact spotlight ────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-amber-500/20"
          style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.06) 0%, rgba(120,90,10,0.04) 100%)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500/60 mb-5">Στοιχεία Επαφής</p>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: Phone,        label: "Phone",    value: "+30 693 310 2727" },
              { icon: MessageSquare,label: "WhatsApp", value: "+30 693 310 2727" },
              { icon: Mail,         label: "Email",    value: "info@ath-ecs.gr" },
              { icon: MapPin,       label: "Location", value: "Athens, Greece" },
            ].map((c) => (
              <div key={c.label} className="p-4 rounded-2xl border border-amber-500/15 bg-amber-500/5">
                <c.icon className="w-4 h-4 text-amber-400 mb-2" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{c.label}</p>
                <p className="text-xs font-bold text-white">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">
              <strong>Available 24/7</strong> — Response within 15 minutes via WhatsApp
            </p>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-amber-500/25"
          style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(120,90,10,0.05) 100%)" }}
        >
          <Car className="w-12 h-12 text-amber-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 14px rgba(201,162,39,0.5))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε luxury websites για VIP transportation, executive services και premium brands —
            bilingual, Fleet showcase, WhatsApp booking, SEO 96+.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #92690a, #c9a227)", boxShadow: "0 0 24px rgba(201,162,39,0.35)" }}
                data-testid="button-athecs-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-amber-500/30 hover:border-amber-400 gap-2 text-amber-400">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              Δείτε όλο το portfolio
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
