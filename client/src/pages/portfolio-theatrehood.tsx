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
  Theater, Users, Star, Calendar, ImageIcon,
  Music, BookOpen, Video,
} from "lucide-react";
import screenshotHero       from "@assets/Screenshot_2026-03-11_at_13.38.01_1773229141428.png";
import screenshotVision     from "@assets/Screenshot_2026-03-11_at_13.38.18_1773229141428.png";
import screenshotServices   from "@assets/Screenshot_2026-03-11_at_13.38.31_1773229141429.png";
import screenshotProductions from "@assets/Screenshot_2026-03-11_at_13.38.45_1773229141429.png";

const LIGHTHOUSE = [
  { label: "Performance",    score: 89, color: "#f97316" },
  { label: "SEO",            score: 94, color: "#f97316" },
  { label: "Accessibility",  score: 88, color: "#f97316" },
  { label: "Best Practices", score: 92, color: "#f97316" },
];

const VITALS = [
  { metric: "FCP",  value: "1.3s",  label: "First Contentful Paint",   status: "good", icon: Eye },
  { metric: "LCP",  value: "2.5s",  label: "Largest Contentful Paint", status: "good", icon: Gauge },
  { metric: "CLS",  value: "0.02",  label: "Cumulative Layout Shift",  status: "good", icon: Layers },
  { metric: "FID",  value: "22ms",  label: "First Input Delay",        status: "good", icon: Zap },
  { metric: "TTFB", value: "0.7s",  label: "Time to First Byte",       status: "good", icon: Server },
  { metric: "TTI",  value: "2.1s",  label: "Time to Interactive",      status: "good", icon: Clock },
];

const SEO_KEYWORDS = [
  "θεατρική σχολή αθήνα",
  "θεατρικό εργαστήρι ενηλίκων",
  "εφηβική θεατρική ομάδα",
  "theatrehood",
  "θεατρικά μαθήματα αθήνα",
  "theatre school athens",
  "παιδικό θεατρικό παιχνίδι",
  "παραστάσεις αθήνα",
];

const PAGES = [
  { path: "/", title: "Αρχική Hero", desc: "Full-bleed dramatic photo, «THEATRE HOOD» bold heading, tagline με τη φιλοσοφία της κουκούλας, CTA «Ξεκίνα ένα μάθημα»", screenshot: screenshotHero },
  { path: "/sxetika", title: "Όραμα & Αποστολή", desc: "«Το όραμά μου» + «Η αποστολή μου» — δύο εντυπωσιακές κάρτες με orange gradient και φωτογραφίες εργαστηρίων", screenshot: screenshotVision },
  { path: "/ypiresies", title: "Υπηρεσίες", desc: "3 υπηρεσίες: Εφηβική ομάδα, Εργαστήρι Ενηλίκων (orange gradient CTA), Παιδικό Θεατρικό Παιχνίδι", screenshot: screenshotServices },
  { path: "/parastaseis", title: "Παραστάσεις", desc: "Gallery παραστάσεων — «Ανάμεσα στο Ναι και το Όχι 2024», φωτογραφίες από σκηνές, dramatic lighting", screenshot: screenshotProductions },
];

const TECH_STACK = [
  { name: "HTML5 / CSS3",    desc: "Full-bleed dark design, orange gradient cards, dramatic typography — stage-inspired aesthetic", icon: FileCode,   color: "text-orange-400" },
  { name: "JavaScript ES6+", desc: "Smooth scroll, sticky nav, responsive gallery παραστάσεων",                                    icon: Code2,      color: "text-yellow-300" },
  { name: "Custom Design",   desc: "Χειροποίητος κώδικας — η σκηνοθεσία του web design, χωρίς WordPress templates",               icon: Layers,     color: "text-orange-400" },
  { name: "Social Media",    desc: "Facebook, Instagram, LinkedIn icons ενσωματωμένα στο navbar — direct social links",           icon: Globe,      color: "text-orange-400" },
  { name: "SSL / HTTPS",     desc: "Κρυπτογραφημένη σύνδεση, HTTPS enforced σε όλες τις σελίδες",                                icon: Lock,       color: "text-orange-400" },
  { name: "Mobile-First",    desc: "Πλήρως responsive — οι ηθοποιοί ψάχνουν μαθήματα από κινητό",                                icon: Smartphone, color: "text-orange-400" },
];

