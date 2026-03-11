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
  BookOpen, Users, Star, Heart, Calendar,
} from "lucide-react";
import screenshotHero     from "@assets/Screenshot_2026-03-11_at_13.26.17_1773228953996.png";
import screenshotAbout    from "@assets/Screenshot_2026-03-11_at_13.26.40_1773228953996.png";
import screenshotParoxes  from "@assets/Screenshot_2026-03-11_at_13.26.53_1773228953996.png";
import screenshotTmimata  from "@assets/Screenshot_2026-03-11_at_13.27.07_1773228953996.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 87, color: "#22c55e" },
  { label: "SEO",            score: 95, color: "#22c55e" },
  { label: "Accessibility",  score: 91, color: "#22c55e" },
  { label: "Best Practices", score: 94, color: "#22c55e" },
];

const VITALS = [
  { metric: "FCP",  value: "1.5s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.8s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.03",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "25ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.6s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "2.2s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const SEO_KEYWORDS = [
  "παιδικός σταθμός αθήνα",
  "βρεφικός σταθμός αθήνα",
  "κέντρο προσχολικής αγωγής",
  "κολύμβηση παιδιά αθήνα",
  "παιδικός σταθμός με πισίνα",
  "louloudotopos",
  "βιωματική μάθηση παιδιά",
  "preschool athens",
];

const PAGES = [
  { path: "/", title: "Αρχική Hero", desc: "Full-width hero με φωτογραφίες παιδικών ζωγραφιών, animated CTA κουμπί", screenshot: screenshotHero },
  { path: "/about", title: "Καλώς ήρθατε", desc: "Ιστορία 33 χρόνων, φιλοσοφία βιωματικής μάθησης, νεοκλασικό κτίριο", screenshot: screenshotAbout },
  { path: "/Paroxes.html", title: "Παροχές", desc: "Dropdown menu: Κολύμβηση, Αθλοπαιδιές, Μουσικοκινητική, Θεατρικό Παιχνίδι, Yoga, Διατροφή", screenshot: screenshotParoxes },
  { path: "/tmimata", title: "Τμήματα", desc: "Βρεφικό (12μ-2 ετών), Νηπιακό, Προνήπιο — με φωτογραφίες από τα τμήματα", screenshot: screenshotTmimata },
];

const TECH_STACK = [
  { name: "HTML5 / CSS3",    desc: "Semantic markup, playful green palette, rounded modern UI", icon: FileCode, color: "text-green-400" },
  { name: "JavaScript ES6+", desc: "Dropdown navigation, scroll animations, responsive gallery",  icon: Code2,     color: "text-yellow-300" },
  { name: "Custom Design",   desc: "Αποκλειστικό σχέδιο — όχι WordPress, όχι templates",         icon: Layers,    color: "text-emerald-400" },
  { name: "Google Maps",     desc: "Ενσωματωμένος χάρτης με τοποθεσία παιδικού σταθμού",         icon: MapPin,    color: "text-green-400" },
  { name: "SSL / HTTPS",     desc: "Let's Encrypt certificate, HTTPS enforced σε όλες τις σελίδες", icon: Lock,   color: "text-emerald-400" },
  { name: "Mobile-First",    desc: "Γονείς ψάχνουν από κινητό — πλήρως responsive layout",       icon: Smartphone, color: "text-sky-400" },
];

const SEO_FEATURES = [
  { title: "LocalBusiness Schema",  desc: "JSON-LD markup τύπου ChildCare: τοποθεσία, ηλικίες, ώρες λειτουργίας — εμφανίζεται στα Google Rich Results με αστεράκια.", icon: MapPin },
  { title: "Unique Meta Tags",      desc: "Κάθε σελίδα (Κολύμβηση, Αθλοπαιδιές, Τμήματα...) έχει δικό του title & meta description βελτιστοποιημένο.", icon: Search },
  { title: "OpenGraph / Social",    desc: "Κοινοποίηση στο Facebook/Instagram με preview — βασικό για σχολεία που στηρίζονται στη word-of-mouth.", icon: Globe },
  { title: "Structured Program",    desc: "Κάθε πρόγραμμα/δραστηριότητα έχει δικό του URL — π.χ. /kolymvisi, /mousikokinhti — βελτιώνει την αναζήτηση.", icon: BookOpen },
  { title: "Core Web Vitals",       desc: "LCP 2.8s — εντός ορίων παρά τις πολλές φωτογραφίες δραστηριοτήτων, χάρη σε lazy loading.", icon: Gauge },
  { title: "XML Sitemap",           desc: "Αυτόματο sitemap που καλύπτει όλες τις σελίδες υπηρεσιών — η Google ανακαλύπτει νέο περιεχόμενο άμεσα.", icon: FileCode },
  { title: "FAQ Schema",            desc: "Συχνές ερωτήσεις γονέων (ηλικίες, κόστος, ώρες) σε FAQ Schema — εμφανίζονται απευθείας στη Google.", icon: CheckCircle2 },
  { title: "Image Alt Texts",       desc: "Κάθε φωτογραφία παιδικής δραστηριότητας έχει descriptive alt text — SEO + accessibility.", icon: Eye },
];

const SECURITY = [
  { title: "SSL Certificate A+",        desc: "Κρυπτογραφημένη σύνδεση — απαραίτητο για site που αφορά παιδιά και εμπιστοσύνη γονέων.", icon: Lock },
  { title: "HTTPS Enforced",            desc: "Αυτόματη ανακατεύθυνση HTTP → HTTPS σε όλες τις σελίδες χωρίς εξαίρεση.", icon: Shield },
  { title: "GDPR / Cookies",            desc: "Cookie banner, Privacy Policy — συμμόρφωση με ευρωπαϊκή νομοθεσία για site που αφορά ανηλίκους.", icon: CheckCircle2 },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Καθαρός custom κώδικας — μηδέν vulnerabilities από plugins τρίτων.", icon: Shield },
  { title: "Security Headers",          desc: "CSP, X-Frame-Options, X-Content-Type-Options — προστασία από κοινές επιθέσεις.", icon: Code2 },
  { title: "Cloudflare Protection",     desc: "DDoS mitigation, bot filtering, γρήγορο CDN για φόρτωση φωτογραφιών.", icon: Server },
];

const EXTRAS = [
  { icon: Users,    title: "Τμήματα ανά ηλικία", desc: "Βρεφικό (12μ-2ετ), Νηπιακό, Προνήπιο — με ξεχωριστές σελίδες" },
  { icon: BookOpen, title: "Παροχές Dropdown",   desc: "6 δραστηριότητες με αναλυτικές σελίδες η κάθε μία" },
  { icon: Calendar, title: "Πρόγραμμα",           desc: "Online πρόσβαση στο εβδομαδιαίο πρόγραμμα του σταθμού" },
  { icon: Phone,    title: "Click-to-Call",       desc: "Άμεση κλήση από navbar — ένα tap από κινητό" },
  { icon: Mail,     title: "Επικοινωνία",         desc: "Φόρμα εγγραφής & επικοινωνίας για νέους γονείς" },
  { icon: MapPin,   title: "Google Maps",         desc: "Ενσωματωμένος χάρτης τοποθεσίας" },
  { icon: Heart,    title: "Child-friendly UX",  desc: "Παιχνιδιάρικο design που εμπνέει εμπιστοσύνη σε γονείς" },
  { icon: Star,     title: "CTA Ξεκίνα τώρα",    desc: "Εμφανές CTA κουμπί σε κάθε σελίδα για άμεση εγγραφή" },
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

export default function PortfolioLouloudotopos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: louloudotopos.com.gr — Κατασκευή Site Παιδικού Σταθμού | HiTech Doctor"
        description="Case study: Κατασκευή του louloudotopos.com.gr — site κέντρου προσχολικής αγωγής με SEO 95/100, πισίνα, 6 παροχές, τμήματα ανά ηλικία, LocalBusiness schema. Web Design από HiTech Doctor."
        keywords="louloudotopos, κατασκευη site παιδικου σταθμου, web design αθηνα παιδικος, seo βρεφικος σταθμος"
        url="https://hitechdoctor.com/portfolio/louloudotopos"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "louloudotopos.com.gr — Κέντρο Προσχολικής Αγωγής",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://louloudotopos.com.gr",
          "description": "Site κέντρου προσχολικής αγωγής 33 χρόνων",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #030d05 0%, #061508 50%, #030c04 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">louloudotopos.com.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold uppercase tracking-widest">Παιδικός Σταθμός</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                louloudotopos<span className="text-green-400">.com.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Κέντρο προσχολικής αγωγής με 33 χρόνια ιστορίας</strong> σε νεοκλασικό κτίριο
                με καταπράσινο κήπο. Βιωματική μάθηση, κολύμβηση, αθλοπαιδιές και 6 δραστηριότητες.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Modern playful design σε πράσινο χρώμα, dropdown navigation ανά κατηγορία,
                ξεχωριστές σελίδες για κάθε τμήμα και δραστηριότητα — ιδανικό για SEO.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://louloudotopos.com.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}
                    data-testid="button-louloudotopos-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-green-500/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-green-500/15"
              style={{ background: "rgba(34,197,94,0.03)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-4">Μετρήθηκε με Google Lighthouse · Desktop mode</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Φρέσκο πράσινο design που αναπνέει ζωή — ταιριαστό με τον κήπο και τις δραστηριότητες.
              Φιλικό στους γονείς, ξεκάθαρη πλοήγηση με dropdowns.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-green-500/25 transition-all">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground/60 font-mono">louloudotopos.com.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`louloudotopos.com.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-white/6">
                  <span className="text-xs font-mono text-green-500/60">{page.path || "/"}</span>
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Site με πολλές φωτογραφίες δραστηριοτήτων και παιδιών — παραμένει γρήγορο
              χάρη σε <strong className="text-foreground">lazy loading</strong> και βελτιστοποιημένες εικόνες.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{v.metric}</span>
                  </div>
                  <VitalBadge status={v.status} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5 flex items-start gap-4">
            <BarChart3 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-300 mb-1">Γιατί έχει σημασία για έναν παιδικό σταθμό</p>
              <p className="text-xs text-green-100/70 leading-relaxed">
                Οι γονείς ψάχνουν από κινητό ενώ βρίσκονται εν κινήσει. Ένα site που φορτώνει σε
                <strong className="text-green-400"> &lt;3 δευτερόλεπτα</strong> αυξάνει σημαντικά τις πιθανότητες να μείνουν
                στο site και να στείλουν αίτηση εγγραφής.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Site που αφορά παιδιά και γονείς — απαιτείται <strong className="text-foreground">υψηλό επίπεδο ασφάλειας</strong>
              και GDPR συμμόρφωση για δεδομένα ανηλίκων.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-green-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-green-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO <strong className="text-foreground">95/100</strong>. Γονείς που ψάχνουν παιδικό σταθμό
              στην Αθήνα βρίσκουν το Λουλουδότοπο στα πρώτα αποτελέσματα.
            </p>
          </div>
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Λέξεις-κλειδιά στόχος</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/25 bg-green-500/8 text-xs text-green-400 font-medium">
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-green-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-green-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Custom χειροποίητος κώδικας χωρίς WordPress — πλήρης έλεγχος σχεδιασμού
              για να ταιριάζει με το παιχνιδιάρικο brand του Λουλουδότοπου.
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRAS.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-green-500/20 transition-all">
                <f.icon className="w-4 h-4 text-green-400 mb-2" />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activities highlight ─────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-green-500/15 bg-green-500/4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-green-500/60 mb-5">Δραστηριότητες — Ξεχωριστή Σελίδα για Κάθε Μία</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "🏊", name: "Κολύμβηση",               desc: "1x εβδομάδα" },
              { icon: "⚽", name: "Αθλοπαιδιές",             desc: "Κινητικότητα" },
              { icon: "🎵", name: "Μουσικοκινητική",         desc: "Ήχος & κίνηση" },
              { icon: "🎭", name: "Θεατρικό Παιχνίδι",       desc: "Δημιουργικότητα" },
              { icon: "🧘", name: "Παιδική Yoga",             desc: "Αγχόλυση" },
              { icon: "🥗", name: "Διατροφή",                 desc: "Υγιεινές συνήθειες" },
            ].map((a) => (
              <div key={a.name} className="p-3 rounded-2xl border border-green-500/15 bg-green-500/5 text-center">
                <div className="text-2xl mb-1.5">{a.icon}</div>
                <p className="text-xs font-bold text-white">{a.name}</p>
                <p className="text-[9px] text-green-400/70 mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-green-500/20"
          style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(16,185,129,0.04) 100%)" }}
        >
          <Heart className="w-12 h-12 text-green-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(34,197,94,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε sites για εκπαιδευτικά κέντρα, παιδικούς σταθμούς και επιχειρήσεις
            με παιχνιδιάρικο χαρακτήρα — SEO, ταχύτητα και design που εμπνέει εμπιστοσύνη.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}
                data-testid="button-louloudotopos-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-green-500/30 hover:border-green-400 gap-2 text-green-400">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-green-400 transition-colors">
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
