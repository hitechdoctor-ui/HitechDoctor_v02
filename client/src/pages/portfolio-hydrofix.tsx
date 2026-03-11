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
  ChevronRight, Star, Smartphone, Lock, Server, Code2,
  BarChart3, MapPin, Languages, Clock, ArrowRight, Gauge,
  FileCode, Layers, Eye, Mail, Phone,
} from "lucide-react";
import screenshotHome     from "@assets/Screenshot_2026-03-11_at_13.11.57_1773227593503.png";
import screenshotAbout    from "@assets/Screenshot_2026-03-11_at_13.12.20_1773227593503.png";
import screenshotServices from "@assets/Screenshot_2026-03-11_at_13.12.29_1773227593504.png";
import screenshotContact  from "@assets/Screenshot_2026-03-11_at_13.12.45_1773227593504.png";

// ── Lighthouse scores ─────────────────────────────────────────────────────────
const LIGHTHOUSE = [
  { label: "Performance",    score: 91, color: "#22c55e", track: "#14532d" },
  { label: "SEO",            score: 98, color: "#22c55e", track: "#14532d" },
  { label: "Accessibility",  score: 94, color: "#22c55e", track: "#14532d" },
  { label: "Best Practices", score: 95, color: "#22c55e", track: "#14532d" },
];

// ── Core Web Vitals ───────────────────────────────────────────────────────────
const VITALS = [
  { metric: "FCP",  value: "1.1s",  label: "First Contentful Paint",   status: "good",    icon: Eye },
  { metric: "LCP",  value: "2.3s",  label: "Largest Contentful Paint", status: "good",    icon: Gauge },
  { metric: "CLS",  value: "0.02",  label: "Cumulative Layout Shift",  status: "good",    icon: Layers },
  { metric: "FID",  value: "18ms",  label: "First Input Delay",        status: "good",    icon: Zap },
  { metric: "TTFB", value: "0.4s",  label: "Time to First Byte",       status: "good",    icon: Server },
  { metric: "TTI",  value: "1.8s",  label: "Time to Interactive",      status: "good",    icon: Clock },
];

// ── SEO keywords ──────────────────────────────────────────────────────────────
const SEO_KEYWORDS = [
  "υδραυλικός αθήνα",
  "υδραυλικός αττική",
  "ανακαίνιση λουτρού αθήνα",
  "επισκευή σωληνώσεων",
  "εγκατάσταση θέρμανσης",
  "υδραυλικός 24 ώρες",
  "plumber athens",
  "φυσικό αέριο εγκατάσταση",
];

// ── Tech stack ────────────────────────────────────────────────────────────────
const TECH_STACK = [
  { name: "HTML5 / CSS3",    desc: "Semantic markup, flexbox layout, CSS animations", icon: FileCode, color: "text-orange-400" },
  { name: "JavaScript ES6+", desc: "Interactive components, form validation, smooth scroll", icon: Code2,     color: "text-yellow-400" },
  { name: "Tailwind CSS",    desc: "Utility-first CSS, responsive grid, dark/light ready", icon: Layers,    color: "text-sky-400" },
  { name: "Cloudflare CDN",  desc: "Παγκόσμιο CDN, DDoS protection, caching rules",       icon: Server,    color: "text-orange-300" },
  { name: "SSL / HTTPS",     desc: "Let's Encrypt certificate, HSTS, A+ rating",           icon: Lock,      color: "text-emerald-400" },
  { name: "Responsive",      desc: "Mobile-first design, breakpoints για κάθε συσκευή",    icon: Smartphone, color: "text-primary" },
];

// ── Security features ─────────────────────────────────────────────────────────
const SECURITY = [
  { title: "SSL Certificate A+",     desc: "Κρυπτογραφημένη σύνδεση με TLS 1.3 — το πράσινο λουκέτο εμπνέει εμπιστοσύνη στον επισκέπτη.", icon: Lock },
  { title: "HSTS Preloading",        desc: "Ο browser αναγκαστικά χρησιμοποιεί HTTPS — αδύνατη η υποκλοπή δεδομένων μέσω HTTP.", icon: Shield },
  { title: "Cloudflare Protection",  desc: "DDoS mitigation, bot filtering, Web Application Firewall (WAF) ενεργό 24/7.", icon: Server },
  { title: "Security Headers",       desc: "CSP, X-Frame-Options, X-Content-Type-Options — προστασία από XSS & clickjacking.", icon: Code2 },
  { title: "GDPR Compliant",         desc: "Cookie consent banner, Privacy Policy, δεν αποθηκεύουμε προσωπικά δεδομένα χωρίς συγκατάθεση.", icon: CheckCircle2 },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Καθαρός στατικός κώδικας — μηδενικός κίνδυνος από WordPress plugin vulnerabilities.", icon: Shield },
];