const SEO_FEATURES = [
  { title: "LocalBusiness Schema",   desc: "JSON-LD τύπου TheaterGroup + EducationalOrganization — εμφανίζεται σε Google Rich Results.", icon: MapPin },
  { title: "Event Schema",           desc: "Κάθε παράσταση ως Event Schema με ημερομηνία, τόπο, τίτλο — εμφανίζεται ως event στη Google.", icon: Calendar },
  { title: "SEO 94/100",             desc: "Lighthouse SEO score 94 — βελτιστοποιημένα meta tags, headings ιεραρχία, alt texts σε όλες τις φωτογραφίες.", icon: Search },
  { title: "OpenGraph / Social",     desc: "Θεατρικά preview cards όταν κοινοποιείται σε Facebook/Instagram — κρίσιμο για word-of-mouth.", icon: Globe },
  { title: "Unique Meta per Page",   desc: "Κάθε υπηρεσία (Εφηβική ομάδα, Ενηλίκων, Παιδιά) έχει δικό SEO title + description.", icon: FileCode },
  { title: "Core Web Vitals",        desc: "LCP 2.5s παρά τις πολλές φωτογραφίες παραστάσεων — lazy loading + βελτιστοποιημένα images.", icon: Gauge },
  { title: "Social Media Links",     desc: "Facebook, Instagram, LinkedIn στο navbar — ενισχύει το social signal για SEO.", icon: Star },
  { title: "Image Alt Texts",        desc: "Κάθε θεατρική φωτογραφία έχει descriptive alt text — SEO + accessibility.", icon: ImageIcon },
];

const SECURITY = [
  { title: "SSL Certificate A+",       desc: "HTTPS enforced — εμπιστοσύνη από υποψήφιους ηθοποιούς που δίνουν τα στοιχεία τους.", icon: Lock },
  { title: "HTTPS Redirects",          desc: "Αυτόματη ανακατεύθυνση HTTP → HTTPS σε κάθε σελίδα.", icon: Shield },
  { title: "Δεν χρησιμοποιεί WordPress", desc: "Custom κώδικας — μηδέν plugin vulnerabilities, γρηγορότερο loading.", icon: Shield },
  { title: "Security Headers",         desc: "CSP, X-Frame-Options, X-Content-Type-Options — προστασία από κοινές επιθέσεις.", icon: Code2 },
  { title: "GDPR Privacy",             desc: "Privacy Policy για δεδομένα επικοινωνίας — συμμόρφωση με ευρωπαϊκή νομοθεσία.", icon: CheckCircle2 },
  { title: "Cloudflare Protection",    desc: "DDoS protection, CDN — γρήγορη φόρτωση θεατρικών φωτογραφιών.", icon: Server },
];

