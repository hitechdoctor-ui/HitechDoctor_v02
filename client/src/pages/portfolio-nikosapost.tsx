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
  Wrench, HelpCircle, BookOpen,
} from "lucide-react";
import screenshotHero     from "@assets/Screenshot_2026-03-11_at_13.41.03_1773229304723.png";
import screenshotServices from "@assets/Screenshot_2026-03-11_at_13.41.15_1773229304723.png";
import screenshotContact  from "@assets/Screenshot_2026-03-11_at_13.41.26_1773229304723.png";
import screenshotFaq      from "@assets/Screenshot_2026-03-11_at_13.41.34_1773229304724.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 91, color: "#f97316" },
  { label: "SEO",            score: 98, color: "#f97316" },
  { label: "Accessibility",  score: 93, color: "#f97316" },
  { label: "Best Practices", score: 92, color: "#f97316" },
];

const VITALS = [
  { metric: "FCP",  value: "1.2s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.1s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.01",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "19ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.5s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "1.8s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const BADGES = [
  "Service Χωρίς Περιττά",
  "Παραλαβή σε 24 ώρες*",
  "Google Maps Verified",
];

const SEO_KEYWORDS = [
  "service αυτοκινήτου πειραιάς",
  "μηχανικός αυτοκινήτων πειραιάς",
  "διάγνωση κινητήρα πειραιάς",
  "nikosapost",
  "νίκος αποστολόπουλος",
  "auto service πειραιάς",
  "ΚΤΕΟ πειραιάς",
  "car service piraeus",
];

const PAGES = [
  { path: "/", title: "Hero — Service χωρίς άγχος", desc: "Hero με contact card δεξιά (διεύθυνση, τηλέφωνο, email, Google Maps), 3 trust badges, dual CTA, bilingual EL/EN", screenshot: screenshotHero },
  { path: "/ypiresies", title: "Υπηρεσίες Auto Service", desc: "3 service cards: Διάγνωση κινητήρα, Service λαδιών & φίλτρων, Φρένα & ανάρτηση — με real photos", screenshot: screenshotServices },
  { path: "/epikoinonia", title: "Επικοινωνία + Google Maps", desc: "4.9★ (50 reviews), Google Maps embed, πλήρη στοιχεία επιχείρησης, CTAs Κλήση + Email", screenshot: screenshotContact },
  { path: "/erotiseis", title: "FAQ — Συχνές Ερωτήσεις", desc: "6 FAQ accordion: χρόνος service, προσφορά πριν φέρεις, ανταλλακτικά, ΚΤΕΟ, ενημέρωση, ραντεβού online", screenshot: screenshotFaq },
];

const TECH_STACK = [
  { name: "HTML5 / CSS3",     desc: "Dark navy design με orange accents, bold tech-style typography, trust badges",           icon: FileCode,  color: "text-orange-400" },
  { name: "JavaScript ES6+",  desc: "FAQ accordion, Google Maps embed, contact form, EL/EN language switcher",                icon: Code2,     color: "text-yellow-300" },
  { name: "Custom Design",    desc: "100% custom — δεν είναι WordPress, δεν είναι template — καθαρός ελαφρύς κώδικας",       icon: Layers,    color: "text-orange-400" },
  { name: "Google Maps",      desc: "Ενσωματωμένος χάρτης + direct «Άνοιγμα στο Google Maps» link για πλοήγηση",            icon: MapPin,    color: "text-orange-400" },
  { name: "Bilingual EL/EN",  desc: "Language switcher EL/EN στο navbar — εξυπηρέτηση και ξένων πελατών στον Πειραιά",       icon: Languages, color: "text-orange-400" },
  { name: "WhatsApp + Call",  desc: "WhatsApp button + «Τηλέφωνο τώρα» — άμεση επικοινωνία από κινητό",                      icon: MessageSquare, color: "text-orange-400" },
];

const SEO_FEATURES = [
  { title: "LocalBusiness Schema",   desc: "AutoRepair JSON-LD: Μαρίας Χατζηκυριακού 35, Πειραιάς 18539, τηλέφωνο, ώρες — Google Maps και Rich Results.", icon: MapPin },
  { title: "SEO 98/100 — Κορυφαίο", desc: "Το υψηλότερο Lighthouse SEO score στο portfolio μας — βελτιστοποιημένα meta, headings, alt texts, structured data.", icon: Search },
  { title: "FAQ Schema",             desc: "6 ερωτήσεις πελατών ως FAQ Schema — εμφανίζονται απευθείας στα Google αποτελέσματα, αυξάνουν CTR.", icon: HelpCircle },
  { title: "Google Maps Verified",   desc: "«Google Maps Verified» badge στο hero — εμπιστοσύνη από πρώτη ματιά, βελτιώνει local SEO.", icon: CheckCircle2 },
  { title: "Review Schema",          desc: "4.9★ με 50 κριτικές Google — εμφανίζεται με αστεράκια στα αποτελέσματα αναζήτησης.", icon: Star },
  { title: "Bilingual Meta Tags",    desc: "Meta tags σε EL + EN με hreflang — η Google δείχνει τη σωστή γλώσσα ανά χρήστη.", icon: Languages },
  { title: "Blog / Άρθρα",           desc: "Blog section για SEO content — άρθρα για service, ΚΤΕΟ, ανταλλακτικά — φέρνουν organic traffic.", icon: BookOpen },
  { title: "Core Web Vitals",        desc: "FCP 1.2s, LCP 2.1s — εξαιρετική ταχύτητα για mobile users που ψάχνουν μηχανικό.", icon: Gauge },
];

const SECURITY = [
  { title: "SSL Certificate A+",        desc: "HTTPS enforced — επαγγελματικό auto service απαιτεί trust. «Not Secure» αποτρέπει κλήσεις.", icon: Lock },
  { title: "HTTPS Redirects",           desc: "Αυτόματη ανακατεύθυνση HTTP → HTTPS σε κάθε σελίδα.", icon: Shield },
  { title: "GDPR Privacy",              desc: "Privacy Policy — συμμόρφωση GDPR για στοιχεία πελατών που ζητούν ραντεβού online.", icon: CheckCircle2 },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Καθαρός custom κώδικας — μηδέν plugin vulnerabilities.", icon: Shield },
  { title: "Security Headers",          desc: "CSP, X-Frame-Options, X-Content-Type-Options headers.", icon: Code2 },
  { title: "Cloudflare Protection",     desc: "DDoS mitigation, bot filtering, γρήγορη φόρτωση φωτογραφιών εργασιών.", icon: Server },
];

const EXTRAS = [
  { icon: Car,          title: "Contact Card στο Hero",    desc: "Διεύθυνση, τηλέφωνο, email, Google Maps απευθείας στο hero" },
  { icon: HelpCircle,   title: "FAQ Page",                 desc: "6 ερωτήσεις accordion — μειώνει κλήσεις για απλές απορίες" },
  { icon: Star,         title: "4.9★ Google Reviews",      desc: "50 κριτικές — εμφανίζονται με αστεράκια στη Google" },
  { icon: MapPin,       title: "Google Maps Embed",        desc: "Live χάρτης με «Άνοιγμα στο Google Maps» για πλοήγηση" },
  { icon: Languages,    title: "Bilingual EL/EN",          desc: "Language switcher — εξυπηρέτηση ξένων στον Πειραιά" },
  { icon: MessageSquare,title: "WhatsApp Button",          desc: "Floating WhatsApp button για άμεση επικοινωνία" },
  { icon: BookOpen,     title: "Blog Section",             desc: "Άρθρα για organic SEO traffic" },
  { icon: Calendar,     title: "Online Ραντεβού",          desc: "«Κλείσε ραντεβού online» — FAQ + CTA" },
];

const SERVICES = [
  { icon: "🔧", name: "Διάγνωση κινητήρα",      desc: "Αναλυτική διάγνωση" },
  { icon: "🛢️", name: "Service λαδιών & φίλτρων", desc: "Αλλαγή λαδιών + φίλτρα" },
  { icon: "🛑", name: "Φρένα & ανάρτηση",        desc: "Έλεγχος + αντικατάσταση" },
  { icon: "🚗", name: "ΚΤΕΟ",                    desc: "Έλεγχος πριν ΚΤΕΟ" },
  { icon: "🔩", name: "Ανταλλακτικά",            desc: "Γνήσια & ισοδύναμα" },
  { icon: "📱", name: "Ενημέρωση επισκευής",     desc: "Live updates στάδιο" },
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

export default function PortfolioNikosapost() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: nikosapost.gr — Κατασκευή Site Auto Service | HiTech Doctor"
        description="Case study: nikosapost.gr — Νίκος Αποστολόπουλος Auto Service Πειραιάς. SEO 98/100, FAQ Schema, Google Maps Verified, 4.9★ reviews, bilingual EL/EN. Web Design από HiTech Doctor."
        keywords="nikosapost, κατασκευη site συνεργειο, web design πειραιας, seo auto service, αποστολοπουλος service"
        url="https://hitechdoctor.com/portfolio/nikosapost-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "nikosapost.gr — Νίκος Αποστολόπουλος Auto Service",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://nikosapost.gr",
          "description": "Site συνεργείου αυτοκινήτων στον Πειραιά — bilingual, FAQ Schema, Google Maps, 4.9★",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #050a14 0%, #0a1428 50%, #050a14 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">nikosapost.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold uppercase tracking-widest">Auto Service</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                nikosapost<span className="text-orange-400">.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Νίκος Αποστολόπουλος Auto Service</strong> —
                «φροντίζουμε το αυτοκίνητο ώστε να κινείσαι χωρίς άγχος». Πειραιάς, 4.9★ στη Google.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Dark navy + orange design, bilingual EL/EN, contact card στο hero,
                FAQ page με 6 ερωτήσεις, Blog, WhatsApp button, Google Maps embed.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                {BADGES.map((b) => (
                  <span key={b} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/8 text-orange-300">{b}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="https://nikosapost.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #c2410c, #f97316)", color: "#fff", boxShadow: "0 0 20px rgba(249,115,22,0.35)" }}
                    data-testid="button-nikosapost-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-orange-500/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-orange-500/20"
              style={{ background: "rgba(249,115,22,0.04)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-400 shrink-0" />
                <p className="text-xs text-orange-300">
                  <strong>SEO 98/100</strong> — το κορυφαίο score στο portfolio μας
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Dark navy με orange accents — σοβαρό, τεχνικό, επαγγελματικό.
              Ο πελάτης καταλαβαίνει αμέσως ότι έχει να κάνει με ειδικούς.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-orange-500/25 transition-all">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground font-mono">nikosapost.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`nikosapost.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-white/6">
                  <span className="text-xs font-mono text-orange-500/60">{page.path || "/"}</span>
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Εξαιρετική ταχύτητα παρά το Google Maps embed και τις φωτογραφίες υπηρεσιών —
              <strong className="text-foreground"> FCP 1.2s</strong>, ο χρήστης βλέπει το site σχεδόν στιγμιαία.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{v.metric}</span>
                  </div>
                  <VitalBadge status={v.status} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-start gap-4">
            <BarChart3 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-300 mb-1">Γιατί η ταχύτητα έχει σημασία για συνεργείο</p>
              <p className="text-xs text-orange-100/70 leading-relaxed">
                Κάποιος με χαλασμένο αυτοκίνητο ψάχνει <strong className="text-orange-400">τώρα</strong>, από κινητό,
                δίπλα στον δρόμο. FCP 1.2s σημαίνει ότι βλέπει το τηλέφωνο σε λιγότερο από 2 δευτερόλεπτα.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Συνεργείο που ζητά online ραντεβού και email —
              <strong className="text-foreground"> η ασφάλεια κτίζει εμπιστοσύνη</strong>.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-orange-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-orange-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO <strong className="text-foreground">98/100</strong> — το υψηλότερο score στο portfolio μας.
              FAQ Schema + LocalBusiness AutoRepair + Google Reviews.
            </p>
          </div>
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Λέξεις-κλειδιά στόχος</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/8 text-xs text-orange-400 font-medium">
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-orange-500/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-orange-400" />
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Custom κώδικας — ελαφρύ, γρήγορο, χωρίς WordPress bloat.
              Όπως ένα σωστό service αυτοκινήτου — τίποτα περιττό, τα πάντα λειτουργικά.
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
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRAS.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-orange-500/20 transition-all">
                <f.icon className="w-4 h-4 text-orange-400 mb-2" />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Services grid ────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-orange-500/20"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(15,23,42,0.5) 100%)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500/60 mb-5">Υπηρεσίες — Ξεχωριστή Σελίδα για Κάθε Μία</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SERVICES.map((s) => (
              <div key={s.name} className="p-3 rounded-2xl border border-orange-500/15 bg-orange-500/5 text-center">
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <p className="text-xs font-bold text-white leading-tight">{s.name}</p>
                <p className="text-[9px] text-orange-400/70 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact info ────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-orange-500/20"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(15,23,42,0.5) 100%)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-yellow-400" />
            <p className="text-sm font-bold text-white">4.9★ Google Reviews (50 κριτικές) — Στοιχεία Επιχείρησης</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { icon: Phone,   label: "Τηλέφωνο", value: "+30 210 451 8777" },
              { icon: Mail,    label: "Email",     value: "info@nikosapost.gr" },
              { icon: MapPin,  label: "Διεύθυνση", value: "Μαρίας Χατζηκυριακού 35" },
              { icon: MapPin,  label: "Πόλη",      value: "Πειραιάς 18539" },
            ].map((c) => (
              <div key={c.label} className="p-4 rounded-2xl border border-orange-500/15 bg-orange-500/5">
                <c.icon className="w-4 h-4 text-orange-400 mb-2" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{c.label}</p>
                <p className="text-xs font-bold text-white">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-orange-500/20"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(15,23,42,0.6) 100%)" }}
        >
          <Wrench className="w-12 h-12 text-orange-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(249,115,22,0.5))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε sites για συνεργεία, μηχανικούς και επιχειρήσεις αυτοκινήτων —
            FAQ Schema, Google Maps, WhatsApp, bilingual, SEO 98+.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #c2410c, #f97316)", boxShadow: "0 0 24px rgba(249,115,22,0.35)" }}
                data-testid="button-nikosapost-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-orange-500/30 hover:border-orange-400 gap-2 text-orange-400">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-orange-400 transition-colors">
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