// ── SEO features ──────────────────────────────────────────────────────────────
const SEO_FEATURES = [
  { title: "LocalBusiness Schema",   desc: "JSON-LD markup που λέει στη Google: ποια επιχείρηση είναι, πού βρίσκεται, ποιες ώρες λειτουργεί — εμφανίζεται στα Google Rich Results.", icon: MapPin },
  { title: "Unique Title & Meta Tags", desc: "Κάθε σελίδα έχει μοναδικό Title (έως 60 χαρακτήρες) και Meta Description (έως 160) βελτιστοποιημένα για τις λέξεις-κλειδιά.", icon: Search },
  { title: "XML Sitemap",            desc: "Αυτόματο sitemap.xml που υποβάλλεται στο Google Search Console — επιτρέπει στη Google να ανακαλύπτει γρήγορα νέες σελίδες.", icon: FileCode },
  { title: "OpenGraph & Twitter Cards", desc: "Όταν ο χρήστης μοιράζεται τον σύνδεσμο στο Facebook/WhatsApp, εμφανίζεται preview με εικόνα, τίτλο και περιγραφή.", icon: Globe },
  { title: "Canonical URLs",         desc: "Αποτρέπει duplicate content — η Google ξέρει ποια είναι η κύρια σελίδα και δεν τιμωρεί το site.", icon: CheckCircle2 },
  { title: "Core Web Vitals",        desc: "Google's ranking factor: το site φορτώνει γρήγορα (LCP <2.5s), δεν αλλάζει layout (CLS <0.1), άμεση απόκριση (FID <100ms).", icon: Gauge },
  { title: "Google My Business",     desc: "Πλήρες GMB profile συνδεδεμένο με το site — εμφανίζεται στο Google Maps και στα τοπικά αποτελέσματα.", icon: MapPin },
  { title: "Bilingual Content",      desc: "Ελληνική & αγγλική έκδοση (hreflang tags) — ευρύτερο κοινό, πλεονέκτημα έναντι μονόγλωσσων ανταγωνιστών.", icon: Languages },
];

// ── Pages & features ──────────────────────────────────────────────────────────
const PAGES = [
  { path: "/", title: "Αρχική", desc: "Hero με CTA, πλεονεκτήματα, επισκόπηση υπηρεσιών", screenshot: screenshotHome },
  { path: "/pages/about.html", title: "Σχετικά με Εμάς", desc: "Ιστορία, ομάδα, πιστοποιήσεις, εγγύηση ποιότητας", screenshot: screenshotAbout },
  { path: "/pages/services.html", title: "Υπηρεσίες", desc: "Αναλυτική παρουσίαση υπηρεσιών με φωτογραφίες", screenshot: screenshotServices },
  { path: "/pages/contact.html", title: "Επικοινωνία", desc: "Φόρμα επικοινωνίας, χάρτης, Google Reviews", screenshot: screenshotContact },
];

// ── Metric badge ─────────────────────────────────────────────────────────────
function VitalBadge({ status }: { status: string }) {
  if (status === "good") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Άριστο</span>;
  if (status === "needs-improvement") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Καλό</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Χρειάζεται βελτίωση</span>;
}

// ── Circular score ────────────────────────────────────────────────────────────
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

