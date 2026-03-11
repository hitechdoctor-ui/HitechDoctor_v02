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
  ChevronRight, Lock, Server, Code2,
  BarChart3, MapPin, Clock, ArrowRight, Gauge,
  FileCode, Layers, Eye, Mail, Phone,
  Image, BookOpen, MessageSquare, Languages,
  Heart, Church,
} from "lucide-react";
import screenshotHero    from "@assets/Screenshot_2026-03-11_at_13.43.59_1773229485038.png";
import screenshotAbout   from "@assets/Screenshot_2026-03-11_at_13.44.09_1773229485038.png";
import screenshotInside  from "@assets/Screenshot_2026-03-11_at_13.44.20_1773229485038.png";
import screenshotContact from "@assets/Screenshot_2026-03-11_at_13.44.35_1773229485038.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 94, color: "#c0856a" },
  { label: "SEO",            score: 96, color: "#c0856a" },
  { label: "Accessibility",  score: 89, color: "#c0856a" },
  { label: "Best Practices", score: 92, color: "#c0856a" },
];

const VITALS = [
  { metric: "FCP",  value: "1.0s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.4s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.02",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "12ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.4s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "1.5s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const PAGES = [
  {
    path: "/",
    title: "Hero — Αεροφωτογραφία Ναού",
    desc: "Full-width aerial drone shot, serif τίτλος «ΙΕΡΟΣ ΝΑΟΣ ΜΕΤΑΜΟΡΦΩΣΕΩΣ ΤΟΥ ΣΩΤΗΡΟΣ ΜΟΣΧΑΤΟΥ», subtitle «Η Εκκλησία στο κέντρο της πόλης»",
    screenshot: screenshotHero,
  },
  {
    path: "/ekklisia",
    title: "Η Εκκλησία μας — Ιστορία",
    desc: "Ιστορία από τον 19ο αιώνα, κυκλικές φωτογραφίες (εξωτερικό, κεριά, εσωτερικό), serif typography, cream background",
    screenshot: screenshotAbout,
  },
  {
    path: "/ekklisia/entos",
    title: "Εντός του Ναού — Gallery",
    desc: "Full-width interior photo με overlay «Εντός του Ναού», terracotta CTA «Περισσότερα», dark navy footer section",
    screenshot: screenshotInside,
  },
  {
    path: "/epikoinonia",
    title: "Επικοινωνία + Χάρτης",
    desc: "Contact form (Name, Email, Phone, Message, SEND NOW), «Our Locations» Google Maps, bilingual EN/GR interface",
    screenshot: screenshotContact,
  },
];

const SEO_KEYWORDS = [
  "μεταμόρφωση σωτήρος μοσχάτο",
  "ιερός ναός μοσχάτο",
  "εκκλησία μοσχάτο",
  "metamorfosi-moschato.gr",
  "ναός μεταμορφώσεως μοσχάτου",
  "θεία λειτουργία μοσχάτο",
  "ακολουθίες μοσχάτο",
];

const SEO_FEATURES = [
  { title: "Place of Worship Schema",    desc: "Church JSON-LD: Ιερός Ναός, Μοσχάτο, ώρες λατρείας, τηλέφωνο — εμφανίζεται στη Google ως επίσημος τόπος λατρείας.", icon: MapPin },
  { title: "SEO 96/100",                 desc: "Υψηλότατο score για ναό — meta titles, descriptions, headings, alt texts βελτιστοποιημένα για τοπικές αναζητήσεις.", icon: Search },
  { title: "Image SEO",                  desc: "Αεροφωτογραφία και εσωτερικό ναού με σωστά alt texts — εμφανίζεται στη Google Images για τοπικές αναζητήσεις.", icon: Image },
  { title: "Google Maps Integration",    desc: "«Our Locations» embed — ο επισκέπτης βλέπει απευθείας πού βρίσκεται ο ναός, χωρίς να ψάξει αλλού.", icon: MapPin },
  { title: "Contact Form + Email",       desc: "Φόρμα επικοινωνίας για ενορίτες — βαπτίσεις, γάμοι, κηδείες, ιεροτελεστίες.", icon: MessageSquare },
  { title: "Local SEO Μοσχάτο",         desc: "Βελτιστοποίηση για «εκκλησία Μοσχάτο», «ναός Μοσχάτο» — εμφανίζεται πρώτος σε Google Maps αναζητήσεις.", icon: Globe },
];

const SECURITY = [
  { title: "SSL Certificate A+",      desc: "HTTPS enforced — επαγγελματική παρουσία και εμπιστοσύνη για έναν θρησκευτικό οργανισμό.", icon: Lock },
  { title: "GDPR Privacy",            desc: "Privacy Policy για δεδομένα που συλλέγονται μέσω της φόρμας επικοινωνίας.", icon: Shield },
  { title: "Security Headers",        desc: "CSP, X-Frame-Options, HSTS headers — προστασία από cross-site attacks.", icon: Code2 },
  { title: "Clean Custom Code",       desc: "Χωρίς WordPress plugin vulnerabilities — καθαρός κώδικας, ελάχιστη επιφάνεια επίθεσης.", icon: Shield },
  { title: "Uptime Monitoring",       desc: "24/7 uptime monitoring — η σελίδα είναι πάντα online για τους ενορίτες.", icon: Clock },
  { title: "Backup",                  desc: "Αυτόματα backups — ιστορικό και φωτογραφικό υλικό ναού πάντα ασφαλές.", icon: Server },
];

const TECH_STACK = [
  { name: "Serif Typography",    desc: "Elegant display font για ecclesiastical dignity — αντικατοπτρίζει τον παραδοσιακό χαρακτήρα του ναού.", icon: FileCode, color: "text-amber-700" },
  { name: "Light Cream Design",  desc: "Warm cream #faf8f4 background — καθαρό, ανάλαφρο, σεβαστό — αντίθεση με σκοτεινά dark mode sites.", icon: Image,    color: "text-amber-700" },
  { name: "CSS Animations",      desc: "Subtle fade-in animations για φωτογραφίες — μη επιθετικές, ταιριαστές με τον θρησκευτικό χαρακτήρα.", icon: Zap,      color: "text-amber-700" },
  { name: "Google Maps Embed",   desc: "Live χάρτης «Our Locations» — άμεση πλοήγηση για επισκέπτες.", icon: MapPin,   color: "text-amber-700" },
  { name: "Contact Form",        desc: "Φόρμα επικοινωνίας — Name, Email, Phone, Message — SEND NOW.", icon: Mail,     color: "text-amber-700" },
  { name: "Responsive Design",   desc: "100% mobile responsive — ενορίτες βλέπουν ωράρια και ακολουθίες από κινητό.", icon: Layers,   color: "text-amber-700" },
];

const EXTRAS = [
  { icon: BookOpen,     title: "Ιστορία Ναού",        desc: "Σελίδα ιστορίας από τον 19ο αιώνα με κυκλικές φωτογραφίες" },
  { icon: Image,        title: "Photo Gallery",        desc: "Εσωτερικό & εξωτερικό ναού με κυκλικό cropping" },
  { icon: MapPin,       title: "Google Maps Locations", desc: "«Our Locations» embed για άμεση πλοήγηση" },
  { icon: MessageSquare,title: "Contact Form",          desc: "Name, Email, Phone, Message, SEND NOW" },
  { icon: Languages,    title: "Bilingual Interface",   desc: "Μεικτό GR/EN interface για διεθνείς επισκέπτες" },
  { icon: Church,       title: "Dropdown Navigation",   desc: "«Η Εκκλησία» dropdown menu — Ιστορία, Εντός Ναού" },
  { icon: Heart,        title: "Κυκλικές Εικόνες",     desc: "Circular image treatment — σύγχρονο αλλά διαχρονικό" },
  { icon: Globe,        title: "SEO Τοπικό",            desc: "Local SEO για ανορίτες Μοσχάτου που ψάχνουν ακολουθίες" },
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

export default function PortfolioMetamorfosi() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: metamorfosi-moschato.gr — Κατασκευή Site Ιερός Ναός | HiTech Doctor"
        description="Case study: metamorfosi-moschato.gr — Ιερός Ναός Μεταμορφώσεως του Σωτήρος Μοσχάτου. SEO 96/100, Place of Worship Schema, Google Maps, Contact Form. Web Design από HiTech Doctor."
        keywords="metamorfosi moschato, ιερος ναος ιστοσελιδα, web design εκκλησια, κατασκευη site μοσχατο, seo εκκλησια"
        url="https://hitechdoctor.com/portfolio/metamorfosi-moschato-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "metamorfosi-moschato.gr — Ιερός Ναός Μεταμορφώσεως Μοσχάτου",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://metamorfosi-moschato.gr",
          "description": "Site Ιερού Ναού — elegant cream/navy design, Place of Worship Schema, Google Maps, Contact Form",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #0d1929 0%, #1a2e4a 50%, #0d1929 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">metamorfosi-moschato.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-amber-700/20 text-amber-300 border border-amber-700/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-blue-900/40 text-blue-300 border border-blue-700/30 text-[10px] font-bold uppercase tracking-widest">Ιερός Ναός</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                metamorfosi<span style={{ color: "#c0856a" }}>-moschato.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">Ιερός Ναός Μεταμορφώσεως του Σωτήρος Μοσχάτου</strong> —
                «Η Εκκλησία στο κέντρο της πόλης». Elegant cream/navy design, αεροφωτογραφία hero.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Serif typography, κυκλικές φωτογραφίες, terracotta accents, Google Maps,
                contact form, Place of Worship Schema για εμφάνιση στη Google.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href="https://metamorfosi-moschato.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #9a5a3e, #c0856a)", color: "#fff", boxShadow: "0 0 20px rgba(192,133,106,0.35)" }}
                    data-testid="button-metamorfosi-visit"
                  >
                    <Globe className="w-4 h-4" />
                    Επισκεφθείτε το site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <a href="mailto:info@hitechdoctor.com">
                  <Button variant="outline" className="h-11 px-5 border-white/20 hover:border-amber-700/40 gap-2">
                    <Mail className="w-4 h-4" />
                    Ζητήστε Προσφορά
                  </Button>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-amber-700/20"
              style={{ background: "rgba(192,133,106,0.05)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-5 text-center">
                Google Lighthouse Scores
              </p>
              <div className="grid grid-cols-4 gap-4">
                {LIGHTHOUSE.map((s) => (
                  <ScoreCircle key={s.label} score={s.score} color={s.color} label={s.label} />
                ))}
              </div>
              <div className="mt-5 p-3 rounded-xl border border-amber-700/25 bg-amber-700/6 flex items-center gap-2">
                <Church className="w-4 h-4 shrink-0" style={{ color: "#c0856a" }} />
                <p className="text-xs" style={{ color: "#c0856a" }}>
                  <strong>Place of Worship Schema</strong> — εμφανίζεται σε Google ως επίσημος τόπος λατρείας
                </p>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-3">Μετρήθηκε με Google Lighthouse · Desktop mode</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 max-w-6xl py-14 space-y-20">

        {/* ── Screenshots ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>Σελίδες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Εμφάνιση & Σχεδιασμός</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ζεστό cream background (#faf8f4), deep navy τίτλοι, terracotta accents —
              σύγχρονο αλλά με reverential dignity που αρμόζει σε Ιερό Ναό.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PAGES.map((page) => (
              <div key={page.path} className="group rounded-3xl border border-white/8 overflow-hidden bg-card/40 hover:border-amber-700/25 transition-all">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                  <div className="flex-1 mx-3 h-5 rounded bg-white/6 flex items-center px-2 gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-muted-foreground/60 font-mono">metamorfosi-moschato.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`metamorfosi-moschato.gr — ${page.title}`}
                    className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ maxHeight: "280px" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-white/6">
                  <span className="text-xs font-mono" style={{ color: "#c0856a", opacity: 0.7 }}>{page.path || "/"}</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{page.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{page.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Design contrast note */}
          <div className="mt-6 p-5 rounded-2xl border border-white/8 bg-card/40 flex items-start gap-4">
            <Image className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#c0856a" }} />
            <div>
              <p className="text-sm font-bold text-white mb-1">Light Mode Design — Σκόπιμη Επιλογή</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ο Ιερός Ναός επέλεξε <strong className="text-foreground">cream/white design</strong> αντί για dark mode.
                Δίνει αίσθηση αγνότητας και παράδοσης. Ο serif τίτλος «ΙΕΡΟΣ ΝΑΟΣ» σε bold λευκό πάνω από αεροφωτογραφία
                δημιουργεί άμεσο impact. Τα terracotta CTAs θυμίζουν βυζαντινά χρώματα.
              </p>
            </div>
          </div>
        </div>

        {/* ── Core Web Vitals ────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>Ταχύτητα</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Core Web Vitals & Performance</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Παρά τη μεγάλη αεροφωτογραφία hero και τις πολλές εικόνες ναού —
              <strong className="text-foreground"> FCP 1.0s</strong>, σχεδόν στιγμιαία φόρτωση.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {VITALS.map((v) => (
              <div key={v.metric} className="p-5 rounded-2xl border border-white/8 bg-card/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <v.icon className="w-4 h-4" style={{ color: "#c0856a" }} />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{v.metric}</span>
                  </div>
                  <VitalBadge status={v.status} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border border-amber-700/20 flex items-start gap-4"
            style={{ background: "rgba(192,133,106,0.05)" }}>
            <BarChart3 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#c0856a" }} />
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: "#c0856a" }}>Γιατί η ταχύτητα έχει σημασία για εκκλησία</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ο ενορίτης ψάχνει <strong className="text-foreground">ωράρια λειτουργιών</strong> την τελευταία στιγμή από κινητό.
                FCP 1.0s σημαίνει ότι βλέπει τηλέφωνο και τοποθεσία σε &lt;1 δευτερόλεπτο.
              </p>
            </div>
          </div>
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>Ασφάλεια</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Επίπεδο Ασφάλειας</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Ιερός Ναός που συλλέγει στοιχεία πιστών μέσω φόρμας —
              <strong className="text-foreground"> η ασφάλεια και GDPR είναι υποχρέωση</strong>.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s) => (
              <div key={s.title} className="p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-700/20 transition-all">
                <div className="w-9 h-9 rounded-xl border border-amber-700/25 flex items-center justify-center mb-3"
                  style={{ background: "rgba(192,133,106,0.10)" }}>
                  <s.icon className="w-4 h-4" style={{ color: "#c0856a" }} />
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
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>SEO</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Βελτιστοποίηση Google</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Lighthouse SEO <strong className="text-foreground">96/100</strong> — ο ναός εμφανίζεται
              πρώτος στη Google για «εκκλησία Μοσχάτο», «ναός Μοσχάτο», «λειτουργίες Μοσχάτο».
            </p>
          </div>
          <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-card/40">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Λέξεις-κλειδιά στόχος</p>
            <div className="flex flex-wrap gap-2">
              {SEO_KEYWORDS.map((kw) => (
                <div key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-700/25 text-xs font-medium"
                  style={{ background: "rgba(192,133,106,0.08)", color: "#c0856a" }}>
                  <Search className="w-2.5 h-2.5" />
                  {kw}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-700/20 transition-all">
                <div className="w-9 h-9 rounded-xl border border-amber-700/25 flex items-center justify-center shrink-0"
                  style={{ background: "rgba(192,133,106,0.10)" }}>
                  <f.icon className="w-4 h-4" style={{ color: "#c0856a" }} />
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
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>Τεχνολογίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Πώς Είναι Φτιαγμένο</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Custom κώδικας, χωρίς WordPress — ελαφρύ, γρήγορο, ασφαλές.
              Το design επιλέχθηκε για να αντικατοπτρίζει την ιστορία και τη σοβαρότητα του ναού.
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

        {/* ── Extra features ─────────────────────────────────────────────── */}
        <div>
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#c0856a" }}>Λειτουργίες</p>
            <h2 className="text-3xl font-display font-extrabold text-foreground mb-2">Ειδικά Χαρακτηριστικά</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXTRAS.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl border border-white/8 bg-card/40 hover:border-amber-700/20 transition-all">
                <f.icon className="w-4 h-4 mb-2" style={{ color: "#c0856a" }} />
                <h3 className="text-xs font-bold text-white mb-1">{f.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Unique aspect callout ───────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-amber-700/20"
          style={{ background: "linear-gradient(135deg, rgba(192,133,106,0.06) 0%, rgba(26,46,74,0.4) 100%)" }}>
          <div className="flex items-start gap-4">
            <Church className="w-8 h-8 shrink-0 mt-1" style={{ color: "#c0856a" }} />
            <div>
              <h3 className="text-lg font-display font-extrabold text-white mb-2">
                Μοναδική Κατηγορία — Θρησκευτικός Οργανισμός
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Η ιστοσελίδα ενός ναού απαιτεί εντελώς διαφορετική προσέγγιση από ένα εμπορικό site.
                Ο σχεδιασμός πρέπει να εμπνέει <strong className="text-foreground">εμπιστοσύνη, ιερότητα και ηρεμία</strong> —
                όχι επιθετικά CTAs ή flash animations.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Serif fonts — παράδοση",
                  "Cream background — αγνότητα",
                  "Terracotta CTAs — βυζαντινός χαρακτήρας",
                  "Αεροφωτογραφία — μεγαλείο",
                  "Κυκλικές εικόνες — αρμονία",
                ].map((item) => (
                  <span key={item} className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-amber-700/25"
                    style={{ background: "rgba(192,133,106,0.08)", color: "#c0856a" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-amber-700/20"
          style={{ background: "linear-gradient(135deg, rgba(192,133,106,0.07) 0%, rgba(26,46,74,0.5) 100%)" }}
        >
          <Church className="w-12 h-12 mx-auto mb-4" style={{ color: "#c0856a", filter: "drop-shadow(0 0 12px rgba(192,133,106,0.5))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Site για τον Οργανισμό σας;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε sites για εκκλησίες, συλλόγους, μη κερδοσκοπικούς οργανισμούς —
            με σεβασμό στη φύση της κάθε οργάνωσης.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #9a5a3e, #c0856a)", boxShadow: "0 0 24px rgba(192,133,106,0.35)" }}
                data-testid="button-metamorfosi-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                info@hitechdoctor.com
              </Button>
            </a>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-amber-700/30 hover:border-amber-700 gap-2" style={{ color: "#c0856a" }}>
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="mt-5">
            <Link href="/web-designer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-amber-600 transition-colors">
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
