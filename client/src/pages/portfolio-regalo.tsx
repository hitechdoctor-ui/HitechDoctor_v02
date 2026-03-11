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
  FileCode, Layers, Eye, Mail, Phone, ShoppingBag, Image,
  BookOpen, Filter, CreditCard, Heart,
} from "lucide-react";
import screenshotHome     from "@assets/Screenshot_2026-03-11_at_13.18.39_1773228083914.png";
import screenshotEshop    from "@assets/Screenshot_2026-03-11_at_13.18.55_1773228083914.png";
import screenshotGallery  from "@assets/Screenshot_2026-03-11_at_13.19.06_1773228083914.png";
import screenshotContact  from "@assets/Screenshot_2026-03-11_at_13.19.19_1773228083915.png";

// ── Lighthouse ────────────────────────────────────────────────────────────────
const LIGHTHOUSE = [
  { label: "Performance",    score: 88, color: "#22c55e" },
  { label: "SEO",            score: 96, color: "#22c55e" },
  { label: "Accessibility",  score: 92, color: "#22c55e" },
  { label: "Best Practices", score: 93, color: "#22c55e" },
];

// ── Core Web Vitals ───────────────────────────────────────────────────────────
const VITALS = [
  { metric: "FCP",  value: "1.4s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.6s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.04",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "22ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.5s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "2.1s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

// ── SEO keywords ──────────────────────────────────────────────────────────────
const SEO_KEYWORDS = [
  "κοσμήματα μοσχάτο",
  "αξεσουάρ αθήνα",
  "κολιέ ασήμι αθήνα",
  "τσάντες μοσχάτο",
  "κοσμήματα eshop αθήνα",
  "regalo κοσμήματα",
  "jewellery athens",
  "πορτοφόλια αξεσουάρ",
];

// ── Pages ─────────────────────────────────────────────────────────────────────
const PAGES = [
  { path: "/", title: "Αρχική", desc: "Elegant hero με cursive logo, κατηγορία προϊόντων, χρωματολογία cream/gold", screenshot: screenshotHome },
  { path: "/eshop", title: "eShop", desc: "Κατάλογος προϊόντων ανά κατηγορία — Κοσμήματα, Τσάντες, Αξεσουάρ", screenshot: screenshotEshop },
  { path: "/gallery", title: "Gallery", desc: "Φωτογραφικό portfolio με live filter — Όλα / Κοσμήματα / Τσάντες / Πορτοφόλια", screenshot: screenshotGallery },
  { path: "/contact", title: "Επικοινωνία", desc: "Στοιχεία επαφής, διεύθυνση Μοσχάτο, ενσωματωμένος Google Maps", screenshot: screenshotContact },
];

// ── Tech stack ────────────────────────────────────────────────────────────────
const TECH_STACK = [
  { name: "HTML5 / CSS3",    desc: "Semantic markup, elegant typography, gold/cream παλέτα χρωμάτων", icon: FileCode, color: "text-amber-400" },
  { name: "JavaScript ES6+", desc: "Gallery filter animation, smooth scroll, lazy loading εικόνων",    icon: Code2,     color: "text-yellow-300" },
  { name: "Custom CSS",      desc: "Χειροποίητο design — καμία χρήση WordPress ή page builder",         icon: Layers,    color: "text-rose-400" },
  { name: "Google Maps API", desc: "Ενσωματωμένος χάρτης τοποθεσίας στη σελίδα Επικοινωνία",          icon: MapPin,    color: "text-emerald-400" },
  { name: "SSL / HTTPS",     desc: "Let's Encrypt certificate, HTTPS enforced, HSTS header",            icon: Lock,      color: "text-emerald-400" },
  { name: "Responsive",      desc: "Mobile-first design — 70%+ επισκεπτών από κινητό",                 icon: Smartphone, color: "text-sky-400" },
];

// ── SEO features ──────────────────────────────────────────────────────────────
const SEO_FEATURES = [
  { title: "LocalBusiness Schema",   desc: "JSON-LD markup: κατηγορία JewelryStore, τοποθεσία Μοσχάτο, ώρες λειτουργίας — εμφανίζεται στα Google Rich Results.", icon: MapPin },
  { title: "Product Schema",         desc: "Κάθε προϊόν έχει δικό του Schema με τίτλο, τιμή και κατηγορία — η Google εμφανίζει αποτελέσματα με τιμή απευθείας στην αναζήτηση.", icon: ShoppingBag },
  { title: "OpenGraph Tags",         desc: "Κοινοποίηση στο Facebook/Instagram: εμφανίζεται preview με εικόνα κοσμήματος, τίτλο και τιμή — ιδανικό για social media marketing.", icon: Globe },
  { title: "Canonical URLs",         desc: "Κάθε σελίδα, κατηγορία και προϊόν έχει μοναδικό URL — αποφυγή duplicate content στα αποτελέσματα Google.", icon: CheckCircle2 },
  { title: "XML Sitemap",            desc: "Αυτόματο sitemap.xml — η Google ανακαλύπτει νέα προϊόντα και σελίδες άμεσα.", icon: FileCode },
  { title: "Image Alt Texts",        desc: "Κάθε φωτογραφία έχει περιγραφικό alt text — βοηθά στη Google Images και βελτιώνει την Accessibility.", icon: Image },
  { title: "Bilingual (GR/EN)",      desc: "Ελληνική & αγγλική έκδοση με hreflang tags — απευθύνεται και σε αγγλόφωνους επισκέπτες.", icon: Languages },
  { title: "Core Web Vitals",        desc: "LCP 2.6s, CLS 0.04 — παρόλο που φορτώνει πολλές φωτογραφίες, παραμένει εντός ορίων Google για καλό ranking.", icon: Gauge },
];

// ── Security ──────────────────────────────────────────────────────────────────
const SECURITY = [
  { title: "SSL Certificate A+",        desc: "Κρυπτογραφημένη σύνδεση TLS 1.3 — εμπιστοσύνη για online αγορές.", icon: Lock },
  { title: "HTTPS Enforced",            desc: "Κάθε HTTP request ανακατευθύνεται αυτόματα σε HTTPS — αδύνατη η πρόσβαση χωρίς κρυπτογράφηση.", icon: Shield },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Καθαρός κώδικας — μηδέν plugin vulnerabilities, μηδέν WooCommerce exploits.", icon: Shield },
  { title: "GDPR Compliant",            desc: "Cookie consent, Privacy Policy, δεν αποθηκεύονται δεδομένα καρτών — επικοινωνία μέσω email/τηλεφώνου.", icon: CheckCircle2 },
  { title: "Security Headers",          desc: "X-Frame-Options, X-Content-Type-Options, Referrer-Policy — προστασία από κοινές επιθέσεις.", icon: Code2 },
  { title: "Cloudflare CDN",            desc: "Προστασία DDoS, Web Application Firewall, caching εικόνων για ταχύτητα.", icon: Server },
];

// ── Extra features ────────────────────────────────────────────────────────────
const EXTRAS = [
  { icon: Filter,      title: "Gallery Filter",      desc: "Live JavaScript φιλτράρισμα — Κοσμήματα / Τσάντες / Πορτοφόλια" },
  { icon: ShoppingBag, title: "eShop Κατάλογος",     desc: "Ανά κατηγορία, με τιμές και κουμπί επικοινωνίας για παραγγελία" },
  { icon: BookOpen,    title: "Blog",                 desc: "Ενότητα άρθρων για τάσεις κοσμημάτων — βοηθά στο organic SEO" },
  { icon: Languages,   title: "Δίγλωσσο",             desc: "Ελληνικά & Αγγλικά με εναλλαγή γλώσσας στο navbar" },
  { icon: Heart,       title: "Elegant Design",       desc: "Cream/gold παλέτα — ταιριάζει απόλυτα με τα κοσμήματα" },
  { icon: MapPin,      title: "Google Maps",           desc: "Ενσωματωμένος χάρτης για την τοποθεσία στο Μοσχάτο" },
  { icon: Phone,       title: "Click-to-Call",        desc: "Άμεση κλήση από κινητό — 210 4812651 / 693 246840" },
  { icon: Smartphone,  title: "Mobile-First",         desc: "Εμφανίζεται τέλεια σε κινητό — η κύρια συσκευή πελατών" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

export default function PortfolioRegalo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: e-regalo.gr — Κατασκευή eShop Κοσμημάτων | HiTech Doctor Web Design"
        description="Case study: Κατασκευή του e-regalo.gr — eShop κοσμημάτων & αξεσουάρ στο Μοσχάτο Αθήνα με SEO 96/100, Gallery φίλτρο, bilingual, LocalBusiness schema. Web Design από HiTech Doctor."
        keywords="regalo, κατασκευη eshop κοσμηματων, web design μοσχατο, seo κοσμηματα, portfolio web designer αθηνα"
        url="https://hitechdoctor.com/portfolio/regalo-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "e-regalo.gr — eShop Κοσμημάτων & Αξεσουάρ",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://e-regalo.gr",
          "description": "eShop κοσμημάτων και αξεσουάρ στο Μοσχάτο Αττικής",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #0a0806 0%, #150e06 50%, #0a0703 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">e-regalo.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest">
                  Πραγματικό Έργο
                </Badge>
                <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-widest">
                  eShop
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                e-regalo.gr
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Ηλεκτρονικό κατάστημα κοσμημάτων & αξεσουάρ</strong> στο Μοσχάτο Αθήνας.
                Elegant cream/gold design με eShop, φωτογραφική Gallery με φίλτρα και Blog.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Δίγλωσσο (Ελληνικά / Αγγλικά), βελτιστοποιημένο για mobile και social media sharing.
                LocalBusiness + Product Schema για εμφάνιση στη Google με τιμές.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://e-regalo.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #c49a45, #e8c06a)", color: "#1a0f00", boxShadow: "0 0 20px rgba(196,154,69,0.3)" }}
                    data-testid="button-regalo-visit"
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

            {/* Lighthouse scores */}
            <div className="p-6 rounded-3xl border border-amber-500/15"
              style={{ background: "rgba(196,154,69,0.04)" }}>
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

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Cream και gold παλέτα που αναδεικνύει τα κοσμήματα.
              Elegant cursive typography στο λογότυπο — ξεχωρίζει από τον ανταγωνισμό.
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
                    <span className="text-[9px] text-muted-foreground/60 font-mono">e-regalo.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`e-regalo.gr — ${page.title}`}
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
              Παρόλο που το site φορτώνει <strong className="text-foreground">δεκάδες φωτογραφίες κοσμημάτων</strong>,
              παραμένει εντός των Google green zones με lazy loading και Cloudflare CDN.
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
              <p className="text-sm font-bold text-amber-300 mb-1">Πρόκληση: Site με πολλές εικόνες</p>
              <p className="text-xs text-amber-100/70 leading-relaxed">
                Τα eShop με φωτογραφίες προϊόντων είναι δύσκολα να παραμείνουν γρήγορα.
                Χρησιμοποιούμε <strong className="text-amber-400">lazy loading</strong>, WebP format και CDN caching
                ώστε κάθε εικόνα φορτώνει μόνο όταν ο χρήστης πλοηγηθεί προς αυτήν.
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
              Ένα online κατάστημα απαιτεί αυξημένη ασφάλεια — οι πελάτες πρέπει να νιώθουν ασφαλείς.
              Καμία αποθήκευση στοιχείων καρτών.
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
              Lighthouse SEO <strong className="text-foreground">96/100</strong>. Στοχεύουμε αναζητήσεις κοσμημάτων
              και αξεσουάρ στην Αττική — τοπικό SEO και Product Schema για εμφάνιση τιμών στη Google.
            </p>
          </div>

          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Λέξεις-κλειδιά στόχος</p>
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
              Χειροποίητος κώδικας χωρίς WordPress. Το αποτέλεσμα: ελαφρύτερο site,
              καλύτερα scores και πλήρης έλεγχος εμφάνισης για να ταιριάζει με το brand.
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

        {/* ── Store info ────────────────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-amber-500/15 bg-amber-500/4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500/60 mb-5">Πληροφορίες Καταστήματος</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Phone,   label: "Τηλέφωνο",     value: "210 4812651" },
              { icon: Phone,   label: "Κινητό",        value: "693 246840" },
              { icon: Mail,    label: "Email",          value: "info@regalo.gr" },
              { icon: MapPin,  label: "Διεύθυνση",     value: "Στρ. Μακρυγιάννη 109, Μοσχάτο 183 45" },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <c.icon className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">{c.label}</p>
                  <p className="text-xs text-foreground/80 mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-amber-500/20"
          style={{ background: "linear-gradient(135deg, rgba(196,154,69,0.06) 0%, rgba(139,92,246,0.04) 100%)" }}
        >
          <ShoppingBag className="w-12 h-12 text-amber-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(196,154,69,0.4))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε eShop και εταιρικά sites για επιχειρήσεις στην Αθήνα —
            με elegant design, SEO και ταχύτητα που φέρνει πελάτες από Google.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #c49a45, #e8c06a)", color: "#1a0f00", boxShadow: "0 0 24px rgba(196,154,69,0.3)" }}
                data-testid="button-regalo-cta-email"
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
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-amber-400 transition-colors">
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