export default function PortfolioHydrofix() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: HydroFix.gr — Κατασκευή Site Υδραυλικών | HiTech Doctor Web Design"
        description="Case study: Κατασκευή του HydroFix.gr — εταιρικό site υδραυλικών στην Αθήνα με SEO 98/100, PageSpeed 91/100, SSL A+, bilingual, LocalBusiness schema. Web Design από HiTech Doctor."
        keywords="hydrofix, κατασκευη site υδραυλικων, web design αθηνα, seo υδραυλικος, portfolio web designer"
        url="https://hitechdoctor.com/portfolio/hydrofix-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "HydroFix.gr — Εταιρικό Website",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://hydrofix.gr",
          "description": "Εταιρικό website για υδραυλικές εργασίες στην Αττική",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #080d1a 0%, #0d1530 50%, #080c18 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-25 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">HydroFix.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">
                  Πραγματικό Έργο
                </Badge>
                <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-widest">
                  Εταιρικό Site
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                HydroFix.gr
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Επαγγελματικό εταιρικό website</strong> για επιχείρηση υδραυλικών εργασιών
                που καλύπτει όλη την Αττική. Σχεδιάστηκε με γνώμονα την εμπιστοσύνη, την ταχύτητα και την εύρεση στη Google.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Δίγλωσση (Ελληνικά / Αγγλικά), βελτιστοποιημένο για mobile, με 24/7 emergency section
                και πλήρη SEO υποδομή για τοπική αναζήτηση.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://hydrofix.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 20px rgba(0,210,200,0.3)" }}
                    data-testid="button-hydrofix-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-primary/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            {/* Lighthouse scores hero */}
            <div className="p-6 rounded-3xl border border-white/10"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
                Μετρήθηκε με Google Lighthouse · Desktop mode
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Screenshots gallery ────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Καθαρό, επαγγελματικό design με χρώματα που εμπνέουν εμπιστοσύνη.
              Πλήρως responsive — εμφανίζεται τέλεια σε κινητό, tablet και desktop.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-primary/25 transition-all">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground/60 font-mono">hydrofix.gr{page.path}</span>
                  </div>
                </div>
                {/* Screenshot */}
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`HydroFix.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                {/* Info */}
                <div className="p-4 border-t border-white/6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary/70">{page.path}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{page.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{page.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Core Web Vitals ────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Η ταχύτητα φόρτωσης είναι <strong className="text-foreground">ranking factor της Google</strong> από το 2021.
              Το HydroFix.gr βαθμολογείται «Άριστο» σε όλες τις μετρήσεις.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{v.metric}</span>
                  </div>
                  <VitalBadge status={v.status} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-4">
            <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-300 mb-1">Τι σημαίνει αυτό για την επιχείρηση;</p>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Ένα site που φορτώνει σε <strong className="text-emerald-400">&lt;2 δευτερόλεπτα</strong> έχει κατά μέσο όρο 15% λιγότερους «εγκαταλείψεις» επισκεπτών.
                Η Google προτιμά γρήγορα sites και τα βάζει ψηλότερα — άρα περισσότεροι πελάτες βρίσκουν το HydroFix.gr.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ένα ασφαλές site κερδίζει την εμπιστοσύνη επισκεπτών <em>και</em> της Google.
              Το HydroFix.gr έχει βαθμολογία <strong className="text-foreground">A+</strong> στο SSL Labs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-primary/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-primary" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO score <strong className="text-foreground">98/100</strong>. Στοχεύουμε λέξεις-κλειδιά
              που πληκτρολογούν οι κάτοικοι Αττικής όταν ψάχνουν υδραυλικό.
            </p>
          </div>

          {/* Target keywords */}
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Λέξεις-κλειδιά στόχος (Keywords)</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-xs text-primary font-medium">
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-primary/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Καθαρός, χειροποίητος κώδικας — όχι WordPress, όχι page builders.
              Αποτέλεσμα: ελαφρύτερο, γρηγορότερο, πιο ασφαλές site.
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

        {/* ── Extra features ──────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Languages,   title: "Δίγλωσσο",         desc: "Ελληνικά & Αγγλικά — hreflang tags για ορθό SEO" },
              { icon: Clock,       title: "24/7 Emergency",   desc: "Αυτόνομο section για έκτακτες υδραυλικές βλάβες" },
              { icon: Star,        title: "Google Reviews",   desc: "Εμφάνιση αξιολογήσεων 4.9★ απευθείας από Google" },
              { icon: MapPin,      title: "Google Maps",      desc: "Ενσωματωμένος χάρτης με τοποθεσία επιχείρησης" },
              { icon: Phone,       title: "Click-to-Call",    desc: "CTA κουμπί τηλεφώνου — ένα tap και καλεί ο πελάτης" },
              { icon: Shield,      title: "Accessibility",    desc: "WCAG 2.1 AA — button προσβασιμότητας για ΑμεΑ" },
              { icon: CheckCircle2,title: "ΓΕΜΗ αριθμός",    desc: "Επίσημος ΓΕΜΗ αριθμός εμφανής στη σελίδα επικοινωνίας" },
              { icon: Smartphone,  title: "Mobile-first",     desc: "Σχεδιάστηκε πρώτα για κινητό — 70%+ επισκεπτών είναι mobile" },
            ].map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-primary/20 transition-all">
                <f.icon className="w-4 h-4 text-primary mb-2" />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-primary/20"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(139,92,246,0.05) 100%)" }}
        >
          <Globe className="w-12 h-12 text-primary mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(0,210,200,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε εταιρικά sites για επιχειρήσεις στην Αθήνα με ταχύτητα,
            ασφάλεια και SEO που βάζει τον πελάτη σας στη Google.
            Δωρεάν αξιολόγηση χωρίς δέσμευση.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 44%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                data-testid="button-hydrofix-cta-email"
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
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors">
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
