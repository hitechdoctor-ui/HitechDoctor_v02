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
  Accessibility, Users, Star, Briefcase, FormInput,
} from "lucide-react";
import screenshotHero    from "@assets/Screenshot_2026-03-11_at_13.36.28_1773229053688.png";
import screenshotAbout   from "@assets/Screenshot_2026-03-11_at_13.36.42_1773229053689.png";
import screenshotWhy     from "@assets/Screenshot_2026-03-11_at_13.37.01_1773229053689.png";
import screenshotContact from "@assets/Screenshot_2026-03-11_at_13.37.10_1773229053689.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 94, color: "#22c55e" },
  { label: "SEO",            score: 97, color: "#22c55e" },
  { label: "Accessibility",  score: 96, color: "#22c55e" },
  { label: "Best Practices", score: 95, color: "#22c55e" },
];

const VITALS = [
  { metric: "FCP",  value: "1.1s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "1.9s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.01",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "18ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.5s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "1.7s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const SEO_KEYWORDS = [
  "ολοκληρωμένες λύσεις διαδικτύου",
  "web design καλλιθέα",
  "κατασκευή site καλλιθέα",
  "ψηφιακή παρουσία αθήνα",
  "υπηρεσίες ιστοσελίδας",
  "bsnaomi",
  "Ελισσάβετ Στάθη",
  "digital solutions athens",
];

const PAGES = [
  { path: "/", title: "Αρχική Hero", desc: "Clean minimal hero: «Ολοκληρωμένες Λύσεις Διαδικτύου» — dual CTA, light background, bold typography", screenshot: screenshotHero },
  { path: "/about", title: "Ποιοι Είμαστε", desc: "Ιστορία της Ελισσάβετ Στάθη, φιλοσοφία, με τεχνολογικό visual (AI face + binary code)", screenshot: screenshotAbout },
  { path: "/about#why", title: "Γιατί να μας Επιλέξετε", desc: "3 λόγοι: Εξατομικευμένη Προσέγγιση, Τοπική Παρουσία Καλλιθέα, Εμπειρία & Αξιοπιστία", screenshot: screenshotWhy },
  { path: "/contact", title: "Επικοινωνία", desc: "Φόρμα επικοινωνίας: Name, Email, Phone, Message — Terms of Service + Privacy Policy", screenshot: screenshotContact },
];

const TECH_STACK = [
  { name: "HTML5 / CSS3",    desc: "Clean semantic markup, minimal palette dark green + white, rounded pill buttons", icon: FileCode, color: "text-emerald-400" },
  { name: "JavaScript ES6+", desc: "Smooth scroll, active nav highlights, form validation",                          icon: Code2,    color: "text-yellow-300" },
  { name: "Custom Design",   desc: "Αποκλειστικό σχέδιο — μοντέρνο, minimalist, χωρίς WordPress",                  icon: Layers,   color: "text-pink-400" },
  { name: "Contact Form",    desc: "Φόρμα επικοινωνίας με Terms & Privacy Policy — GDPR compliant",                 icon: FormInput, color: "text-emerald-400" },
  { name: "SSL / HTTPS",     desc: "Κρυπτογραφημένη σύνδεση, HTTPS enforced",                                       icon: Lock,     color: "text-emerald-400" },
  { name: "WCAG Accessible", desc: "Accessibility icon στο navbar — σχεδιασμένο για όλους τους χρήστες",            icon: Accessibility, color: "text-pink-400" },
];

const SEO_FEATURES = [
  { title: "LocalBusiness Schema",   desc: "JSON-LD με τοποθεσία Καλλιθέα — εμφανίζεται σε Google Maps searches.", icon: MapPin },
  { title: "SEO 97/100",             desc: "Κορυφαίο Lighthouse SEO score — αποτέλεσμα βελτιστοποιημένων meta tags, headings, alt texts.", icon: Search },
  { title: "OpenGraph / Social",     desc: "Σωστό preview όταν κοινοποιείται σε LinkedIn και Facebook.", icon: Globe },
  { title: "Unique Meta per Page",   desc: "Κάθε σελίδα (About, Υπηρεσίες, Επικοινωνία) έχει δικό του title + description.", icon: FileCode },
  { title: "Privacy Policy / ToS",   desc: "Embedded στη φόρμα επικοινωνίας — GDPR compliance από μέρα 1.", icon: Shield },
  { title: "Core Web Vitals",        desc: "FCP 1.1s, LCP 1.9s — εξαιρετική ταχύτητα χάρη σε minimal design χωρίς bloat.", icon: Gauge },
  { title: "Accessibility 96/100",   desc: "ARIA labels, contrast ratios, keyboard navigation — ένα από τα καλύτερα scores.", icon: Eye },
  { title: "XML Sitemap",            desc: "Όλες οι σελίδες καταχωρημένες στη Google Search Console.", icon: CheckCircle2 },
];

const SECURITY = [
  { title: "SSL Certificate A+",      desc: "HTTPS enforced — απαραίτητο για επαγγελματική εικόνα και εμπιστοσύνη πελατών.", icon: Lock },
  { title: "HTTPS Redirects",         desc: "Αυτόματη ανακατεύθυνση HTTP → HTTPS.", icon: Shield },
  { title: "GDPR Contact Form",       desc: "Φόρμα επικοινωνίας με checkbox Terms & Privacy Policy — νόμιμη συλλογή δεδομένων.", icon: CheckCircle2 },
  { title: "Privacy Policy",          desc: "Πλήρες Privacy Policy accessible από τη φόρμα — συμμόρφωση με ευρωπαϊκό GDPR.", icon: FileCode },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Καθαρός κώδικας — μηδέν plugin vulnerabilities.", icon: Shield },
  { title: "Security Headers",        desc: "CSP, X-Frame-Options, X-Content-Type-Options.", icon: Code2 },
];

const EXTRAS = [
  { icon: Accessibility, title: "WCAG Accessibility", desc: "Dedicated accessibility button στο navbar — σχεδιασμένο για άτομα με αναπηρία" },
  { icon: FormInput,     title: "Contact Form",        desc: "Name, Email, Phone, Message με GDPR checkbox" },
  { icon: Users,         title: "About Story",         desc: "Προσωπική ιστορία της Ελισσάβετ Στάθη — εμπνέει εμπιστοσύνη" },
  { icon: MapPin,        title: "Τοπική Παρουσία",     desc: "Εδρεύει Καλλιθέα — local SEO στοχευμένο" },
  { icon: Star,          title: "Dual CTA Hero",        desc: "«Επικοινωνήστε Μαζί μας» + «Υπηρεσίες» — 2 κανάλια μετατροπής" },
  { icon: Briefcase,     title: "Υπηρεσίες",            desc: "Αναλυτική σελίδα υπηρεσιών web design" },
  { icon: Globe,         title: "Mobile-First",         desc: "Πλήρως responsive σε κινητό, tablet, desktop" },
  { icon: Phone,         title: "Click-to-Call",        desc: "Άμεση κλήση από navbar για επικοινωνία" },
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

export default function PortfolioBsNaomi() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: BsNaomi.gr — Κατασκευή Site Ψηφιακών Λύσεων | HiTech Doctor"
        description="Case study: Κατασκευή του BsNaomi.gr — site ολοκληρωμένων λύσεων διαδικτύου. SEO 97/100, Accessibility 96/100, FCP 1.1s, WCAG compliant. Web Design από HiTech Doctor."
        keywords="bsnaomi, κατασκευη site καλλιθεα, web design αθηνα, ψηφιακες λυσεις, Ελισσάβετ Στάθη"
        url="https://hitechdoctor.com/portfolio/bsnaomi-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "BsNaomi.gr — Ολοκληρωμένες Λύσεις Διαδικτύου",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://bsnaomi.gr",
          "description": "Site ψηφιακών λύσεων στην Καλλιθέα από την Ελισσάβετ Στάθη",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #030a08 0%, #071510 50%, #030a06 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">BsNaomi.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">Ψηφιακές Λύσεις</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                BsNaomi<span className="text-pink-400">.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">«Ολοκληρωμένες Λύσεις Διαδικτύου»</strong> — site της Ελισσάβετ Στάθη
                από Καλλιθέα για υπηρεσίες ψηφιακής παρουσίας σε επαγγελματίες και επιχειρήσεις.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Minimalist clean design σε λευκό φόντο με dark green CTA, WCAG accessibility button
                στο navbar, φόρμα επικοινωνίας GDPR — και εξαιρετικό Lighthouse Accessibility 96/100.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://bsnaomi.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #1a5c3a, #2d7a52)", color: "#fff", boxShadow: "0 0 20px rgba(45,122,82,0.35)" }}
                    data-testid="button-bsnaomi-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-pink-500/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-pink-500/15"
              style={{ background: "rgba(236,72,153,0.03)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl border border-pink-500/20 bg-pink-500/5 flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-pink-400 shrink-0" />
                <p className="text-xs text-pink-300">
                  <strong>Accessibility 96/100</strong> — από τα κορυφαία scores στο web design
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Minimalist clean design — λευκό φόντο, σκούρο πράσινο, bold typography.
              Μοντέρνο, επαγγελματικό, εύκολο στην πλοήγηση.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-pink-500/25 transition-all">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground font-mono">bsnaomi.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`BsNaomi.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-white/6">
                  <span className="text-xs font-mono text-pink-500/60">{page.path || "/"}</span>
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Το minimal design του BsNaomi.gr αποδίδει <strong className="text-foreground">εξαιρετική ταχύτητα</strong> —
              λιγότερα assets, γρηγορότερη φόρτωση.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4 text-pink-400" />
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
              <p className="text-sm font-bold text-emerald-300 mb-1">Minimal Design = Μέγιστη Ταχύτητα</p>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Ο καθαρός κώδικας χωρίς WordPress bloat οδηγεί σε
                <strong className="text-emerald-400"> FCP 1.1s</strong> — ο χρήστης βλέπει περιεχόμενο σχεδόν στιγμιαία.
                Κρίσιμο για πρώτη εντύπωση σε B2B επαφές που επισκέπτονται το site από laptop.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Site που προσφέρει web services — <strong className="text-foreground">η ασφάλεια είναι αντικατοπτρισμός της ίδιας επιχείρησης</strong>.
              Υψηλά standards.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-pink-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-pink-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO <strong className="text-foreground">97/100</strong> — από τα κορυφαία δυνατά scores.
              Επιχειρήσεις που ψάχνουν ψηφιακές λύσεις στην Αθήνα βρίσκουν το BsNaomi.
            </p>
          </div>
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Λέξεις-κλειδιά στόχος</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-500/25 bg-pink-500/8 text-xs text-pink-400 font-medium">
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-pink-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-pink-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Χειροποίητος κώδικας χωρίς WordPress — γρήγορο, ασφαλές, WCAG accessible,
              ιδανικό για επαγγελματική παρουσία B2B.
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 mb-2">Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRAS.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-pink-500/20 transition-all">
                <f.icon className="w-4 h-4 text-pink-400 mb-2" />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accessibility spotlight ─────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-pink-500/20"
          style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(45,122,82,0.04) 100%)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">WCAG Accessibility — 96/100</h3>
              <p className="text-xs text-muted-foreground">Ένα από τα χαρακτηριστικά που ξεχωρίζουν το BsNaomi.gr</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Contrast Ratio",  desc: "Χρώματα κειμένου σε WCAG AA/AAA contrast ratio" },
              { title: "ARIA Labels",     desc: "Όλα τα interactive στοιχεία έχουν accessible labels" },
              { title: "Keyboard Nav",    desc: "Πλήρης πλοήγηση με πληκτρολόγιο χωρίς ποντίκι" },
            ].map((a) => (
              <div key={a.title} className="p-4 rounded-2xl border border-pink-500/15 bg-pink-500/5">
                <p className="text-sm font-bold text-pink-300 mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-pink-500/20"
          style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(45,122,82,0.05) 100%)" }}
        >
          <Briefcase className="w-12 h-12 text-pink-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(236,72,153,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε sites για επαγγελματίες και επιχειρήσεις που θέλουν επαγγελματική
            παρουσία — minimal design, SEO 97+, accessibility, GDPR.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #be185d, #ec4899)", boxShadow: "0 0 24px rgba(236,72,153,0.3)" }}
                data-testid="button-bsnaomi-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-pink-500/30 hover:border-pink-400 gap-2 text-pink-400">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-pink-400 transition-colors">
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