const EXTRAS = [
  { icon: Theater,   title: "Παραστάσεις Gallery",  desc: "Dedicated σελίδα παραστάσεων με φωτογραφίες σκηνών και 2024 productions" },
  { icon: Users,     title: "3 Τμήματα Υπηρεσιών",  desc: "Εφηβική ομάδα, Εργαστήρι Ενηλίκων, Παιδικό Θεατρικό" },
  { icon: BookOpen,  title: "Όραμα & Αποστολή",      desc: "Dedicated section για τη φιλοσοφία — Αλήθεια, Έμπνευση, Συνεργασία" },
  { icon: Globe,     title: "Social Media Nav",       desc: "Facebook, Instagram, LinkedIn icons στο navbar" },
  { icon: Mail,      title: "CTA Επικοινωνία",        desc: "Prominently placed email CTA button στο navbar" },
  { icon: Calendar,  title: "2024 Productions",       desc: "«Ανάμεσα στο Ναι και το Όχι» — με photos & χρονιά" },
  { icon: ImageIcon, title: "Dramatic Photography",   desc: "Full-bleed theater photos με stage lighting" },
  { icon: Star,      title: "Hood Philosophy",        desc: "Unique brand story — «Hood... δηλαδή κουκούλα»" },
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

export default function PortfolioTheatreHood() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Portfolio: theatrehood.gr — Κατασκευή Site Θεατρικής Σχολής | HiTech Doctor"
        description="Case study: Κατασκευή του theatrehood.gr — dramatic dark design για θεατρική σχολή. SEO 94/100, Event Schema παραστάσεων, 3 υπηρεσίες, gallery παραστάσεων. Web Design από HiTech Doctor."
        keywords="theatrehood, κατασκευη site θεατρου, web design θεατρικη σχολη, seo θεατρο αθηνα"
        url="https://hitechdoctor.com/portfolio/theatrehood-gr"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "theatrehood.gr — Θεατρική Σχολή",
          "author": { "@type": "Organization", "name": "HiTech Doctor" },
          "url": "https://theatrehood.gr",
          "description": "Site θεατρικής σχολής με εφηβική ομάδα, εργαστήρι ενηλίκων και παιδικό θεατρικό παιχνίδι",
        })}</script>
      </Helmet>

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #0e0500 0%, #1a0a00 50%, #0e0500 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/web-designer" className="hover:text-primary transition-colors">Web Designer</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">theatrehood.gr</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold uppercase tracking-widest">Πραγματικό Έργο</Badge>
                <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold uppercase tracking-widest">Θεατρική Σχολή</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-4">
                theatrehood<span className="text-orange-400">.gr</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                <strong className="text-white">«Hood... δηλαδή κουκούλα»</strong> — θεατρική σχολή για εφήβους,
                ενηλίκους και παιδιά. Αλήθεια, Έμπνευση, Συνεργασία. Παραστάσεις 2024.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Dramatic full-bleed dark design με orange stage lighting, gallery παραστάσεων,
                social media στο navbar (Facebook, Instagram, LinkedIn) — το site ως σκηνή.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://theatrehood.gr" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-11 px-6 font-bold border-0 gap-2"
                    style={{ background: "linear-gradient(135deg, #c2410c, #f97316)", color: "#fff", boxShadow: "0 0 20px rgba(249,115,22,0.35)" }}
                    data-testid="button-theatrehood-visit"
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

            <div className="p-6 rounded-3xl border border-orange-500/15"
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
                <Theater className="w-4 h-4 text-orange-400 shrink-0" />
                <p className="text-xs text-orange-300">
                  <strong>Event Schema</strong> — παραστάσεις εμφανίζονται ως events στη Google
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
              Dark dramatic design με orange/amber stage lighting — σαν να κοιτάς τη σκηνή
              από την πλατεία. Κάθε σελίδα είναι μια ξεχωριστή πράξη.
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
                    <span className="text-[9px] text-muted-foreground font-mono">theatrehood.gr{page.path}</span>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={page.screenshot}
                    alt={`theatrehood.gr — ${page.title}`}
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
              Site με πλούσιες θεατρικές φωτογραφίες — παραμένει γρήγορο χάρη σε
              <strong className="text-foreground"> βελτιστοποιημένα images</strong> και lazy loading.
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
              <p className="text-sm font-bold text-orange-300 mb-1">Φωτογραφίες παραστάσεων χωρίς να χάνεται η ταχύτητα</p>
              <p className="text-xs text-orange-100/70 leading-relaxed">
                Theatrical photography με high-res images — με lazy loading και βελτιστοποίηση
                το LCP παραμένει <strong className="text-orange-400">2.5s</strong>. Οι υποψήφιοι σπουδαστές βλέπουν
                τις παραστάσεις χωρίς αναμονή.
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
              Θεατρική σχολή που δέχεται εγγραφές — η ασφάλεια των προσωπικών δεδομένων
              είναι <strong className="text-foreground">απαραίτητη</strong>.
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
              Lighthouse SEO <strong className="text-foreground">94/100</strong> με <strong className="text-foreground">Event Schema</strong> —
              οι παραστάσεις εμφανίζονται ως events απευθείας στη Google Search.
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
              Custom χειροποίητος κώδικας — ο σκηνοθέτης δεν χρησιμοποιεί έτοιμα σενάρια.
              Κάθε γραμμή κώδικα γράφτηκε για το TheatreHood.
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

        {/* ── Productions spotlight ────────────────────────────────────── */}
        <div className="p-6 rounded-3xl border border-orange-500/20"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(124,58,237,0.04) 100%)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
              <Theater className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Παραστάσεις — Event Schema</h3>
              <p className="text-xs text-muted-foreground">Κάθε παράσταση εμφανίζεται στη Google ως Event</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { year: "2024", title: "Ανάμεσα στο Ναι και το Όχι", desc: "Η πιο πρόσφατη παράσταση της ομάδας" },
              { year: "Εφηβική", title: "Εφηβική Θεατρική Ομάδα", desc: "Για εφήβους που θέλουν να ανακαλύψουν το θέατρο" },
              { year: "Ενηλίκων", title: "Εργαστήρι Ενηλίκων", desc: "«Η μαγική χημεία ξεκινάει από το κίνητρο του ενήλικα»" },
            ].map((a) => (
              <div key={a.title} className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{a.year}</span>
                <p className="text-sm font-bold text-white mt-1 mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-10 text-center border border-orange-500/20"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(124,58,237,0.05) 100%)" }}
        >
          <Theater className="w-12 h-12 text-orange-400 mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 12px rgba(249,115,22,0.5))" }} />
          <h2 className="text-3xl font-display font-extrabold text-white mb-3">
            Θέλετε Κάτι Παρόμοιο;
          </h2>
          <p className="text-sm text-muted-foreground mb-7 max-w-lg mx-auto leading-relaxed">
            Φτιάχνουμε sites για θεατρικές σχολές, πολιτιστικούς φορείς και καλλιτέχνες —
            dramatic design, Event Schema, social media integration, SEO 90+.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:info@hitechdoctor.com">
              <Button
                className="h-12 px-8 font-bold border-0 text-base"
                style={{ background: "linear-gradient(135deg, #c2410c, #f97316)", boxShadow: "0 0 24px rgba(249,115,22,0.35)" }}
                data-testid="button-theatrehood-cta"
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
